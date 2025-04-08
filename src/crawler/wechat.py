#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import re
import time
import random
import logging
import requests
from bs4 import BeautifulSoup
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from typing import List, Dict, Any, Optional
from PIL import Image
from io import BytesIO

from crawler.base_crawler import BaseCrawler
from storage.models import Content

logger = logging.getLogger(__name__)

class WeChatCrawler(BaseCrawler):
    """微信公众号内容爬虫"""
    
    def __init__(self, config, db_manager):
        """初始化微信爬虫
        
        Args:
            config: 配置对象
            db_manager: 数据库管理器
        """
        super().__init__(config, db_manager)
        
        # 从配置中获取微信公众号配置
        self.wechat_config = self.config.get_crawler_config().get('wechat', {})
        self.accounts = self.wechat_config.get('accounts', [])
        self.article_count = self.wechat_config.get('article_count', 10)
        self.use_proxy = self.wechat_config.get('use_proxy', False)
        self.proxy_url = self.wechat_config.get('proxy_url', '')
        
        # 是否使用无头浏览器
        self.headless = self.wechat_config.get('headless', True)
        
        # 缓存目录
        self.cache_dir = self.wechat_config.get('cache_dir', 'cache/wechat')
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # 请求头配置
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # 初始化浏览器驱动（如果需要）
        self.driver = None
        
        # 确认是否有登录Cookie（适用于需要登录的情况）
        self.cookies_file = os.path.join(self.cache_dir, 'cookies.json')
        
    def _init_driver(self):
        """初始化Selenium WebDriver"""
        if self.driver is not None:
            return
            
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument(f'user-agent={self.headers["User-Agent"]}')
        
        # 添加代理（如果需要）
        if self.use_proxy and self.proxy_url:
            chrome_options.add_argument(f'--proxy-server={self.proxy_url}')
            
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.set_page_load_timeout(30)
        
        # 加载Cookie（如果存在）
        if os.path.exists(self.cookies_file):
            import json
            with open(self.cookies_file, 'r') as f:
                cookies = json.load(f)
                
            self.driver.get('https://mp.weixin.qq.com/')
            for cookie in cookies:
                self.driver.add_cookie(cookie)
    
    def _close_driver(self):
        """关闭浏览器驱动"""
        if self.driver is not None:
            try:
                self.driver.quit()
            except Exception as e:
                logger.error(f"关闭浏览器驱动时出错: {e}")
            finally:
                self.driver = None
    
    def _search_account_articles(self, account_name: str) -> List[Dict[str, Any]]:
        """通过搜狗搜索获取公众号文章列表
        
        Args:
            account_name: 公众号名称
            
        Returns:
            List[Dict]: 文章列表，包含标题、链接等
        """
        # 使用搜狗微信搜索API
        search_url = f"https://weixin.sogou.com/weixin?type=1&query={account_name}"
        
        try:
            response = requests.get(search_url, headers=self.headers, timeout=10)
            
            print(f"### response.text: {response.text}")

            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 查找公众号链接
            account_element = soup.select_one('div.gzh-box2')
            if not account_element:
                logger.warning(f"未找到公众号: {account_name}")
                return []
                
            account_link = account_element.select_one('a')
            if not account_link or not account_link.has_attr('href'):
                logger.warning(f"未找到公众号链接: {account_name}")
                return []
                
            # 获取公众号历史页面
            history_url = account_link['href']
            
            # 等待一段时间，避免请求过快
            time.sleep(random.uniform(1, 3))
            
            # 获取历史文章列表
            response = requests.get(history_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 查找文章列表
            articles = []
            article_elements = soup.select('div.weui_media_box')
            
            for element in article_elements[:self.article_count]:
                title_element = element.select_one('h4.weui_media_title')
                link_element = title_element.select_one('a') if title_element else None
                
                if title_element and link_element and link_element.has_attr('href'):
                    title = title_element.text.strip()
                    link = link_element['href']
                    
                    # 查找发布时间
                    date_element = element.select_one('p.weui_media_extra_info')
                    pub_date = date_element.text.strip() if date_element else ''
                    
                    # 查找简介
                    desc_element = element.select_one('p.weui_media_desc')
                    description = desc_element.text.strip() if desc_element else ''
                    
                    articles.append({
                        'title': title,
                        'link': link,
                        'publish_time': pub_date,
                        'description': description,
                        'account': account_name
                    })
            
            return articles
            
        except requests.RequestException as e:
            logger.error(f"获取公众号{account_name}文章时出错: {e}")
            return []
    
    def _get_article_content(self, article_url: str) -> Optional[Dict[str, Any]]:
        """获取文章详细内容
        
        Args:
            article_url: 文章URL
            
        Returns:
            Dict: 文章内容，包含正文、图片、日期等
        """
        try:
            self._init_driver()
            self.driver.get(article_url)
            
            # 等待页面加载完成
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "activity-name"))
            )
            
            # 等待一下让JS执行完成
            time.sleep(2)
            
            # 获取标题
            title = self.driver.find_element(By.ID, "activity-name").text.strip()
            
            # 获取作者信息
            author_element = self.driver.find_element(By.CSS_SELECTOR, "#js_name")
            author = author_element.text.strip()
            
            # 获取发布日期
            date_element = self.driver.find_element(By.ID, "publish_time")
            publish_time_str = date_element.text.strip()
            publish_time = datetime.strptime(publish_time_str, "%Y-%m-%d %H:%M")
            
            # 获取文章主体内容
            content_element = self.driver.find_element(By.ID, "js_content")
            
            # 获取所有图片URL
            image_elements = content_element.find_elements(By.TAG_NAME, "img")
            image_urls = []
            
            for img in image_elements:
                try:
                    # 尝试获取图片数据懒加载属性
                    data_src = img.get_attribute("data-src")
                    if data_src:
                        image_urls.append(data_src)
                    else:
                        # 备用：尝试获取普通src属性
                        src = img.get_attribute("src")
                        if src and not src.startswith("data:"):
                            image_urls.append(src)
                except Exception as e:
                    logger.warning(f"处理图片时出错: {e}")
            
            # 获取文本内容（移除HTML标签）
            content_html = content_element.get_attribute("innerHTML")
            soup = BeautifulSoup(content_html, 'html.parser')
            
            # 移除样式和脚本
            for tag in soup(['style', 'script']):
                tag.decompose()
                
            # 获取纯文本
            text_content = soup.get_text(separator='\n').strip()
            
            # 组装结果
            article_data = {
                'title': title,
                'author': author,
                'original_content': content_html,
                'processed_text': text_content,
                'publish_time': publish_time,
                'formatted_time': publish_time_str,
                'url': article_url,
                'image_urls': image_urls,
                'platform': 'wechat',
                'source': f'微信公众号-{author}',
                'crawl_time': datetime.now()
            }
            
            return article_data
            
        except (TimeoutException, NoSuchElementException) as e:
            logger.error(f"获取文章内容时出错: {e}")
            return None
        except Exception as e:
            logger.error(f"解析文章内容时出错: {e}")
            return None
    
    def _process_article(self, article_data: Dict[str, Any]) -> Content:
        """处理文章数据，准备存储
        
        Args:
            article_data: 文章数据
            
        Returns:
            Content: 处理后的内容对象
        """
        # 提取关键字和主题
        # 这里可以使用LLM或其他NLP工具提取关键词和分类主题
        # 简单实现：基于标题和内容的关键词提取
        
        title_keywords = set(re.findall(r'\w+', article_data['title']))
        
        # 初步设置keywords和topics
        keywords = list(title_keywords)[:10]  # 限制关键词数量
        topics = []
        
        try:
            from processor.llm_processor import LLMProcessor
            llm = LLMProcessor(config=self.config)
            
            # 使用LLM提取关键词和主题
            prompt = f"""请分析以下文章内容，提取出5个关键词和3个主题分类。
标题: {article_data['title']}
内容摘要: {article_data['processed_text'][:500]}...

以JSON格式返回，格式为:
{{
  "keywords": ["关键词1", "关键词2", ...],
  "topics": ["主题1", "主题2", ...]
}}
"""
            
            llm_result = llm.understand_content(prompt)
            
            # 尝试解析LLM返回的结果
            import json
            try:
                result_json = json.loads(llm_result)
                keywords = result_json.get('keywords', keywords)
                topics = result_json.get('topics', [])
            except json.JSONDecodeError:
                logger.warning("LLM返回结果解析失败，使用默认关键词和主题")
                
        except ImportError:
            logger.warning("LLM处理器不可用，使用默认关键词和主题")
        except Exception as e:
            logger.warning(f"使用LLM提取关键词和主题时出错: {e}")
        
        # 创建内容对象
        content = Content(
            title=article_data['title'],
            original_content=article_data['original_content'],
            processed_text=article_data['processed_text'],
            source=article_data['source'],
            platform='wechat',
            publish_time=article_data['publish_time'],
            formatted_time=article_data['formatted_time'],
            crawl_time=article_data['crawl_time'],
            topics=topics,
            keywords=keywords,
            metadata={
                'author': article_data['author'],
                'word_count': len(article_data['processed_text']),
                'read_time_minutes': len(article_data['processed_text']) // 500,  # 估算阅读时间
                'original_url': article_data['url'],
                'image_urls': article_data['image_urls']
            }
        )
        
        return content
    
    def crawl(self):
        """爬取微信公众号内容"""
        logger.info(f"开始爬取微信公众号内容，共{len(self.accounts)}个公众号")
        
        try:
            total_articles = 0
            
            for account in self.accounts:
                # 获取该公众号的文章列表
                logger.info(f"爬取公众号: {account}")
                article_list = self._search_account_articles(account)
                logger.info(f"获取到{len(article_list)}篇文章")
                
                # 对每篇文章进行处理
                for article in article_list:
                    try:
                        # 检查文章是否已经存在于数据库中
                        article_url = article['link']
                        exists = self.db_manager.content_exists({'metadata.original_url': article_url})
                        
                        if exists:
                            logger.info(f"文章已存在: {article['title']}，跳过")
                            continue
                            
                        # 获取文章详细内容
                        logger.info(f"获取文章: {article['title']}")
                        article_data = self._get_article_content(article_url)
                        
                        if not article_data:
                            logger.warning(f"获取文章内容失败: {article['title']}")
                            continue
                            
                        # 处理文章数据
                        content = self._process_article(article_data)
                        
                        # 存储文章到数据库
                        content_id = self.store_and_process_content(content.dict())
                        logger.info(f"文章存储成功: {article['title']}, ID: {content_id}")
                        
                        total_articles += 1
                        
                        # 随机等待，避免请求过快
                        time.sleep(random.uniform(3, 7))
                        
                    except Exception as e:
                        logger.error(f"处理文章时出错: {article['title']}, 错误: {e}")
                
                # 不同公众号之间等待更长时间
                time.sleep(random.uniform(10, 15))
                
            logger.info(f"微信公众号内容爬取完成，共爬取{total_articles}篇文章")
            
        except Exception as e:
            logger.error(f"微信公众号爬虫运行出错: {e}")
        finally:
            self._close_driver()
            
    def __del__(self):
        """析构函数，确保资源被释放"""
        self._close_driver() 