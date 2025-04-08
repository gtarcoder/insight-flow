import os
import yaml
import logging

logger = logging.getLogger(__name__)

class Config:
    def __init__(self, config_path='config.yml'):
        # 从环境变量获取配置路径
        config_path_env = os.environ.get('CONFIG_PATH')
        if config_path_env:
            config_path = config_path_env
            logger.info(f"使用环境变量指定的配置文件: {config_path}")
        
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f)
                logger.info(f"成功加载配置文件: {config_path}")
        except FileNotFoundError:
            logger.warning(f"找不到配置文件: {config_path}，使用空配置")
            self.config = {}
        except yaml.YAMLError as e:
            logger.error(f"解析配置文件出错: {e}")
            self.config = {}
        
        # 从环境变量覆盖配置
        self._override_from_env()

    def _override_from_env(self):
        """从环境变量覆盖配置"""
        # 数据库配置
        if os.environ.get('MONGODB_URI'):
            self.config.setdefault('database', {}).setdefault('mongodb', {})['uri'] = os.environ.get('MONGODB_URI')
            
        if os.environ.get('NEO4J_URI'):
            self.config.setdefault('database', {}).setdefault('neo4j', {})['uri'] = os.environ.get('NEO4J_URI')
            
        if os.environ.get('NEO4J_USER'):
            self.config.setdefault('database', {}).setdefault('neo4j', {})['username'] = os.environ.get('NEO4J_USER')
            
        if os.environ.get('NEO4J_PASSWORD'):
            self.config.setdefault('database', {}).setdefault('neo4j', {})['password'] = os.environ.get('NEO4J_PASSWORD')
            
        if os.environ.get('REDIS_URI'):
            self.config.setdefault('scheduler', {})['redis_url'] = os.environ.get('REDIS_URI')
            
        if os.environ.get('QDRANT_HOST'):
            self.config.setdefault('database', {}).setdefault('qdrant', {})['url'] = os.environ.get('QDRANT_HOST')
            
        # LLM配置
        if os.environ.get('OPENAI_API_KEY'):
            self.config.setdefault('llm', {})['api_key'] = os.environ.get('OPENAI_API_KEY')
            
        # 推送渠道配置
        if os.environ.get('WECHAT_APP_ID'):
            self.config.setdefault('push_channels', {}).setdefault('wechat', {})['app_id'] = os.environ.get('WECHAT_APP_ID')
            
        if os.environ.get('WECHAT_APP_SECRET'):
            self.config.setdefault('push_channels', {}).setdefault('wechat', {})['app_secret'] = os.environ.get('WECHAT_APP_SECRET')
            
        # 安全配置
        if os.environ.get('SECRET_KEY'):
            self.config.setdefault('security', {})['secret_key'] = os.environ.get('SECRET_KEY')
    
    def validate_config(self):
        """验证必要的配置项是否存在"""
        errors = []
        
        # 数据库配置验证
        if not self.get_database_config().get('mongo_uri'):
            errors.append("缺少MongoDB连接URI配置")
            
        # LLM配置验证
        llm_config = self.get_llm_config()
        if not llm_config.get('api_key'):
            errors.append("缺少LLM API密钥配置")
            
        if errors:
            error_msg = "配置验证失败：\n" + "\n".join(errors)
            logger.error(error_msg)
            return False, error_msg
            
        return True, "配置验证通过"
            
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
        """获取LLM配置
        
        Returns:
            dict: 包含LLM配置的字典
        """
        return self.config.get('llm', {})
    
    def get_push_config(self):
        return self.config.get('push_channels', {})
    
    def get_scheduler_config(self):
        return self.config.get('scheduler', {}) 