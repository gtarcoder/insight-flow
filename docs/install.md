# InsightFlow - Mac安装指南

本文档提供在Mac电脑上安装和启动InsightFlow系统的简化步骤。

## 系统要求

- macOS 10.15 (Catalina) 或更高版本
- 至少8GB内存（推荐16GB或更高）
- 至少10GB可用磁盘空间
- 管理员权限
- Docker Desktop for Mac

## 1. 准备工作

### 安装Docker Desktop

如果尚未安装Docker Desktop，请从[Docker官网](https://www.docker.com/products/docker-desktop)下载并安装。

### 验证Docker安装

```bash
docker --version
docker-compose --version
```

## 2. 获取项目代码

```bash
git clone https://github.com/gtarcoder/insight-flow.git
cd insight-flow
```

## 3. 配置环境变量

在项目根目录创建`.env`文件:

```bash
touch .env
```

编辑`.env`文件，配置以下环境变量（请根据需要修改）:

```
# 数据库配置
MONGO_USER=admin
MONGO_PASSWORD=secure_password
REDIS_PASSWORD=redis_secure_password
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j_password
NEO4J_AUTH=${NEO4J_USER}/${NEO4J_PASSWORD}

# 应用配置
SECRET_KEY=your_secret_key_here
OPENAI_API_KEY=your_openai_api_key

# 微信推送配置（可选）
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret

# 前端API配置
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 4. 使用控制脚本管理系统

项目提供了一个便捷的控制脚本 `insightctl.sh` 来简化系统管理。首先需要设置脚本为可执行:

```bash
chmod +x ./insightctl.sh
```

### 启动系统

使用以下命令启动所有服务:

```bash
./insightctl.sh start
```

首次启动时会自动构建镜像，可能需要5-10分钟，请耐心等待。

### 检查系统状态

```bash
./insightctl.sh status
```

所有服务状态应显示为"Up"。

### 查看系统日志

```bash
# 查看所有日志
./insightctl.sh logs

# 查看后端日志
./insightctl.sh log-backend

# 查看前端日志
./insightctl.sh log-frontend
```

## 5. 访问系统

系统启动后，可通过以下地址访问:

- 前端界面: [http://localhost:3000](http://localhost:3000)
- 后端API: [http://localhost:8000](http://localhost:8000)
- API文档: [http://localhost:8000/docs](http://localhost:8000/docs)
- Neo4j浏览器: [http://localhost:7474](http://localhost:7474)

## 6. 系统运维

### 停止系统

```bash
./insightctl.sh stop
```

### 重启系统

```bash
./insightctl.sh restart
```

### 开发模式

要在开发模式下运行系统（启用热重载）:

```bash
./insightctl.sh dev
```

### 更新系统

当有新版本代码需要部署时:

```bash
./insightctl.sh update
```

该命令会自动拉取最新代码、停止服务、重新构建并启动。

### 查看所有可用命令

```bash
./insightctl.sh
```

或

```bash
./insightctl.sh help
```

## 7. 数据管理

系统数据存储在Docker卷中，即使容器被删除，数据也会保留。

### MongoDB数据备份

```bash
# 创建备份目录
mkdir -p ~/mongodb_backups

# 执行备份
docker exec -it insight-mongo mongodump --username ${MONGO_USER} --password ${MONGO_PASSWORD} --authenticationDatabase admin --out /data/db/backup

# 复制备份到主机
docker cp insight-mongo:/data/db/backup ~/mongodb_backups/backup_$(date +%Y%m%d)
```

### Neo4j数据备份

```bash
# 创建备份目录
mkdir -p ~/neo4j_backups

# 执行备份
docker exec -it insight-neo4j neo4j-admin dump --database=neo4j --to=/data/backup.dump

# 复制备份到主机
docker cp insight-neo4j:/data/backup.dump ~/neo4j_backups/backup_$(date +%Y%m%d).dump
```

## 8. 常见问题排查

### 端口冲突

如果遇到端口冲突，需要修改`docker/docker-compose.yml`中的端口映射，例如将8000改为8001，然后重启服务:

```bash
./insightctl.sh stop
# 修改配置文件后
./insightctl.sh start
```

### 数据库连接问题

确保`.env`文件中的数据库凭据正确。可通过查看日志定位问题:

```bash
./insightctl.sh log-backend
```

### 内存不足问题

如果在Mac上遇到内存问题，可在Docker Desktop中增加分配的内存资源:
Docker Desktop → Settings → Resources → Memory

## 配置系统

InsightFlow 使用两种配置机制：

1. **config.yml**: 主要配置文件，包含所有应用配置
2. **环境变量**: 可以覆盖配置文件中的设置，适合容器环境

### 配置优先级

1. 环境变量 (最高优先级)
2. config.yml 文件
3. 默认值 (最低优先级)

### 环境变量映射

以下环境变量可以覆盖相应的配置项：

| 环境变量 | 配置文件路径 | 说明 |
|---------|------------|------|
| MONGODB_URI | database.mongodb.uri | MongoDB连接字符串 |
| NEO4J_URI | database.neo4j.uri | Neo4j连接URI |
| NEO4J_USER | database.neo4j.username | Neo4j用户名 |
| NEO4J_PASSWORD | database.neo4j.password | Neo4j密码 |
| REDIS_URI | scheduler.redis_url | Redis连接URI |
| QDRANT_HOST | database.qdrant.url | Qdrant服务器URL |
| OPENAI_API_KEY | llm.api_key | OpenAI API密钥 |
| WECHAT_APP_ID | push_channels.wechat.app_id | 微信小程序ID |
| WECHAT_APP_SECRET | push_channels.wechat.app_secret | 微信小程序密钥 |
| SECRET_KEY | security.secret_key | 应用安全密钥 |

### 验证配置

使用以下命令验证配置是否有效：

```bash
./insightctl.sh validate-config
```

### 配置文件示例

详细的配置结构请参考 `config.yml.example` 文件。

## 结语

现在您已经成功在Mac上部署InsightFlow系统。通过`insightctl.sh`脚本，您可以轻松管理系统的各个方面。如有问题，请查阅项目文档或提交Issue获取支持。 