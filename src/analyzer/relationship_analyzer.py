from processor.llm_processor import LLMProcessor
from config.config import Config
from storage.models import Relationship

class RelationshipAnalyzer:
    def __init__(self, db_manager):
        """初始化关系分析器
        
        Args:
            db_manager: 必须提供的数据库管理器实例
        """
        assert db_manager is not None, "必须提供数据库管理器"
        self.db_manager = db_manager
        
        # 获取LLM处理器
        config = Config()
        self.llm = LLMProcessor(config=config)
        
    def analyze_connections(self, new_content_id):
        """分析新内容与历史信息的关联"""
        # 获取新内容
        new_content = self.db_manager.get_content(new_content_id)
        if not new_content:
            return
        
        # 使用向量检索找到相似内容
        vector = self.llm.get_embedding(new_content.processed_text)
        similar_results = self.db_manager.search_similar_vectors(vector, limit=10)
        
        # 分析并创建关系
        for result in similar_results:
            similar_id = result.id
            if similar_id == new_content_id:  # 跳过自己
                continue
                
            similar_content = self.db_manager.get_content(similar_id)
            if not similar_content:
                continue
                
            # 使用LLM分析两者关系
            relation = self.llm.analyze_relationship(
                new_content.dict(),
                similar_content.dict()
            )
            
            # 如果检测到关联关系，创建关系到知识图谱
            if relation.get('has_relation'):
                relationship = Relationship(
                    source_id=new_content_id,
                    target_id=similar_id,
                    relation_type=relation.get('relation_type', 'RELATED_TO'),
                    properties={
                        "description": relation.get('description', ''),
                        "confidence": relation.get('confidence', 0.5)
                    }
                )
                
                self.db_manager.create_relation(relationship)
    
    def find_similar_contents(self, content):
        """查找相似内容"""
        # 使用向量数据库进行相似度搜索
        vector = self.llm.get_embedding(content['processed_text'])
        search_results = self.db_manager.search_similar_vectors(vector, limit=10)
        
        # 获取相似内容的详细信息
        content_ids = [result.id for result in search_results]
        similar_contents = list(self.db_manager.get_contents({"_id": {"$in": content_ids}}))
        
        return similar_contents
        
    def generate_temporal_graph(self):
        """生成时序图"""
        # 查询具有时序关系的内容
        temporal_relations = self.db_manager.get_relationships(None, relationship_type="FOLLOWED_BY")
        
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
        causal_relations = self.db_manager.get_relationships(None, relationship_type="CAUSES")
        
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