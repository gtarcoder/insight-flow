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
}

# 主函数
case "$1" in
  start)
    echo -e "${GREEN}启动所有服务...${NC}"
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
  *)
    show_help
    ;;
esac 