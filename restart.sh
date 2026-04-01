#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR"
STOP_SCRIPT="$BASE_DIR/stop.sh"
START_SCRIPT="$BASE_DIR/start.sh"

# 检查脚本是否存在
if [ ! -f "$STOP_SCRIPT" ]; then
    echo "错误: 未找到停止脚本 $STOP_SCRIPT"
    exit 1
fi

if [ ! -f "$START_SCRIPT" ]; then
    echo "错误: 未找到启动脚本 $START_SCRIPT"
    exit 1
fi

echo "=== likeadmin 重启服务 ==="
echo ""

echo "[1/2] 停止服务..."
bash "$STOP_SCRIPT"
STOP_RESULT=$?

if [ $STOP_RESULT -ne 0 ]; then
    echo ""
    echo "⚠ 警告: 停止服务时出现问题"
    echo "是否继续启动服务？(y/n)"
    read -r response
    if [[ ! $response =~ ^[Yy]$ ]]; then
        echo "已取消重启"
        exit 1
    fi
fi

echo ""
echo "[2/2] 启动服务..."
bash "$START_SCRIPT"
START_RESULT=$?

echo ""
if [ $START_RESULT -eq 0 ]; then
    echo "=== 重启完成 ==="
else
    echo "=== 重启失败 ==="
    exit 1
fi
