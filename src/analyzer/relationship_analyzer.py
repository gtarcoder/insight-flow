from storage.database import StorageManager
from processor.llm_processor import LLMProcessor

class RelationshipAnalyzer:
    def __init__(self):
        self.storage = StorageManager()
        self.llm = LLMProcessor()
        
    def analyze_connections(self, new_content_id):
        """分析新内容与历史信息的关联"""
        # 获取新内容
        new_content = self.storage.content_db.find_one({"_id": new_content_id})
        
        # 使用向量检索找到相似内容
        similar_contents = self.find_similar_contents(new_content)
        
        # 使用LLM分析关联关系
        for similar in similar_contents:
            relation = self.llm.analyze_relationship(new_content, similar)
            
            # 存储关联关系到知识图谱
            if relation['has_relation']:
                self.storage.create_relation(
                    new_content_id,
                    similar['_id'],
                    relation['relation_type'],
                    {"description": relation['description']}
                )
    
    def find_similar_contents(self, content):
        """查找相似内容"""
        # 使用向量数据库进行相似度搜索
        vector = self.llm.get_embedding(content['processed_text'])
        search_results = self.storage.vector_db.search(
            collection_name="content_vectors",
            query_vector=vector,
            limit=10
        )
        
        # 获取相似内容的详细信息
        content_ids = [result.payload['content_id'] for result in search_results]
        similar_contents = list(self.storage.content_db.find({"_id": {"$in": content_ids}}))
        
        return similar_contents
        
    def generate_temporal_graph(self):
        """生成时序图"""
        # 查询具有时序关系的内容
        temporal_relations = self.storage.get_relationships(None, relationship_type="FOLLOWED_BY")
        
        # 构建时序图
        timeline = []
        for relation in temporal_relations:
            source = relation["s"]
            target = relation["t"]
            timeline.append({
                "source": {
                    "id": source.id,
                    "title": source["title"],
                    "time": source["publish_time"]
                },
                "target": {
                    "id": target.id,
                    "title": target["title"],
                    "time": target["publish_time"]
                },
                "relation": relation["r"]["description"]
            })
            
        return sorted(timeline, key=lambda x: x["source"]["time"])
        
    def generate_causal_graph(self):
        """生成因果图"""
        # 查询具有因果关系的内容
        causal_relations = self.storage.get_relationships(None, relationship_type="CAUSES")
        
        # 构建因果图
        causal_graph = []
        for relation in causal_relations:
            source = relation["s"]
            target = relation["t"]
            causal_graph.append({
                "cause": {
                    "id": source.id,
                    "title": source["title"]
                },
                "effect": {
                    "id": target.id,
                    "title": target["title"]
                },
                "description": relation["r"]["description"]
            })
            
        return causal_graph 