import os
import yaml

class Config:
    def __init__(self, config_path='config.yml'):
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)
            
    def get_database_config(self):
        return {
            'mongo_uri': self.config.get('database', {}).get('mongodb', {}).get('uri'),
            'qdrant_url': self.config.get('database', {}).get('qdrant', {}).get('url'),
            'neo4j_uri': self.config.get('database', {}).get('neo4j', {}).get('uri'),
            'neo4j_user': self.config.get('database', {}).get('neo4j', {}).get('username'),
            'neo4j_password': self.config.get('database', {}).get('neo4j', {}).get('password')
        }
    
    def get_crawler_config(self):
        return self.config.get('crawlers', {})
    
    def get_llm_config(self):
        return self.config.get('llm', {})
    
    def get_push_config(self):
        return self.config.get('push_channels', {})
    
    def get_scheduler_config(self):
        return self.config.get('scheduler', {}) 