#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import pytest
import unittest
from unittest import mock
from datetime import datetime
import json
from bs4 import BeautifulSoup

# 确保可以导入src目录下的模块
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.crawler.wechat import WeChatCrawler
from src.config.config import Config
from src.storage.database_manager import DatabaseManager

# 模拟响应内容
MOCK_SOGOU_RESPONSE = """
<html>
    <body>
        <div class="gzh-box2">
            <a href="https://weixin.sogou.com/link?url=abc123">测试公众号</a>
        </div>
    </body>
</html>
"""

MOCK_HISTORY_RESPONSE = """
<html>
    <body>
        <div class="weui_media_box">
            <h4 class="weui_media_title">
                <a href="https://mp.weixin.qq.com/s/test_article_1">测试文章1</a>
            </h4>
            <p class="weui_media_desc">文章摘要1</p>
            <p class="weui_media_extra_info">2023-01-01</p>
        </div>
        <div class="weui_media_box">
            <h4 class="weui_media_title">
                <a href="https://mp.weixin.qq.com/s/test_article_2">测试文章2</a>
            </h4>
            <p class="weui_media_desc">文章摘要2</p>
            <p class="weui_media_extra_info">2023-01-02</p>
        </div>
    </body>
</html>
"""

MOCK_ARTICLE_CONTENT = """
<html>
    <body>
        <div id="activity-name">测试文章标题</div>
        <div id="meta_content">
            <span class="rich_media_meta_nickname">测试作者</span>
            <em>2023-01-01</em>
        </div>
        <div id="js_content">
            <p>这是测试文章的正文内容。</p>
            <p>这里有一些段落。</p>
            <img data-src="https://example.com/image1.jpg" />
            <p>这里有更多文本。</p>
        </div>
    </body>
</html>
"""

class MockDatabaseManager:
    """模拟数据库管理器类，提供必要的方法"""
    
    def content_exists(self, query):
        """检查内容是否存在"""
        return False
        
    def store_content(self, content):
        """存储内容"""
        return "test_content_id"
        
    # 添加其他 WeChatCrawler 可能调用的方法

class TestWeChatCrawler(unittest.TestCase):
    """微信爬虫测试类"""
    
    def setUp(self):
        """设置测试环境"""
        # 创建配置对象的模拟
        self.mock_config = mock.MagicMock(spec=Config)
        self.mock_config.get_crawler_config.return_value = {
            'wechat': {
                'accounts': ['测试公众号1', '测试公众号2'],
                'article_count': 5,
                'headless': True,
                'use_proxy': False,
                'cache_dir': 'tests/cache/wechat'
            }
        }
        
        # 创建数据库管理器的模拟
        self.mock_db_manager = mock.MagicMock(spec=MockDatabaseManager)
        self.mock_db_manager.content_exists.return_value = False
        self.mock_db_manager.store_content.return_value = "test_content_id"
        
        # 创建爬虫实例
        with mock.patch('os.makedirs'):  # 模拟创建缓存目录
            self.crawler = WeChatCrawler(self.mock_config, self.mock_db_manager)
        
    @mock.patch('requests.get')
    def test_search_account_articles(self, mock_get):
        """测试搜索公众号文章方法"""
        # 设置模拟响应
        mock_response = mock.MagicMock()
        mock_response.text = MOCK_SOGOU_RESPONSE
        mock_response.status_code = 200
        
        # 模拟第二个请求 (获取历史页面)
        mock_response2 = mock.MagicMock()
        mock_response2.text = MOCK_HISTORY_RESPONSE
        mock_response2.status_code = 200
        
        # 配置mock.get按顺序返回不同的响应
        mock_get.side_effect = [mock_response, mock_response2]
        
        # 执行测试
        with mock.patch('time.sleep'):  # 避免测试中的等待
            articles = self.crawler._search_account_articles('测试公众号')
        
        # 验证结果
        self.assertEqual(len(articles), 2)
        self.assertEqual(articles[0]['title'], '测试文章1')
        self.assertEqual(articles[1]['title'], '测试文章2')
        self.assertEqual(articles[0]['link'], 'https://mp.weixin.qq.com/s/test_article_1')
        
        # 验证搜狗搜索URL正确
        mock_get.assert_any_call(
            'https://weixin.sogou.com/weixin?type=1&query=测试公众号',
            headers=self.crawler.headers,
            timeout=10
        )
    
    @mock.patch('selenium.webdriver.Chrome')
    def test_get_article_content(self, mock_chrome):
        """测试获取文章内容方法"""
        # 设置模拟浏览器
        mock_driver = mock_chrome.return_value
        mock_driver.page_source = MOCK_ARTICLE_CONTENT
        
        # 模拟元素查找
        mock_title = mock.MagicMock()
        mock_title.text = "测试文章标题"
        
        mock_author = mock.MagicMock()
        mock_author.text = "测试作者"
        
        mock_date = mock.MagicMock()
        mock_date.text = "2023-01-01"
        
        mock_content = mock.MagicMock()
        mock_content.get_attribute.return_value = "<p>这是测试文章的正文内容。</p><p>这里有一些段落。</p><p>这里有更多文本。</p>"
        
        # 配置元素查找结果
        mock_driver.find_element.side_effect = lambda by, value: {
            'activity-name': mock_title,
            'js_content': mock_content
        }.get(value)
        
        mock_driver.find_elements.return_value = [mock_author, mock_date]
        
        # 执行测试
        with mock.patch('time.sleep'):
            article_data = self.crawler._get_article_content('https://mp.weixin.qq.com/s/test_article')
        
        # 验证结果
        self.assertIsNotNone(article_data)
        self.assertEqual(article_data['title'], '测试文章标题')
        self.assertEqual(article_data['author'], '测试作者')
        self.assertEqual(article_data['processed_text'], '这是测试文章的正文内容。这里有一些段落。这里有更多文本。')
        self.assertEqual(article_data['url'], 'https://mp.weixin.qq.com/s/test_article')
        
    def test_process_article(self):
        """测试处理文章数据方法"""
        # 准备测试数据
        article_data = {
            'title': '人工智能的未来发展',
            'original_content': '<p>这是关于AI的原始内容</p>',
            'processed_text': '这是关于AI的处理后内容。人工智能技术正在快速发展。',
            'source': '测试公众号',
            'url': 'https://mp.weixin.qq.com/s/test_article',
            'author': '测试作者',
            'publish_time': datetime(2023, 1, 1),
            'formatted_time': '2023-01-01',
            'crawl_time': datetime.now(),
            'image_urls': ['https://example.com/image1.jpg']
        }
        
        # 模拟LLM处理器
        with mock.patch('processor.llm_processor.LLMProcessor') as mock_llm_cls:
            mock_llm = mock_llm_cls.return_value
            mock_llm.understand_content.return_value = json.dumps({
                'keywords': ['人工智能', 'AI', '技术', '发展', '未来'],
                'topics': ['技术', '人工智能', '未来趋势']
            })
            
            # 执行测试
            content = self.crawler._process_article(article_data)
        
        # 验证结果
        self.assertEqual(content.title, '人工智能的未来发展')
        self.assertEqual(content.platform, 'wechat')
        self.assertEqual(content.source, '测试公众号')
        self.assertIn('人工智能', content.keywords)
        self.assertIn('技术', content.topics)
        self.assertEqual(content.metadata['author'], '测试作者')
        self.assertEqual(content.metadata['original_url'], 'https://mp.weixin.qq.com/s/test_article')
    
    @mock.patch.object(WeChatCrawler, '_search_account_articles')
    @mock.patch.object(WeChatCrawler, '_get_article_content')
    @mock.patch.object(WeChatCrawler, '_process_article')
    @mock.patch.object(WeChatCrawler, 'store_and_process_content')
    def test_crawl(self, mock_store, mock_process, mock_get_content, mock_search):
        """测试爬取方法"""
        # 设置模拟返回值
        mock_search.return_value = [
            {'title': '测试文章1', 'link': 'https://mp.weixin.qq.com/s/test1'},
            {'title': '测试文章2', 'link': 'https://mp.weixin.qq.com/s/test2'}
        ]
        
        mock_get_content.return_value = {
            'title': '测试文章',
            'original_content': '<p>内容</p>',
            'processed_text': '内容',
            'source': '测试公众号',
            'url': 'https://mp.weixin.qq.com/s/test',
            'author': '作者',
            'publish_time': datetime.now(),
            'formatted_time': '2023-01-01',
            'crawl_time': datetime.now(),
            'image_urls': []
        }
        
        mock_content = mock.MagicMock()
        mock_content.dict.return_value = {}
        mock_process.return_value = mock_content
        
        mock_store.return_value = "test_content_id"
        
        # 执行测试
        with mock.patch('time.sleep'):
            self.crawler.crawl()
        
        # 验证调用
        self.assertEqual(mock_search.call_count, 2)  # 调用两次，对应两个公众号
        self.assertEqual(mock_get_content.call_count, 4)  # 对每个公众号的两篇文章
        self.assertEqual(mock_process.call_count, 4)  # 处理4篇文章
        self.assertEqual(mock_store.call_count, 4)  # 存储4篇文章

if __name__ == '__main__':
    unittest.main()