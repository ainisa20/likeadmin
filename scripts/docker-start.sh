#!/bin/bash

set -e

echo "=========================================="
echo "  LikeAdmin Docker 启动脚本"
echo "=========================================="

if [ ! -f ".env" ]; then
    echo "创建 .env 文件..."
    cp .env.example .env
fi

echo ""
echo ">>> 创建必要目录..."
mkdir -p data/mysql data/redis log/nginx/logs

echo ""
echo ">>> 启动 Docker 容器..."
docker-compose up -d

echo ""
echo ">>> 等待服务启动..."
sleep 5

echo ""
echo ">>> 检查服务状态..."
docker-compose ps

echo ""
echo "=========================================="
echo "  启动成功！"
echo "=========================================="
echo ""
echo "访问地址："
echo "  http://localhost:18088"
echo ""
echo "提示："
echo "  如需使用域名，请将以下内容添加到 /etc/hosts："
echo "  127.0.0.1 www.likeadmin.host"
echo ""
echo "常用命令："
echo "  查看日志: docker-compose logs -f [服务名]"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
