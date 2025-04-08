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
from storage.database_manager import DatabaseManager
from analyzer.relationship_analyzer import RelationshipAnalyzer
from visualizer.graph_generator import GraphVisualizer

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("insight_flow.log"),
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
    parser.add_argument('--validate-only', action='store_true', help='仅验证配置')
    args = parser.parse_args()
    
    # 加载配置
    try:
        config = Config(args.config)
        logger.info("成功加载配置文件")
        
        # 验证配置
        valid, message = config.validate_config()
        if not valid:
            logger.error(f"配置验证失败: {message}")
            if not args.validate_only:  # 如果不是仅验证模式，则退出
                sys.exit(1)
            return
        
        logger.info("配置验证通过")
        
        # 如果是仅验证模式，则直接返回
        if args.validate_only:
            return
            
    except Exception as e:
        logger.error(f"加载配置文件失败: {e}")
        sys.exit(1)
    
    # 如果指定了运行API服务
    if args.run_api:
        logger.info("启动API服务...")
        try:
            # 导入并运行FastAPI应用
            import uvicorn
            uvicorn.run("api.main:app", host="0.0.0.0", port=8000)
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
    
    # 在顶层应用中初始化单个 DatabaseManager 实例
    db_manager = DatabaseManager(config=config)
    
    # 传递给所有需要数据库访问的组件
    analyzer = RelationshipAnalyzer(db_manager=db_manager)
    visualizer = GraphVisualizer(db_manager=db_manager)
    
    # 运行爬虫调度器 (传入已创建的数据库管理器)
    if args.run_crawler:
        logger.info("启动爬虫调度器...")
        crawler_config = config.get_crawler_config()
        scheduler = CrawlerScheduler(
            crawler_config=crawler_config, 
            push_manager=push_manager, 
            config=config,
            db_manager=db_manager
        )
        scheduler.start()
    
    logger.info("系统初始化完成")

    # 测试关系分析和可视化功能 (可选)
    if '--test-analysis' in sys.argv:
        logger.info("执行测试分析...")
        try:
            # 假设我们有一些测试内容ID
            test_content_id = "60f7e5c8a9f13e001c8e4321"  # 替换为实际ID
            
            # 测试关系分析
            analyzer.analyze_connections(test_content_id)
            logger.info("关系分析完成")
            
            # 测试可视化
            graph_path = visualizer.generate_relationship_graph(test_content_id)
            logger.info(f"关系图生成完成: {graph_path}")
        except Exception as e:
            logger.error(f"测试分析失败: {e}")

if __name__ == "__main__":
    main() 