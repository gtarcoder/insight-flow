import openai
from config import OPENAI_API_KEY

class LLMProcessor:
    def __init__(self):
        openai.api_key = OPENAI_API_KEY
        
    def understand_content(self, content):
        """使用LLM理解内容"""
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个信息分析助手，负责理解和提炼内容要点。"},
                {"role": "user", "content": f"请分析以下内容，提取核心观点、主题分类、情感倾向：\n\n{content}"}
            ]
        )
        return response.choices[0].message['content']
    
    def generate_summary(self, content):
        """生成内容摘要"""
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个摘要生成助手。"},
                {"role": "user", "content": f"请为以下内容生成不超过100字的摘要：\n\n{content}"}
            ]
        )
        return response.choices[0].message['content']
        
    def get_embedding(self, text):
        """获取文本的向量表示"""
        response = openai.Embedding.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response['data'][0]['embedding']
        
    def analyze_relationship(self, content1, content2):
        """分析两篇内容的关联关系"""
        prompt = f"""
        请分析以下两篇内容之间的关联关系:
        
        内容1：{content1['title']}
        {content1['processed_text']}
        
        内容2：{content2['title']}
        {content2['processed_text']}
        
        请分析它们是否存在关联，关联类型是什么，以及关联的具体描述。按照JSON格式返回结果：
        {{
            "has_relation": true/false,
            "relation_type": "因果关系/时序关系/主题相关/...",
            "description": "具体关联描述"
        }}
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个内容关联分析助手。"},
                {"role": "user", "content": prompt}
            ]
        )
        
        # 解析返回的JSON
        import json
        return json.loads(response.choices[0].message['content'])
        
    def evaluate_content(self, content, criteria=None):
        """评估内容的价值"""
        if criteria is None:
            criteria = ["relevance", "timeliness", "importance", "uniqueness"]
            
        prompt = f"""
        请评估以下内容的价值，评分标准包括：{', '.join(criteria)}
        
        内容：{content['title']}
        {content['processed_text']}
        
        请给出1-10的评分，并简要说明理由。按照JSON格式返回结果：
        {{
            "score": 8.5,
            "reason": "评分理由",
            "criteria_scores": {{
                "relevance": 9,
                "timeliness": 8,
                ...
            }}
        }}
        """
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "你是一个内容价值评估助手。"},
                {"role": "user", "content": prompt}
            ]
        )
        
        # 解析返回的JSON
        import json
        return json.loads(response.choices[0].message['content']) 