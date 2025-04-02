#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from bson import ObjectId

from pymongo import MongoClient, DESCENDING, ASCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, SearchResult
from neo4j import GraphDatabase

from config.config import Config
from storage.models import Content, UserConfig, Relationship, VectorEmbedding

logger = logging.getLogger(__name__)


class DatabaseManager:
    """数据库管理器，统一管理三种不同类型的数据库连接"""
    
    def __init__(self, config: Config):
        """初始化数据库连接"""
        db_config = config.get_database_config()
        
        # MongoDB连接
        self.mongo_client = MongoClient(db_config['mongo_uri'])
        self.db: Database = self.mongo_client.personal_assistant
        self.contents: Collection = self.db.contents
        self.user_configs: Collection = self.db.user_configs
        
        # 创建索引
        self._create_mongodb_indexes()
        
        # Qdrant连接
        self.vector_db = QdrantClient(url=db_config['qdrant_url'])
        self._init_qdrant_collections()
        
        # Neo4j连接
        self.graph_db = GraphDatabase.driver(
            db_config['neo4j_uri'],
            auth=(db_config['neo4j_user'], db_config['neo4j_password'])
        )
        
        logger.info("数据库管理器初始化完成")
    
    def _create_mongodb_indexes(self):
        """为MongoDB创建必要的索引"""
        # 内容集合的索引
        self.contents.create_index([("title", "text"), ("processed_text", "text")])
        self.contents.create_index([("platform", ASCENDING), ("publish_time", DESCENDING)])
        self.contents.create_index("topics")
        self.contents.create_index("keywords")
        
        # 用户配置集合的索引
        self.user_configs.create_index("user_id", unique=True)
        self.user_configs.create_index("email")
        
        logger.info("MongoDB索引创建完成")
    
    def _init_qdrant_collections(self):
        """初始化Qdrant集合"""
        try:
            # 检查集合是否存在，不存在则创建
            collections = self.vector_db.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if "content_vectors" not in collection_names:
                # 创建内容向量集合，使用1536维 (OpenAI ada-002模型)
                self.vector_db.create_collection(
                    collection_name="content_vectors",
                    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
                )
                logger.info("Qdrant 'content_vectors'集合创建完成")
        except Exception as e:
            logger.error(f"初始化Qdrant集合失败: {e}")
    
    def store_content(self, content: Content) -> str:
        """存储内容到MongoDB"""
        content_dict = content.dict(exclude_none=True)
        
        # 如果没有id，自动生成
        if not content.id:
            result = self.contents.insert_one(content_dict)
            content_id = str(result.inserted_id)
            content.id = content_id
        else:
            content_id = content.id
            self.contents.replace_one({"_id": ObjectId(content_id)}, content_dict, upsert=True)
        
        logger.info(f"内容存储完成, ID: {content_id}")
        return content_id
    
    def store_vector(self, embedding: VectorEmbedding):
        """存储内容向量到Qdrant"""
        self.vector_db.upsert(
            collection_name="content_vectors",
            points=[
                PointStruct(
                    id=embedding.content_id,
                    vector=embedding.vector,
                    payload=embedding.payload
                )
            ]
        )
        logger.info(f"向量存储完成, 内容ID: {embedding.content_id}")
    
    def create_relation(self, relationship: Relationship):
        """在Neo4j中创建关系"""
        with self.graph_db.session() as session:
            # 确保源节点和目标节点存在
            session.run("""
                MERGE (s:Content {id: $source_id})
                MERGE (t:Content {id: $target_id})
            """, source_id=relationship.source_id, target_id=relationship.target_id)
            
            # 创建它们之间的关系
            properties_str = ", ".join([f"{k}: ${k}" for k in relationship.properties.keys()])
            if properties_str:
                properties_str = " {" + properties_str + "}"
            
            cypher = f"""
                MATCH (s:Content {{id: $source_id}}), (t:Content {{id: $target_id}})
                CREATE (s)-[r:{relationship.relation_type}{properties_str}]->(t)
                RETURN r
            """
            
            session.run(cypher, 
                source_id=relationship.source_id, 
                target_id=relationship.target_id,
                **relationship.properties
            )
            
            logger.info(f"关系创建完成: {relationship.source_id} --[{relationship.relation_type}]--> {relationship.target_id}")
    
    def get_content(self, content_id: str) -> Optional[Content]:
        """根据ID获取内容"""
        content_dict = self.contents.find_one({"_id": ObjectId(content_id)})
        if content_dict:
            content_dict["id"] = str(content_dict.pop("_id"))
            return Content(**content_dict)
        return None
    
    def search_contents(self, query: Dict[str, Any], limit: int = 20, skip: int = 0) -> List[Content]:
        """基于条件搜索内容"""
        cursor = self.contents.find(query).sort("publish_time", DESCENDING).skip(skip).limit(limit)
        
        results = []
        for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            results.append(Content(**doc))
        
        return results
    
    def text_search_contents(self, text_query: str, limit: int = 20) -> List[Content]:
        """基于文本搜索内容"""
        cursor = self.contents.find(
            {"$text": {"$search": text_query}}
        ).sort([("score", {"$meta": "textScore"})]).limit(limit)
        
        results = []
        for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            results.append(Content(**doc))
        
        return results
    
    def search_similar_vectors(self, vector: List[float], limit: int = 10) -> List[SearchResult]:
        """搜索相似向量"""
        results = self.vector_db.search(
            collection_name="content_vectors",
            query_vector=vector,
            limit=limit
        )
        return results
    
    def get_relations(self, content_id: str, relation_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取内容的关系"""
        with self.graph_db.session() as session:
            # 构建关系类型过滤条件
            relation_filter = ""
            if relation_type:
                relation_filter = f"type(r) = '{relation_type}'"
            
            # 查询所有出发的关系
            outgoing_query = f"""
                MATCH (s:Content {{id: $content_id}})-[r{relation_filter and '-[' + relation_filter + ']-' or ''}]->(t:Content)
                RETURN r, t
            """
            
            # 查询所有到达的关系
            incoming_query = f"""
                MATCH (s:Content {{id: $content_id}})<-[r{relation_filter and '-[' + relation_filter + ']-' or ''}]-(t:Content)
                RETURN r, t
            """
            
            # 执行查询
            outgoing_results = list(session.run(outgoing_query, content_id=content_id))
            incoming_results = list(session.run(incoming_query, content_id=content_id))
            
            # 处理结果
            relations = []
            
            for record in outgoing_results:
                relation = record["r"]
                target = record["t"]
                
                relations.append({
                    "direction": "outgoing",
                    "relation_type": type(relation).__name__,
                    "target_id": target["id"],
                    "properties": dict(relation)
                })
            
            for record in incoming_results:
                relation = record["r"]
                source = record["t"]  # 注意这里t其实是源节点
                
                relations.append({
                    "direction": "incoming",
                    "relation_type": type(relation).__name__,
                    "source_id": source["id"],
                    "properties": dict(relation)
                })
            
            return relations
    
    def store_user_config(self, user_config: UserConfig) -> str:
        """存储用户配置"""
        user_dict = user_config.dict(exclude_none=True)
        
        # 如果没有id，自动生成
        if not user_config.id:
            result = self.user_configs.insert_one(user_dict)
            user_id = str(result.inserted_id)
            user_config.id = user_id
        else:
            user_id = user_config.id
            self.user_configs.replace_one({"_id": ObjectId(user_id)}, user_dict, upsert=True)
        
        logger.info(f"用户配置存储完成, ID: {user_id}")
        return user_id
    
    def get_user_config(self, user_id: str) -> Optional[UserConfig]:
        """根据用户ID获取配置"""
        user_dict = self.user_configs.find_one({"user_id": user_id})
        if user_dict:
            user_dict["id"] = str(user_dict.pop("_id"))
            return UserConfig(**user_dict)
        return None
    
    def close(self):
        """关闭所有数据库连接"""
        self.mongo_client.close()
        # Qdrant客户端不需要明确关闭
        self.graph_db.close()
        logger.info("数据库连接已关闭") 