# InsightFlow

InsightFlow是一个综合性的个人信息管理平台，能够帮助用户整理、分析和预测各类信息，实现高效的个人信息管理。系统具有内容聚合、主题分析、趋势预测等功能，帮助用户从海量信息中获取有价值的洞察。

## 功能特点

- **信息聚合**：自动从微信、微博、知乎等多平台采集内容
- **语义分析**：基于LLM的内容理解和主题提取
- **关系图谱**：构建内容与实体之间的关系网络
- **趋势预测**：根据历史数据分析未来趋势
- **个性化推荐**：基于用户兴趣的内容智能推送
- **全文检索**：快速查找历史信息和笔记

## 系统架构

系统采用现代化微服务架构设计，主要包含以下组件：

- **前端**：基于React/Next.js的用户界面
- **后端API**：FastAPI提供的RESTful服务
- **数据存储**：
  - MongoDB：存储文档型数据
  - Neo4j：管理关系图谱
  - Qdrant：支持语义向量搜索
  - Redis：缓存和消息队列
- **分析引擎**：基于大语言模型的内容分析处理

架构详情请参阅[系统架构文档](docs/architecture.md)。

## 快速开始

### 安装要求

- Docker Desktop (Mac/Windows) 或 Docker + Docker Compose (Linux)
- Git
- 8GB及以上内存

### 安装步骤

1. 克隆代码库：

```bash
git clone https://github.com/gtarcoder/insight-flow.git
cd insight-flow
```

2. 创建环境配置文件：

```bash
cp .env.example .env
# 使用编辑器修改.env文件中的配置项
```

3. 设置控制脚本权限：

```bash
chmod +x ./insightctl.sh
```

4. 启动系统：

```bash
./insightctl.sh start
```

系统启动后，访问以下地址：

- 前端界面：http://localhost:3000
- API文档：http://localhost:8000/docs
- Neo4j控制台：http://localhost:7474

### 系统管理

使用控制脚本可以方便地管理系统：

```bash
./insightctl.sh status    # 查看服务状态
./insightctl.sh stop      # 停止所有服务
./insightctl.sh restart   # 重启所有服务
./insightctl.sh logs      # 查看系统日志
./insightctl.sh update    # 更新系统
./insightctl.sh dev       # 以开发模式启动
```

查看所有可用命令：

```bash
./insightctl.sh help
```

详细的安装和配置指南请参阅[安装文档](docs/install.md)。

## 开发指南

### 代码结构

```
insight-flow/
├── docker/                # Docker相关配置
├── docs/                  # 项目文档
├── frontend/              # 前端React应用
├── src/                   # 后端Python代码
│   ├── api/               # API接口定义
│   ├── processor/         # 内容处理模块
│   ├── storage/           # 数据存储模块
│   └── visualizer/        # 可视化模块
└── insightctl.sh          # 系统控制脚本
```

### 开发模式

启动开发环境（支持代码热重载）：

```bash
./insightctl.sh dev
```

### API开发

新API端点应在`src/api`目录下添加，遵循FastAPI的路由定义方式。

### 前端开发

前端代码位于`frontend`目录，使用Next.js框架。修改后会自动热重载。

## 数据模型

系统数据模型设计请参阅[数据库模式文档](docs/db_schema.md)。

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议。请遵循以下步骤：

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

本项目采用MIT许可证。详情请查看LICENSE文件。

## 联系方式

如有问题或建议，请通过以下方式联系我们：

- 项目Issues页面
- 电子邮件：your.email@example.com 