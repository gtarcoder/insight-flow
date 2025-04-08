def test_database_manager():
    from config.config import Config
    from storage.database_manager import DatabaseManager
    
    config = Config("tests/config.test.yml")  # 使用测试配置
    db_manager = DatabaseManager(config=config)
    # 测试逻辑... 