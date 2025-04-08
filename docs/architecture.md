# 个人信息助理系统 - 系统架构

## 一、系统分层架构

个人信息助理系统采用模块化、分层设计，确保系统的可扩展性和可维护性。

### 总体架构图

![总体架构图](./images/overall_architecture.png)

### 数据流向 
```mermaid
graph TD
    subgraph "数据采集层"
        A1[爬虫模块] --> A2[内容提取器]
        A2 --> A3[数据预处理]
    end
    
    subgraph "数据处理层"
        B1[LLM处理引擎] --> B2[文本摘要生成]
        B1 --> B3[主题分类器]
        B1 --> B4[情感分析器]
    end
    
    subgraph "数据存储层"
        C1[文档数据库] -.-> C4[MongoDB]
        C2[向量数据库] -.-> C5[Qdrant]
        C3[知识图谱] -.-> C6[Neo4j]
    end
    
    subgraph "检索查询层"
        D1[语义搜索] --> D2[关键词搜索]
        D1 --> D3[相似内容检索]
    end
    
    subgraph "分析推理层"
        E1[关联分析引擎] --> E2[时序分析器]
        E1 --> E3[因果推理器]
    end
    
    subgraph "可视化展示层"
        F1[关系图生成器] --> F2[时序图绘制器]
        F1 --> F3[因果图生成器]
    end
    
    subgraph "推送服务层"
        G1[推送管理器] --> G2[价值评估引擎]
        G1 --> G3[微信推送]
        G1 --> G4[邮件推送]
        G1 --> G5[App推送]
        G1 --> G6[...其他渠道]
    end
    
    A3 --> B1
    B4 --> C1
    B4 --> C2
    B4 --> C3
    C1 --> D1
    C2 --> D1
    C3 --> D1
    D3 --> E1
    E3 --> F1
    E3 --> G1
```

## 二、核心模块详细设计

### 1. 数据采集层
```mermaid
classDiagram
    class BaseCrawler {
        <<abstract>>
        +String name
        +crawl()
        +parse_content()
        +preprocess_data()
        +run()
    }
    
    class WeChatCrawler {
        +Array accounts
        +crawl()
        +parse_content()
        +preprocess_data()
    }
    
    class WeiboCrawler {
        +Array topics
        +crawl()
        +parse_content()
        +preprocess_data()
    }
    
    class XiaoHongShuCrawler {
        +Array categories
        +crawl()
        +parse_content()
        +preprocess_data()
    }
    
    class BiliBiliCrawler {
        +Array categories
        +crawl()
        +parse_content()
        +preprocess_data()
    }
    
    class CrawlerScheduler {
        -Map crawlers
        +schedule_all()
        +add_crawler()
        +remove_crawler()
    }
    
    BaseCrawler <|-- WeChatCrawler
    BaseCrawler <|-- WeiboCrawler
    BaseCrawler <|-- XiaoHongShuCrawler
    BaseCrawler <|-- BiliBiliCrawler
    CrawlerScheduler "1" *-- "many" BaseCrawler
```

### 2. 数据处理层
```mermaid
classDiagram
    class LLMProcessor {
        +understand_content(content)
        +generate_summary(content)
        +classify_topic(content)
        +analyze_sentiment(content)
        +get_embedding(text)
        +evaluate_content(content, criteria)
        +analyze_relationship(content1, content2)
    }
    
    class ContentProcessor {
        -LLMProcessor llm_processor
        +process_content(content)
        +extract_entities(text)
        +detect_keywords(text)
        +transform_to_structured(content)
    }
    
    class NLPPipeline {
        +remove_html_tags(text)
        +tokenize(text)
        +remove_stopwords(tokens)
        +lemmatize(tokens)
        +extract_named_entities(text)
        +calculate_readability(text)
    }
    
    class SentimentAnalyzer {
        +analyze(text)
        +get_polarity_score(text)
        +get_emotion_distribution(text)
        +classify_sentiment(score)
    }
    
    ContentProcessor "1" *-- "1" LLMProcessor
    ContentProcessor "1" *-- "1" NLPPipeline
    ContentProcessor "1" *-- "1" SentimentAnalyzer
```

### 3. 数据存储层
```mermaid
classDiagram
    class DatabaseManager {
        -MongoClient mongo_client
        -QdrantClient vector_db
        -GraphDatabase graph_db
        +store_content(content)
        +store_vector(content_id, vector)
        +create_relation(relationship)
        +get_content(content_id)
        +get_contents(query, limit)
        +search_similar_vectors(vector, limit)
        +get_relationships(content_id, relationship_type, direction)
        +close()
    }
    
    class ContentRepository {
        -DatabaseManager db_manager
        +save(content)
        +find_by_id(id)
        +find_by_criteria(criteria)
        +update(id, updates)
        +delete(id)
    }
    
    class VectorRepository {
        -DatabaseManager db_manager
        +save_vector(content_id, vector, metadata)
        +search_similar(vector, limit)
        +delete_vector(content_id)
    }
    
    class GraphRepository {
        -DatabaseManager db_manager
        +create_relationship(source_id, target_id, type, properties)
        +find_relationships(content_id, types, direction)
        +delete_relationship(relationship_id)
        +find_connected(content_id, depth)
    }
    
    class Content {
        +String id
        +String title
        +String original_content
        +String processed_text
        +String summary
        +String source
        +String platform
        +DateTime publish_time
        +Array topics
        +Array keywords
        +Map sentiment
        +Array entities
        +Map metadata
        +Map value_assessment
    }
    
    class Relationship {
        +String source_id
        +String target_id
        +String relation_type
        +Map properties
    }
    
    DatabaseManager <-- ContentRepository
    DatabaseManager <-- VectorRepository
    DatabaseManager <-- GraphRepository
    ContentRepository --> Content
    GraphRepository --> Relationship
```

### 4. 检索查询层
```mermaid
classDiagram
    class SearchEngine {
        -ContentRepository content_repo
        -VectorRepository vector_repo
        -LLMProcessor llm_processor
        +search_by_keyword(keywords, limit)
        +search_by_semantic(query_text, limit)
        +hybrid_search(query, weights, limit)
        +filter_by_date(results, start_date, end_date)
        +filter_by_platform(results, platforms)
        +filter_by_sentiment(results, sentiment)
        +rank_results(results, ranking_criteria)
    }
    
    class QueryParser {
        +parse_query(raw_query)
        +extract_filters(query)
        +build_boolean_query(parsed_query)
        +identify_query_intent(raw_query)
        +expand_query_terms(terms)
    }
    
    class SearchResult {
        +content_id
        +title
        +snippet
        +relevance_score
        +source
        +publish_time
        +get_formatted()
        +get_highlighted(query_terms)
    }
    
    SearchEngine "1" *-- "1" QueryParser
    SearchEngine "1" *-- "many" SearchResult
```

### 5. 分析推理层
```mermaid
classDiagram
    class RelationshipAnalyzer {
        -DatabaseManager storage
        -LLMProcessor llm
        +analyze_connections(new_content_id)
        +find_similar_contents(content)
        +generate_temporal_graph()
        +generate_causal_graph()
        +discover_content_clusters()
        +identify_trending_topics()
        +detect_anomalies()
        +predict_future_trends(topic_id)
    }
    
    class CausalReasoner {
        -LLMProcessor llm
        -DatabaseManager storage
        +identify_causal_relations(content_id)
        +build_causal_chain(start_id, end_id)
        +evaluate_causal_strength(relation_id)
        +predict_effects(cause_id)
        +identify_common_causes(effect_ids)
    }
    
    class TemporalAnalyzer {
        -DatabaseManager storage
        +build_timeline(topic_id)
        +identify_time_patterns(content_ids)
        +detect_periodic_events(content_type)
        +measure_topic_evolution(topic_id, start_time, end_time)
        +predict_next_occurrence(event_type)
    }
    
    class PatternDetector {
        +detect_patterns(data_sequence)
        +identify_clusters(data_points)
        +find_correlations(feature_x, feature_y)
        +detect_outliers(data_points)
        +identify_trends(time_series)
    }
    
    RelationshipAnalyzer "1" *-- "1" CausalReasoner
    RelationshipAnalyzer "1" *-- "1" TemporalAnalyzer
    RelationshipAnalyzer "1" *-- "1" PatternDetector
```

### 6. 可视化展示层
```mermaid
classDiagram
    class GraphVisualizer {
        -DatabaseManager storage
        +generate_relationship_graph(central_content_id, depth)
        +generate_knowledge_graph(topic_id)
        +generate_timeline(start_date, end_date, filters)
        +generate_causal_graph(content_id)
        +export_to_image(graph, format)
        +export_to_interactive(graph)
    }
    
    class TimelineVisualizer {
        +create_timeline(events)
        +highlight_key_events(timeline, criteria)
        +add_annotations(timeline, annotations)
        +create_comparative_timeline(timeline1, timeline2)
        +create_branching_timeline(main_events, alternate_paths)
    }
    
    class CausalGraphVisualizer {
        +create_cause_effect_diagram(relations)
        +highlight_critical_paths(graph)
        +calculate_node_importance(graph)
        +color_nodes_by_attribute(graph, attribute)
        +create_force_directed_layout(graph)
    }
    
    class ChartGenerator {
        +create_pie_chart(data)
        +create_bar_chart(data)
        +create_line_chart(data)
        +create_heatmap(data)
        +create_scatter_plot(data)
        +add_legend(chart)
        +add_annotations(chart, annotations)
    }
    
    GraphVisualizer "1" *-- "1" TimelineVisualizer
    GraphVisualizer "1" *-- "1" CausalGraphVisualizer
    GraphVisualizer "1" *-- "1" ChartGenerator
```

### 7. 推送服务层
```mermaid
classDiagram
    class BasePusher {
        <<abstract>>
        +evaluate_content_value(content)
        +push_content(content)
        +format_content(content, channel_format)
        +handle_push_response(response)
    }
    
    class WeChatPusher {
        -String openid
        -String template_id
        -String app_id
        -String app_secret
        +get_access_token()
        +evaluate_content_value(content)
        +push_content(content)
        +format_wechat_message(content)
        +handle_wechat_response(response)
    }
    
    class EmailPusher {
        -String smtp_server
        -Number smtp_port
        -String sender_email
        -String sender_password
        -String recipient_email
        +evaluate_content_value(content)
        +push_content(content)
        +format_email(content)
        +add_attachments(message, attachments)
    }
    
    class DingTalkPusher {
        -String webhook_url
        -String secret
        +sign_url()
        +evaluate_content_value(content)
        +push_content(content)
        +format_dingtalk_message(content)
    }
    
    class PushManager {
        -Array pushers
        +register_pusher(pusher)
        +push_to_all_channels(content)
        +push_to_specific_channel(content, channel_names)
        +get_active_channels()
        +get_channel_status()
    }
    
    class ContentFormatter {
        +format_for_wechat(content)
        +format_for_email(content)
        +format_for_dingtalk(content)
        +format_for_app(content)
        +truncate_content(content, max_length)
        +add_tracking_info(content)
    }
    
    BasePusher <|-- WeChatPusher
    BasePusher <|-- EmailPusher
    BasePusher <|-- DingTalkPusher
    PushManager "1" *-- "many" BasePusher
    PushManager "1" *-- "1" ContentFormatter
```

## 三、系统部署架构
```mermaid
graph TD
    subgraph "客户端"
        CL[用户客户端] --> API
    end
    
    subgraph "应用服务层"
        API[REST API] --> S1
        S1[Web服务] --> S2
        S2[应用服务] --> S3
        S3[任务调度器]
    end
    
    subgraph "处理服务层"
        S3 --> P1
        P1[爬虫服务] --> P2
        P2[LLM处理服务] --> P3
        P3[可视化服务] --> P4
        P4[推送服务]
    end
    
    subgraph "数据存储层"
        P2 --> D1
        D1[(MongoDB)] --- D2[(Qdrant)]
        D2 --- D3[(Neo4j)]
    end
    
    subgraph "中间件层"
        S3 --> M1
        P1 --> M1
        P2 --> M1
        M1[Redis] --- M2[Kafka]
    end
    
    subgraph "外部服务"
        P2 --> E1
        P4 --> E2
        E1[OpenAI API]
        E2[微信/邮件/其他推送服务]
    end
```

## 四、扩展性设计

该设计方案的扩展性体现在以下几个方面：

1. **模块化设计**：每个功能独立成模块，便于扩展和替换
2. **抽象基类**：关键组件如爬虫、推送渠道等都基于抽象基类实现
3. **配置驱动**：通过配置文件控制系统行为，无需修改代码
4. **消息队列**：使用Redis/Kafka实现模块间松耦合通信
5. **插件机制**：可以轻松添加新的爬虫、分析器、推送渠道等

## 五、数据模型与存储结构

### 文档数据库 (MongoDB) 存储结构

```json
// 内容集合 (contents)
{
  "_id": ObjectId("60a5e8a9b54b12c5a8c4d786"),
  "title": "人工智能在医疗领域的应用",
  "original_content": "原始内容...",
  "processed_text": "处理后的内容...",
  "summary": "这是一篇关于AI在医疗领域应用的文章...",
  "source": "微信公众号-AI前沿",
  "platform": "wechat",
  "publish_time": ISODate("2023-05-20T08:30:00Z"),
  "formatted_time": "2023-05-20 16:30:00",
  "crawl_time": ISODate("2023-05-20T09:15:00Z"),
  "topics": ["人工智能", "医疗", "技术应用"],
  "keywords": ["AI", "医疗诊断", "辅助决策", "影像识别"],
  "sentiment": {
    "score": 0.85,
    "label": "positive",
    "emotions": {
      "joy": 0.6,
      "surprise": 0.3,
      "fear": 0.05,
      "anger": 0.0,
      "sadness": 0.05
    }
  },
  "entities": [
    {"text": "人工智能", "type": "TECHNOLOGY", "start": 0, "end": 4},
    {"text": "医疗", "type": "FIELD", "start": 5, "end": 7}
  ],
  "metadata": {
    "word_count": 1250,
    "read_time_minutes": 6,
    "author": "张三",
    "original_url": "https://example.com/article/123",
    "image_urls": ["https://example.com/images/1.jpg"]
  },
  "value_assessment": {
    "overall_score": 8.5,
    "relevance": 9,
    "timeliness": 8,
    "importance": 9,
    "uniqueness": 7
  },
  "user_interactions": {
    "view_count": 15,
    "last_viewed": ISODate("2023-05-25T14:20:00Z"),
    "is_favorited": true,
    "tags": ["重要", "医疗AI"]
  }
}

// 用户配置集合 (user_configs)
{
  "_id": ObjectId("60a5e8a9b54b12c5a8c4d787"),
  "user_id": "user123",
  "username": "张三",
  "email": "zhangsan@example.com",
  "created_at": ISODate("2023-01-15T08:30:00Z"),
  "preferences": {
    "topics_of_interest": ["人工智能", "健康", "科技"],
    "platforms": ["wechat", "weibo", "bilibili"],
    "push_channels": ["email", "wechat"],
    "push_frequency": "daily",
    "min_push_score": 7.5
  },
  "notification_settings": {
    "email": {
      "enabled": true,
      "address": "zhangsan@example.com",
      "digest_time": "18:00"
    },
    "wechat": {
      "enabled": true,
      "openid": "wx123456"
    }
  }
}
```

### 向量数据库 (Qdrant) 存储结构

```json
// 向量点
{
  "id": "60a5e8a9b54b12c5a8c4d786",  // 与MongoDB中内容的_id对应
  "vector": [0.12, 0.45, 0.68, ...],  // 1536维的embedding向量
  "payload": {
    "content_id": "60a5e8a9b54b12c5a8c4d786",
    "title": "人工智能在医疗领域的应用",
    "platform": "wechat",
    "publish_time": "2023-05-20T08:30:00Z",
    "topics": ["人工智能", "医疗", "技术应用"],
    "summary": "这是一篇关于AI在医疗领域应用的文章..."
  }
}
```

### 图数据库 (Neo4j) 存储结构

```cypher
// 内容节点
CREATE (c:Content {
  id: "60a5e8a9b54b12c5a8c4d786",
  title: "人工智能在医疗领域的应用",
  platform: "wechat",
  publish_time: "2023-05-20T08:30:00Z"
})

// 主题节点
CREATE (t:Topic {
  name: "人工智能",
  category: "技术"
})

// 实体节点
CREATE (e:Entity {
  name: "医疗诊断",
  type: "CONCEPT"
})

// 创建关系
CREATE (c)-[:BELONGS_TO]->(t)
CREATE (c)-[:MENTIONS]->(e)

// 内容之间的关系
CREATE (c1)-[:CAUSES {
  description: "AI技术进步导致了医疗诊断效率提高",
  strength: 0.85
}]->(c2)

CREATE (c1)-[:FOLLOWS {
  time_gap: "3 days",
  description: "后续进展"
}]->(c2)

CREATE (c1)-[:CONTRADICTS {
  description: "提出了不同观点",
  degree: 0.7
}]->(c2)
```
