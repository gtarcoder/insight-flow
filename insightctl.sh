#!/bin/bash

# 设置彩色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 帮助信息
function show_help {
  echo -e "${BLUE}InsightFlow系统控制脚本${NC}"
  echo "用法: ./insightctl.sh [命令]"
  echo ""
  echo "可用命令:"
  echo "  start       启动所有服务"
  echo "  stop        停止所有服务"
  echo "  restart     重启所有服务"
  echo "  status      查看服务状态"
  echo "  logs        查看所有日志"
  echo "  log-backend 查看后端日志"
  echo "  log-frontend 查看前端日志"
  echo "  dev         以开发模式启动"
  echo "  update      更新并重建服务"
  echo "  rebuild     重新构建所有服务"
  echo "  validate-config 验证配置文件"
}

# 主函数
case "$1" in
  start)
    echo -e "${GREEN}启动所有服务...${NC}"
    # 检查配置文件是否存在
    if [ ! -f "config.yml" ]; then
      echo -e "${BLUE}config.yml 文件不存在，从示例创建...${NC}"
      cp config.yml.example config.yml
      echo -e "${YELLOW}请编辑 config.yml 文件填入必要的配置信息${NC}"
      exit 1
    fi
    
    # 先验证配置
    echo -e "${BLUE}验证配置...${NC}"
    bash ./insightctl.sh validate-config
    if [ $? -ne 0 ]; then
      echo -e "${RED}配置验证失败，请修正后重试${NC}"
      exit 1
    fi
    
    docker-compose -f docker/docker-compose.yml up -d
    ;;
  stop)
    echo -e "${GREEN}停止所有服务...${NC}"
    docker-compose -f docker/docker-compose.yml down
    ;;
  restart)
    echo -e "${GREEN}重启所有服务...${NC}"
    docker-compose -f docker/docker-compose.yml restart
    ;;
  status)
    echo -e "${GREEN}服务状态:${NC}"
    docker-compose -f docker/docker-compose.yml ps
    ;;
  logs)
    echo -e "${GREEN}显示所有日志:${NC}"
    docker-compose -f docker/docker-compose.yml logs
    ;;
  log-backend)
    echo -e "${GREEN}显示后端日志:${NC}"
    docker-compose -f docker/docker-compose.yml logs -f backend
    ;;
  log-frontend)
    echo -e "${GREEN}显示前端日志:${NC}"
    docker-compose -f docker/docker-compose.yml logs -f frontend
    ;;
  dev)
    echo -e "${GREEN}以开发模式启动...${NC}"
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d
    ;;
  update)
    echo -e "${GREEN}更新并重建服务...${NC}"
    git pull
    docker-compose -f docker/docker-compose.yml down
    docker-compose -f docker/docker-compose.yml up -d --build
    ;;
  rebuild)
    echo -e "${GREEN}重新构建所有服务...${NC}"
    docker-compose -f docker/docker-compose.yml build
    ;;
  validate-config)
    echo -e "${GREEN}验证配置文件...${NC}"
    # 检查配置文件是否存在
    if [ ! -f "config.yml" ]; then
      echo -e "${RED}config.yml 文件不存在，请从 config.yml.example 创建${NC}"
      exit 1
    fi
    
    # 运行配置验证
    docker-compose -f docker/docker-compose.yml run --rm backend python -m src.app --validate-only --config /app/config.yml
    ;;
  *)
    show_help
    ;;
esac 