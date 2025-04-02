#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
from notifier.base_pusher import BasePusher

logger = logging.getLogger(__name__)

class PushManager:
    """推送管理器，负责管理和使用各种推送渠道"""
    
    def __init__(self):
        self.pushers = []
        logger.info("初始化推送管理器")
    
    def register_pusher(self, pusher):
        """注册推送器"""
        if not isinstance(pusher, BasePusher):
            raise TypeError("推送器必须继承BasePusher类")
        
        self.pushers.append(pusher)
        logger.info(f"注册推送器: {pusher.__class__.__name__}")
    
    def push_to_all_channels(self, content):
        """向所有渠道推送内容"""
        results = {}
        
        for pusher in self.pushers:
            pusher_name = pusher.__class__.__name__
            
            # 评估内容价值
            if pusher.evaluate_content_value(content):
                try:
                    success = pusher.push_content(content)
                    results[pusher_name] = success
                    logger.info(f"向 {pusher_name} 推送内容 {'成功' if success else '失败'}")
                except Exception as e:
                    results[pusher_name] = False
                    logger.error(f"向 {pusher_name} 推送内容出错: {e}")
            else:
                logger.info(f"内容价值不足，不向 {pusher_name} 推送")
                results[pusher_name] = False
        
        return results
    
    def push_to_specific_channel(self, content, channel_names):
        """向指定渠道推送内容"""
        if not isinstance(channel_names, list):
            channel_names = [channel_names]
        
        results = {}
        
        for pusher in self.pushers:
            pusher_name = pusher.__class__.__name__
            
            if pusher_name in channel_names:
                # 评估内容价值
                if pusher.evaluate_content_value(content):
                    try:
                        success = pusher.push_content(content)
                        results[pusher_name] = success
                        logger.info(f"向 {pusher_name} 推送内容 {'成功' if success else '失败'}")
                    except Exception as e:
                        results[pusher_name] = False
                        logger.error(f"向 {pusher_name} 推送内容出错: {e}")
                else:
                    logger.info(f"内容价值不足，不向 {pusher_name} 推送")
                    results[pusher_name] = False
        
        return results 