#!/usr/bin/env python
# -*- coding: utf-8 -*-

from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)

class BaseCrawler(ABC):
    """爬虫基类，所有特定平台爬虫需要继承此类"""
    
    def __init__(self, name):
        self.name = name
        logger.info(f"初始化 {name} 爬虫")
    
    @abstractmethod
    def crawl(self):
        """爬取内容的主方法"""
        pass
    
    @abstractmethod
    def parse_content(self, raw_content):
        """解析爬取的原始内容"""
        pass
    
    @abstractmethod
    def preprocess_data(self, parsed_content):
        """预处理解析后的内容"""
        pass
    
    def run(self):
        """运行爬虫的完整流程"""
        try:
            logger.info(f"开始爬取 {self.name} 内容")
            raw_content = self.crawl()
            logger.info(f"{self.name} 爬取完成，开始解析内容")
            
            parsed_content = self.parse_content(raw_content)
            logger.info(f"{self.name} 内容解析完成，开始预处理")
            
            processed_data = self.preprocess_data(parsed_content)
            logger.info(f"{self.name} 内容预处理完成")
            
            return processed_data
        except Exception as e:
            logger.error(f"{self.name} 爬虫运行出错: {e}")
            raise 