#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any

# 导入必要的模块
from processor.llm_processor import LLMProcessor
from storage.database_manager import DatabaseManager
from analyzer.relationship_analyzer import RelationshipAnalyzer
from visualizer.graph_generator import GraphVisualizer
from config.config import Config

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建FastAPI应用实例
app = FastAPI(
    title="InsightFlow API",
    description="个人信息管理系统API",
    version="0.1.0",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应设置为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 依赖项注入 - 数据库管理器
def get_db_manager():
    config = Config()  # 创建配置对象
    db_manager = DatabaseManager(config=config)
    try:
        yield db_manager
    finally:
        db_manager.close()  # 确保关闭连接

# 依赖项注入 - LLM处理器
def get_llm_processor():
    try:
        config = Config()  # 创建配置对象
        return LLMProcessor(config=config)  # 传入配置对象
    except Exception as e:
        logger.error(f"LLM处理器初始化失败: {e}")
        raise HTTPException(status_code=500, detail=f"LLM处理器初始化失败: {str(e)}")

# 数据模型
class ContentBase(BaseModel):
    title: str
    content: str
    source: str
    platform: str

class ContentCreate(ContentBase):
    pass

class ContentResponse(ContentBase):
    id: str
    processed_text: Optional[str] = None
    summary: Optional[str] = None
    topics: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    sentiment: Optional[Dict[str, Any]] = None
    publish_time: Optional[str] = None
    
    class Config:
        orm_mode = True

# API路由
@app.get("/")
async def root():
    return {"message": "欢迎使用InsightFlow个人信息管理系统API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 内容相关API
@app.post("/contents/", response_model=ContentResponse)
async def create_content(
    content: ContentCreate, 
    db: DatabaseManager = Depends(get_db_manager),
    llm: LLMProcessor = Depends(get_llm_processor)
):
    """创建新内容"""
    try:
        # 处理内容
        processed_text = llm.understand_content(content.content)
        summary = llm.generate_summary(content.content)
        
        # 准备存储的内容数据
        content_data = {
            **content.dict(),
            "processed_text": processed_text,
            "summary": summary,
            # 其他字段可以根据实际需求添加
        }
        
        # 存储到数据库
        content_id = db.store_content(content_data)
        
        # 获取完整的内容数据
        stored_content = db.get_content(content_id)
        
        # 处理向量嵌入
        embedding = llm.get_embedding(content.content)
        db.store_vector(content_id, embedding)
        
        return {**stored_content, "id": content_id}
    except Exception as e:
        logger.error(f"创建内容时出错: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contents/", response_model=List[ContentResponse])
async def get_contents(
    skip: int = 0, 
    limit: int = 10,
    db: DatabaseManager = Depends(get_db_manager)
):
    """获取内容列表"""
    try:
        return db.get_contents(skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"获取内容列表时出错: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/contents/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: str,
    db: DatabaseManager = Depends(get_db_manager)
):
    """获取特定内容"""
    try:
        content = db.get_content(content_id)
        if not content:
            raise HTTPException(status_code=404, detail="内容不存在")
        return content
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取内容时出错: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 搜索API
@app.get("/search/", response_model=List[ContentResponse])
async def search_contents(
    query: str,
    db: DatabaseManager = Depends(get_db_manager),
    llm: LLMProcessor = Depends(get_llm_processor)
):
    """语义搜索内容"""
    try:
        # 获取查询的向量表示
        query_vector = llm.get_embedding(query)
        
        # 向量搜索
        results = db.search_vectors(query_vector, limit=10)
        
        return results
    except Exception as e:
        logger.error(f"搜索内容时出错: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 关系分析API
@app.get("/relationships/{content_id}")
async def get_relationships(
    content_id: str,
    depth: int = 2,
    db_manager: DatabaseManager = Depends(get_db_manager),
    analyzer: RelationshipAnalyzer = Depends(lambda db=Depends(get_db_manager): RelationshipAnalyzer(db)),
    visualizer: GraphVisualizer = Depends(lambda db=Depends(get_db_manager): GraphVisualizer(db))
):
    """获取内容的关系图"""
    try:
        # 分析关系
        analyzer.analyze_connections(content_id)
        
        # 生成关系图
        graph_data = visualizer.generate_relationship_graph(content_id, depth=depth)
        
        return graph_data
    except Exception as e:
        logger.error(f"获取关系图时出错: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True) 