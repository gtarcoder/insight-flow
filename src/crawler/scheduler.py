import schedule
import time
from crawler.wechat import WeChatCrawler
from crawler.weibo import WeiboCrawler
from crawler.xiaohongshu import XiaoHongShuCrawler
from crawler.bilibili import BiliBiliCrawler

class CrawlerScheduler:
    def __init__(self):
        self.crawlers = {
            'wechat': WeChatCrawler(),
            'weibo': WeiboCrawler(),
            'xiaohongshu': XiaoHongShuCrawler(),
            'bilibili': BiliBiliCrawler()
        }
    
    def schedule_all(self):
        # 设置各平台爬虫的定时任务
        schedule.every().day.at("08:00").do(self.crawlers['wechat'].crawl)
        schedule.every().day.at("12:00").do(self.crawlers['weibo'].crawl)
        schedule.every().day.at("18:00").do(self.crawlers['xiaohongshu'].crawl)
        schedule.every().day.at("20:00").do(self.crawlers['bilibili'].crawl)
        
        # 运行调度器
        while True:
            schedule.run_pending()
            time.sleep(60) 