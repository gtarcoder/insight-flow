import schedule
import time
import logging
from crawler.wechat import WeChatCrawler
from crawler.weibo import WeiboCrawler
from crawler.xiaohongshu import XiaoHongShuCrawler
from crawler.bilibili import BiliBiliCrawler
from analyzer.relationship_analyzer import RelationshipAnalyzer
from visualizer.graph_generator import GraphVisualizer

class CrawlerScheduler:
    def __init__(self, crawler_config, push_manager, config, db_manager):
        """初始化爬虫调度器
        
        Args:
            crawler_config: 爬虫配置
            push_manager: 推送管理器
            config: 全局配置对象
            db_manager: 数据库管理器实例
        """
        self.crawler_config = crawler_config
        self.push_manager = push_manager
        self.config = config
        self.db_manager = db_manager  # 接收已创建的数据库管理器
        self.analyzer = RelationshipAnalyzer(db_manager=self.db_manager)
        self.visualizer = GraphVisualizer(db_manager=self.db_manager)
        self.crawlers = {}
        self._init_crawlers()
    
    def _init_crawlers(self):
        """初始化所有爬虫实例"""
        for crawler_name, crawler_conf in self.crawler_config.items():
            if crawler_conf.get('enabled', False):
                # 创建爬虫实例时传递配置对象和数据库管理器
                crawler_class = self._get_crawler_class(crawler_name)
                if crawler_class:
                    self.crawlers[crawler_name] = crawler_class(
                        config=self.config, 
                        db_manager=self.db_manager
                    )
    
    def _get_crawler_class(self, crawler_name):
        """根据爬虫名称获取爬虫类"""
        crawler_classes = {
            'wechat': WeChatCrawler,
            'weibo': WeiboCrawler,
            'xiaohongshu': XiaoHongShuCrawler,
            'bilibili': BiliBiliCrawler
        }
        return crawler_classes.get(crawler_name)
    
    def process_new_content(self, content_id, content_data):
        """处理新采集的内容"""
        # 1. 分析内容与现有内容的关系
        self.analyzer.analyze_connections(content_id)
        
        # 2. 生成关系图并保存
        graph_path = self.visualizer.generate_relationship_graph(content_id, depth=2)
        
        # 3. 通知用户新内容及其关系
        notification = {
            "title": f"新内容分析：{content_data.get('title', '未知标题')}",
            "message": f"已分析新内容与现有信息的关系，详情可查看Web界面",
            "url": f"/content/{content_id}",
            "image_url": graph_path if graph_path else None
        }
        self.push_manager.push_notification(notification)
        
    def start(self):
        """启动调度器"""
        # 为每个爬虫注册回调，处理新内容
        for crawler_name, crawler in self.crawlers.items():
            # 注册回调函数，当爬虫获取到新内容时调用
            crawler.set_content_callback(self.process_new_content)
        
        # 设置各平台爬虫的定时任务
        for crawler_name, crawler_conf in self.crawler_config.items():
            if crawler_name in self.crawlers and crawler_conf.get('schedule'):
                schedule_time = crawler_conf.get('schedule')
                schedule.every().day.at(schedule_time).do(self.crawlers[crawler_name].crawl)
        
        # 每周生成一次全局关系图
        schedule.every().sunday.at("23:00").do(self.generate_weekly_report)
        
        # 运行调度器
        while True:
            schedule.run_pending()
            time.sleep(60)
    
    def generate_weekly_report(self):
        """生成每周内容分析报告"""
        try:
            # 1. 生成时序图
            timeline_data = self.analyzer.generate_temporal_graph()
            timeline_path = self.visualizer.generate_timeline_graph(timeline_data)
            
            # 2. 生成因果关系图
            causal_data = self.analyzer.generate_causal_graph()
            causal_path = self.visualizer.generate_causal_graph(causal_data)
            
            # 3. 生成主题聚类图 (假设我们有这个方法)
            # topic_path = self.visualizer.generate_topic_cluster()
            
            # 4. 推送周报通知
            notification = {
                "title": "每周信息分析报告",
                "message": "本周信息分析报告已生成，包含时序关系和因果关系分析",
                "url": "/reports/weekly",
                "image_url": timeline_path
            }
            self.push_manager.push_notification(notification)
            
            return True
        except Exception as e:
            logging.error(f"生成周报失败: {e}")
            return False 