#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import logging
from processor.llm_processor import LLMProcessor
from notifier.base_pusher import BasePusher

logger = logging.getLogger(__name__)

class WeChatPusher(BasePusher):
    """微信推送器"""
    
    def __init__(self, openid, template_id, app_id, app_secret):
        self.openid = openid
        self.template_id = template_id
        self.app_id = app_id
        self.app_secret = app_secret
        self.llm = LLMProcessor()
        logger.info("初始化微信推送器")
    
    def get_access_token(self):
        """获取微信接口访问令牌"""
        url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={self.app_id}&secret={self.app_secret}"
        response = requests.get(url).json()
        return response.get("access_token")
    
    def evaluate_content_value(self, content):
        """评估内容价值"""
        evaluation = self.llm.evaluate_content(
            content,
            criteria=["relevance", "timeliness", "importance", "uniqueness"]
        )
        return evaluation["score"] > 7.5  # 设定推送阈值
    
    def push_content(self, content):
        """推送内容到微信"""
        if not self.evaluate_content_value(content):
            return False
            
        access_token = self.get_access_token()
        url = f"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={access_token}"
        
        data = {
            "touser": self.openid,
            "template_id": self.template_id,
            "data": {
                "title": {"value": content["title"], "color": "#173177"},
                "summary": {"value": content["summary"], "color": "#173177"},
                "source": {"value": content["source"], "color": "#173177"},
                "time": {"value": content["formatted_time"], "color": "#173177"}
            }
        }
        
        response = requests.post(url, json=data)
        success = response.status_code == 200 and response.json().get("errcode") == 0
        
        if success:
            logger.info(f"成功推送内容到微信用户 {self.openid}")
        else:
            logger.error(f"推送到微信失败: {response.json()}")
        
        return success 