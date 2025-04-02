#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import sys
import logging
import subprocess
from config.config import Config
from crawler.scheduler import CrawlerScheduler
from notifier.push_manager import PushManager
from notifier.wechat_pusher import WeChatPusher
from notifier.email_pusher import EmailPusher

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("info_assistant.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def main():
    """应用主入口"""
    
    parser = argparse.ArgumentParser(description='个人信息助理系统')
    parser.add_argument('--config', type=str, default='config.yml', help='配置文件路径')
    parser.add_argument('--run-crawler', action='store_true', help='运行爬虫调度器')
    parser.add_argument('--run-api', action='store_true', help='运行API服务')
    args = parser.parse_args()
    
    # 加载配置
    try:
        config = Config(args.config)
        logger.info("成功加载配置文件")
    except Exception as e:
        logger.error(f"加载配置文件失败: {e}")
        return
    
    # 如果指定了运行API服务
    if args.run_api:
        logger.info("启动API服务...")
        try:
            # 导入并运行FastAPI应用
            import uvicorn
            uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000)
        except Exception as e:
            logger.error(f"启动API服务失败: {e}")
            return
    
    # 初始化推送管理器
    push_manager = PushManager()
    
    # 配置推送渠道
    push_config = config.get_push_config()
    
    # 微信推送
    if push_config.get('wechat', {}).get('enabled', False):
        wechat_config = push_config.get('wechat', {})
        wechat_pusher = WeChatPusher(
            wechat_config.get('openid'),
            wechat_config.get('template_id'),
            wechat_config.get('app_id'),
            wechat_config.get('app_secret')
        )
        push_manager.register_pusher(wechat_pusher)
        logger.info("已注册微信推送渠道")
        
    # 邮件推送
    if push_config.get('email', {}).get('enabled', False):
        email_config = push_config.get('email', {})
        email_pusher = EmailPusher(
            email_config.get('smtp_server'),
            email_config.get('smtp_port'),
            email_config.get('sender_email'),
            email_config.get('sender_password'),
            email_config.get('recipient_email')
        )
        push_manager.register_pusher(email_pusher)
        logger.info("已注册邮件推送渠道")
    
    # 运行爬虫调度器
    if args.run_crawler:
        logger.info("启动爬虫调度器...")
        crawler_config = config.get_crawler_config()
        scheduler = CrawlerScheduler(crawler_config, push_manager)
        scheduler.start()
    
    logger.info("系统初始化完成")

if __name__ == "__main__":
    main() 