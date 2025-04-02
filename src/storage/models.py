#!/usr/bin/env python
# -*- coding: utf-8 -*-

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class Entity(BaseModel):
    """文本中提取的实体"""
    text: str
    type: str
    start: int
    end: int


class Sentiment(BaseModel):
    """情感分析结果"""
    score: float  # 在-1到1之间，负数表示消极，正数表示积极
    label: str  # positive, negative, neutral
    emotions: Dict[str, float] = Field(default_factory=dict)  # 例如: {"joy": 0.6, "surprise": 0.3}


class ValueAssessment(BaseModel):
    """内容价值评估"""
    overall_score: float  # 总体评分，1-10
    relevance: float  # 相关性
    timeliness: float  # 时效性
    importance: float  # 重要性
    uniqueness: float  # 独特性


class Metadata(BaseModel):
    """内容元数据"""
    word_count: int
    read_time_minutes: int
    author: Optional[str] = None
    original_url: Optional[str] = None
    image_urls: List[str] = Field(default_factory=list)


class UserInteractions(BaseModel):
    """用户与内容的交互信息"""
    view_count: int = 0
    last_viewed: Optional[datetime] = None
    is_favorited: bool = False
    tags: List[str] = Field(default_factory=list)


class Content(BaseModel):
    """内容数据模型"""
    id: Optional[str] = None  # MongoDB的_id会自动生成
    title: str
    original_content: str
    processed_text: str
    summary: str
    source: str  # 例如：微信公众号-XX
    platform: str  # 例如：wechat, weibo, xiaohongshu, bilibili
    publish_time: datetime
    formatted_time: str
    crawl_time: datetime = Field(default_factory=datetime.now)
    topics: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    sentiment: Optional[Sentiment] = None
    entities: List[Entity] = Field(default_factory=list)
    metadata: Metadata
    value_assessment: Optional[ValueAssessment] = None
    user_interactions: UserInteractions = Field(default_factory=UserInteractions)
    
    class Config:
        schema_extra = {
            "example": {
                "title": "人工智能在医疗领域的应用",
                "original_content": "原始内容...",
                "processed_text": "处理后的内容...",
                "summary": "这是一篇关于AI在医疗领域应用的文章...",
                "source": "微信公众号-AI前沿",
                "platform": "wechat",
                "publish_time": "2023-05-20T08:30:00Z",
                "formatted_time": "2023-05-20 16:30:00",
                "topics": ["人工智能", "医疗", "技术应用"],
                "keywords": ["AI", "医疗诊断", "辅助决策"],
                "metadata": {
                    "word_count": 1250,
                    "read_time_minutes": 6,
                    "author": "张三",
                    "original_url": "https://example.com/article/123",
                    "image_urls": ["https://example.com/images/1.jpg"]
                }
            }
        }


class NotificationSettings(BaseModel):
    """通知设置"""
    email: Optional[Dict[str, Any]] = None
    wechat: Optional[Dict[str, Any]] = None
    dingtalk: Optional[Dict[str, Any]] = None
    app: Optional[Dict[str, Any]] = None


class UserPreferences(BaseModel):
    """用户偏好设置"""
    topics_of_interest: List[str] = Field(default_factory=list)
    platforms: List[str] = Field(default_factory=list)
    push_channels: List[str] = Field(default_factory=list)
    push_frequency: str = "daily"  # daily, weekly, realtime
    min_push_score: float = 7.0  # 最小推送阈值


class UserConfig(BaseModel):
    """用户配置数据模型"""
    id: Optional[str] = None
    user_id: str
    username: str
    email: str
    created_at: datetime = Field(default_factory=datetime.now)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    notification_settings: NotificationSettings = Field(default_factory=NotificationSettings)
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "user123",
                "username": "张三",
                "email": "zhangsan@example.com",
                "preferences": {
                    "topics_of_interest": ["人工智能", "健康", "科技"],
                    "platforms": ["wechat", "weibo", "bilibili"],
                    "push_channels": ["email", "wechat"],
                    "push_frequency": "daily"
                },
                "notification_settings": {
                    "email": {
                        "enabled": True,
                        "address": "zhangsan@example.com",
                        "digest_time": "18:00"
                    },
                    "wechat": {
                        "enabled": True,
                        "openid": "wx123456"
                    }
                }
            }
        }


class Relationship(BaseModel):
    """内容之间的关系"""
    source_id: str
    target_id: str
    relation_type: str  # CAUSES, FOLLOWS, CONTRADICTS, SIMILAR_TO, REFERS_TO
    properties: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "source_id": "60a5e8a9b54b12c5a8c4d786",
                "target_id": "60a5e8a9b54b12c5a8c4d787",
                "relation_type": "CAUSES",
                "properties": {
                    "description": "AI技术进步导致了医疗诊断效率提高",
                    "strength": 0.85
                }
            }
        }


class VectorEmbedding(BaseModel):
    """向量嵌入"""
    content_id: str
    vector: List[float]
    payload: Dict[str, Any] = Field(default_factory=dict)
    
    class Config:
        schema_extra = {
            "example": {
                "content_id": "60a5e8a9b54b12c5a8c4d786",
                "vector": [0.12, 0.45, 0.68, 0.92],
                "payload": {
                    "title": "人工智能在医疗领域的应用",
                    "platform": "wechat",
                    "publish_time": "2023-05-20T08:30:00Z"
                }
            }
        } 