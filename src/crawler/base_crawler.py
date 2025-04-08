from storage.database_manager import DatabaseManager

class BaseCrawler:
    def __init__(self, config, db_manager):
        """初始化基础爬虫
        
        Args:
            config: 必须提供的配置对象
            db_manager: 数据库管理器实例
        """
        assert config is not None, "必须提供配置对象"
        assert db_manager is not None, "必须提供数据库管理器"
        self.config = config
        self.db_manager = db_manager  # 使用传入的实例，不再创建新实例
        self.content_callback = None  # 内容处理回调函数
    
    def set_content_callback(self, callback):
        """设置新内容处理回调
        
        Args:
            callback: 回调函数，接收content_id和content_data参数
        """
        self.content_callback = callback
    
    def store_and_process_content(self, content_data):
        """存储内容并调用回调处理
        
        Args:
            content_data: 内容数据字典
            
        Returns:
            str: 存储的内容ID
        """
        # 存储内容到数据库
        content_id = self.db_manager.store_content(content_data)
        
        # 如果设置了回调函数，则调用它处理新内容
        if self.content_callback:
            self.content_callback(content_id, content_data)
        
        return content_id
    
    def crawl(self):
        """爬取内容的抽象方法，子类必须实现"""
        raise NotImplementedError("子类必须实现crawl方法") 