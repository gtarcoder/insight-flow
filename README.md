# 个人信息助理系统

个人信息助理系统是一个综合性的个人信息管理平台，能够帮助用户整理、分析和预测各类信息，实现高效的个人信息管理。系统具有内容聚合、主题分析、趋势预测等功能，帮助用户从海量信息中获取有价值的洞察。

## 系统架构

系统分为前端和后端两个主要部分：

- **前端**：基于React/Next.js构建的Web应用，提供用户交互界面
- **后端**：基于Python构建的服务端，包含以下核心模块：
  - 数据存储管理（storage）
  - 内容处理（processor）
  - 通知推送（notifier）
  - 可视化生成（visualizer）

## 系统要求

### 后端要求
- Python 3.8+
- MongoDB 4.4+
- Redis (可选，用于缓存)

### 前端要求
- Node.js 14+
- npm 6+ 或 yarn 1.22+

## 安装与配置

### 后端安装

1. 克隆代码库：

```bash
git clone https://github.com/yourusername/personal_info_assistant.git
cd personal_info_assistant
```

2. 创建并激活虚拟环境：

```bash
python -m venv venv
# 在Windows上
venv\Scripts\activate
# 在Linux/MacOS上
source venv/bin/activate
```

3. 安装依赖：

```bash
pip install -r requirements.txt
```

4. 配置环境变量：

创建`.env`文件，并设置以下变量：

```
MONGODB_URI=mongodb://localhost:27017/info_assistant
SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key  # 如果使用OpenAI服务
WECHAT_APP_ID=your_wechat_app_id    # 如果使用微信推送
WECHAT_APP_SECRET=your_wechat_secret
```

### 前端安装

1. 进入前端目录：

```bash
cd frontend
```

2. 安装依赖：

```bash
npm install
# 或使用yarn
yarn install
```

3. 配置环境变量：

创建`.env.local`文件，并设置：

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 启动服务

### 启动后端服务

1. 确保MongoDB服务已启动

2. 在虚拟环境中，从项目根目录运行：

```bash
cd personal_info_assistant
python -m src.main
```

后端服务将在`http://localhost:8000`启动。

### 启动前端服务

在前端目录中运行：

```bash
# 开发模式
npm run dev
# 或
yarn dev

# 生产模式
npm run build
npm run start
# 或
yarn build
yarn start
```

前端服务将在`http://localhost:3000`启动。

## API文档

启动后端服务后，可以通过访问`http://localhost:8000/docs`查看API文档。

## 使用指南

1. 打开浏览器访问`http://localhost:3000`
2. 在首次使用时，配置您的用户偏好设置
3. 开始使用系统功能：
   - 浏览内容：查看已聚合的各平台信息
   - 历史追踪：分析特定主题或实体的历史演变
   - 趋势预测：查看基于历史数据的未来预测
   - 搜索功能：快速查找所需信息

## 微信推送配置

若要启用微信推送功能，请按照以下步骤操作：

1. 在微信公众平台创建应用
2. 获取AppID和AppSecret
3. 更新`.env`文件中的相关配置
4. 在系统设置中启用推送功能

## 常见问题

### 后端启动失败

- 检查MongoDB是否正常运行
- 确认环境变量配置是否正确
- 查看日志文件获取详细错误信息

### 前端无法连接后端

- 确认后端服务是否正常运行
- 检查`NEXT_PUBLIC_API_URL`配置是否正确
- 确认没有跨域限制问题

### 微信推送失败

- 验证微信配置是否正确
- 检查用户是否已绑定微信账号
- 查看后端日志了解详细错误

## 开发指南

如需进行系统二次开发，请参考以下指南：

- 后端API扩展：在`src/api`目录中添加新的路由和处理函数
- 前端组件开发：在`frontend/src/components`目录中添加新组件
- 数据模型扩展：在`src/storage/models.py`中定义新的数据模型

## 许可证

本项目采用MIT许可证。详情请查看LICENSE文件。
