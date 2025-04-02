#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from processor.llm_processor import LLMProcessor
from notifier.base_pusher import BasePusher

logger = logging.getLogger(__name__)

class EmailPusher(BasePusher):
    """邮件推送器"""
    
    def __init__(self, smtp_server, smtp_port, sender_email, sender_password, recipient_email):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = sender_email
        self.sender_password = sender_password
        self.recipient_email = recipient_email
        self.llm = LLMProcessor()
        logger.info("初始化邮件推送器")
    
    def evaluate_content_value(self, content):
        """评估内容价值"""
        evaluation = self.llm.evaluate_content(
            content,
            criteria=["relevance", "timeliness", "importance", "uniqueness"]
        )
        return evaluation["score"] > 6.5  # 设定推送阈值
    
    def push_content(self, content):
        """推送内容到邮箱"""
        if not self.evaluate_content_value(content):
            return False
        
        # 创建邮件
        msg = MIMEMultipart()
        msg['From'] = self.sender_email
        msg['To'] = self.recipient_email
        msg['Subject'] = f"[个人信息助理] {content['title']}"
        
        # 邮件正文
        body = f"""
        <h2>{content['title']}</h2>
        <p><strong>来源：</strong>{content['source']}</p>
        <p><strong>时间：</strong>{content['formatted_time']}</p>
        <p><strong>摘要：</strong>{content['summary']}</p>
        <hr>
        <p>{content['processed_text']}</p>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # 发送邮件
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # 加密连接
            server.login(self.sender_email, self.sender_password)
            server.send_message(msg)
            server.quit()
            logger.info(f"成功发送邮件到 {self.recipient_email}")
            return True
        except Exception as e:
            logger.error(f"发送邮件失败: {e}")
            return False 