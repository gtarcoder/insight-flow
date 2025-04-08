#!/usr/bin/env python
# -*- coding: utf-8 -*-

import unittest
from crawler.wechat import WeChatCrawler
from crawler.weibo import WeiboCrawler
from crawler.xiaohongshu import XiaoHongShuCrawler
from crawler.bilibili import BiliBiliCrawler

class TestCrawlers(unittest.TestCase):
    """爬虫测试类"""
    
    def test_wechat_crawler(self):
        """测试微信爬虫"""
        crawler = WeChatCrawler(accounts=["test_account"])
        results = crawler.crawl()
        
        self.assertIsInstance(results, list)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["account"], "test_account")
        
        parsed = crawler.parse_content(results)
        self.assertTrue(len(parsed) > 0)
        self.assertEqual(parsed[0]["platform"], "wechat")
        
        processed = crawler.preprocess_data(parsed)
        self.assertTrue("formatted_time" in processed[0])
    
    def test_weibo_crawler(self):
        """测试微博爬虫"""
        crawler = WeiboCrawler(topics=["test_topic"])
        results = crawler.crawl()
        
        self.assertIsInstance(results, list)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["topic"], "test_topic")
        
        parsed = crawler.parse_content(results)
        self.assertTrue(len(parsed) > 0)
        self.assertEqual(parsed[0]["platform"], "weibo")
        
        processed = crawler.preprocess_data(parsed)
        self.assertTrue("formatted_time" in processed[0])
    
    def test_xiaohongshu_crawler(self):
        """测试小红书爬虫"""
        crawler = XiaoHongShuCrawler(categories=["test_category"])
        results = crawler.crawl()
        
        self.assertIsInstance(results, list)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["category"], "test_category")
        
        parsed = crawler.parse_content(results)
        self.assertTrue(len(parsed) > 0)
        self.assertEqual(parsed[0]["platform"], "xiaohongshu")
        
        processed = crawler.preprocess_data(parsed)
        self.assertTrue("formatted_time" in processed[0])
    
    def test_bilibili_crawler(self):
        """测试B站爬虫"""
        crawler = BiliBiliCrawler(categories=["test_category"])
        results = crawler.crawl()
        
        self.assertIsInstance(results, list)
        self.assertTrue(len(results) > 0)
        self.assertEqual(results[0]["category"], "test_category")
        
        parsed = crawler.parse_content(results)
        self.assertTrue(len(parsed) > 0)
        self.assertEqual(parsed[0]["platform"], "bilibili")
        
        processed = crawler.preprocess_data(parsed)
        self.assertTrue("formatted_time" in processed[0])

if __name__ == "__main__":
    unittest.main()