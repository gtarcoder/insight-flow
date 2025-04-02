from pymongo import MongoClient
from qdrant_client import QdrantClient
from neo4j import GraphDatabase
from config import MONGO_URI, QDRANT_URL, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

class StorageManager:
    def __init__(self):
        # 文档数据库连接
        self.mongo_client = MongoClient(MONGO_URI)
        self.content_db = self.mongo_client.personal_assistant.contents
        
        # 向量数据库连接
        self.vector_db = QdrantClient(url=QDRANT_URL)
        
        # 图数据库连接
        self.graph_db = GraphDatabase.driver(
            NEO4J_URI, 
            auth=(NEO4J_USER, NEO4J_PASSWORD)
        )
    
    def store_content(self, content_data):
        """存储内容到文档数据库"""
        return self.content_db.insert_one(content_data).inserted_id
    
    def store_vector(self, content_id, vector):
        """存储内容向量表示"""
        self.vector_db.upsert(
            collection_name="content_vectors",
            points=[
                {
                    "id": str(content_id),
                    "vector": vector,
                    "payload": {"content_id": str(content_id)}
                }
            ]
        )
    
    def create_relation(self, source_id, target_id, relation_type, properties=None):
        """在知识图谱中创建关系"""
        with self.graph_db.session() as session:
            session.run(
                """
                MATCH (s), (t)
                WHERE ID(s) = $source_id AND ID(t) = $target_id
                CREATE (s)-[r:$relation_type $properties]->(t)
                RETURN r
                """,
                source_id=source_id,
                target_id=target_id,
                relation_type=relation_type,
                properties=properties or {}
            )
            
    def query_content(self, query=None, limit=10):
        """查询内容"""
        if query is None:
            query = {}
        return list(self.content_db.find(query).limit(limit))
        
    def search_similar(self, vector, limit=10):
        """搜索相似内容"""
        return self.vector_db.search(
            collection_name="content_vectors",
            query_vector=vector,
            limit=limit
        )
        
    def get_relationships(self, content_id, relationship_type=None, direction="both"):
        """获取内容的关系"""
        with self.graph_db.session() as session:
            if direction == "outgoing":
                match_pattern = "(s)-[r]->(t)"
            elif direction == "incoming":
                match_pattern = "(s)<-[r]-(t)"
            else:  # both
                match_pattern = "(s)-[r]-(t)"
                
            relationship_clause = f"type(r) = '{relationship_type}'" if relationship_type else ""
            
            where_clause = f"ID(s) = $content_id"
            if relationship_clause:
                where_clause += f" AND {relationship_clause}"
                
            result = session.run(
                f"""
                MATCH {match_pattern}
                WHERE {where_clause}
                RETURN r, t
                """,
                content_id=content_id
            )
            
            return list(result) 