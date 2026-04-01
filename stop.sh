#!/bin/bash

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR"

# 动态获取 nginx 路径（用于停止 nginx）
NGINX_BIN=$(which nginx 2>/dev/null)

echo "=== likeadmin 停止服务 ==="

echo "[1/5] 检查正在运行的服务..."
PHP_RUNNING=false
REDIS_RUNNING=false
NGINX_RUNNING=false

pgrep -f "php-fpm" > /dev/null && PHP_RUNNING=true
pgrep -f "redis-server" > /dev/null && REDIS_RUNNING=true
pgrep -f "nginx" > /dev/null && NGINX_RUNNING=true

echo "  PHP-FPM:   $([ "$PHP_RUNNING" = true ] && echo "运行中" || echo "未运行")"
echo "  Redis:     $([ "$REDIS_RUNNING" = true ] && echo "运行中" || echo "未运行")"
echo "  Nginx:     $([ "$NGINX_RUNNING" = true ] && echo "运行中" || echo "未运行")"

echo ""
echo "[2/5] 停止 PHP-FPM..."
if [ "$PHP_RUNNING" = true ]; then
    pkill -f "php-fpm"
    sleep 1
    if pgrep -f "php-fpm" > /dev/null; then
        echo "  ⚠ PHP-FPM 停止失败，强制终止..."
        pkill -9 -f "php-fpm"
    fi
    echo "  ✓ PHP-FPM 已停止"
else
    echo "  ✓ PHP-FPM 未运行"
fi

echo "[3/5] 停止 Redis..."
if [ "$REDIS_RUNNING" = true ]; then
    # 尝试使用 brew services stop（如果是 Homebrew 安装的）
    if brew services list 2>/dev/null | grep -q "redis.*started"; then
        brew services stop redis >/dev/null 2>&1
    else
        pkill -f "redis-server"
    fi
    sleep 1
    if pgrep -f "redis-server" > /dev/null; then
        echo "  ⚠ Redis 停止失败，强制终止..."
        pkill -9 -f "redis-server"
    fi
    echo "  ✓ Redis 已停止"
else
    echo "  ✓ Redis 未运行"
fi

echo "[4/5] 停止 Nginx..."
if [ "$NGINX_RUNNING" = true ]; then
    if [ -n "$NGINX_BIN" ]; then
        $NGINX_BIN -s stop 2>/dev/null
    else
        pkill -f "nginx"
    fi
    sleep 1
    if pgrep -f "nginx" > /dev/null; then
        echo "  ⚠ Nginx 停止失败，强制终止..."
        pkill -9 -f "nginx"
    fi
    echo "  ✓ Nginx 已停止"
else
    echo "  ✓ Nginx 未运行"
fi

echo "[5/5] 验证服务状态..."
REMAINING=0
pgrep -f "php-fpm" > /dev/null && { echo "  ✗ PHP-FPM 仍在运行"; REMAINING=$((REMAINING + 1)); }
pgrep -f "redis-server" > /dev/null && { echo "  ✗ Redis 仍在运行"; REMAINING=$((REMAINING + 1)); }
pgrep -f "nginx" > /dev/null && { echo "  ✗ Nginx 仍在运行"; REMAINING=$((REMAINING + 1)); }

if [ $REMAINING -eq 0 ]; then
    echo "  ✓ 所有服务已完全停止"
else
    echo "  ⚠ 有 $REMAINING 个服务仍在运行"
fi

echo ""
if [ $REMAINING -eq 0 ]; then
    echo "=== 所有服务已成功停止 ==="
else
    echo "=== 部分服务停止失败 ==="
    echo "提示: 可以使用 'pkill -9 <进程名>' 强制终止"
    exit 1
fi
