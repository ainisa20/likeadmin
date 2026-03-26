#!/bin/bash

set -e

echo "=========================================="
echo "  LikeAdmin 前端构建脚本"
echo "=========================================="

if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

echo ""
echo ">>> 构建 Admin 后台..."
cd admin
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi
echo "执行构建..."
npm run build
cd ..

echo ""
echo ">>> 构建 PC 前台..."
cd pc
if [ ! -d "node_modules" ]; then
    echo "安装依赖..."
    npm install
fi
echo "执行构建..."
npm run build
cd ..

echo ""
echo "=========================================="
echo "  构建完成！"
echo "=========================================="
echo ""
echo "现在可以启动 Docker 了："
echo "  ./scripts/docker-start.sh"
echo ""
