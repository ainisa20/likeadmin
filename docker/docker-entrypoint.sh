#!/bin/bash
# ========================================
# Docker 容器启动脚本（优化版）
# 支持信号处理和优雅关闭
# ========================================

set -e

# 信号处理函数
handle_signal() {
    echo "[INFO] 接收到关闭信号，正在优雅关闭服务..."

    # 优雅关闭 Nginx
    if [ -n "$NGINX_PID" ]; then
        echo "[INFO] 关闭 Nginx (PID: $NGINX_PID)..."
        kill -TERM "$NGINX_PID" 2>/dev/null || true
        wait "$NGINX_PID" 2>/dev/null || true
    fi

    # 优雅关闭 PHP-FPM
    if [ -n "$PHP_FPM_PID" ]; then
        echo "[INFO] 关闭 PHP-FPM (PID: $PHP_FPM_PID)..."
        kill -TERM "$PHP_FPM_PID" 2>/dev/null || true
        wait "$PHP_FPM_PID" 2>/dev/null || true
    fi

    echo "[INFO] 所有服务已关闭"
    exit 0
}

# 注册信号处理
trap handle_signal SIGTERM SIGINT

# ========================================
# 清理默认配置
# ========================================
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-available/default

# ========================================
# 启动 PHP-FPM（前台模式）
# ========================================
echo "[INFO] 启动 PHP-FPM..."

# PHP-FPM 配置调整
if [ ! -z "$PHP_MAX_CHILDREN" ]; then
    sed -i "s/pm.max_children = .*/pm.max_children = $PHP_MAX_CHILDREN/" \
        /usr/local/etc/php-fpm.d/www.conf
fi

if [ ! -z "$PHP_START_SERVERS" ]; then
    # 确保 start_servers 不超过 max_spare_servers
    # 设置合理的默认值：start_servers=5, max_spare_servers=10, min_spare_servers=2
    sed -i "s/pm.start_servers = .*/pm.start_servers = $PHP_START_SERVERS/" \
        /usr/local/etc/php-fpm.d/www.conf
    sed -i "s/pm.max_spare_servers = .*/pm.max_spare_servers = 10/" \
        /usr/local/etc/php-fpm.d/www.conf
    sed -i "s/pm.min_spare_servers = .*/pm.min_spare_servers = 2/" \
        /usr/local/etc/php-fpm.d/www.conf
fi

# 启动 PHP-FPM（前台模式，不使用 -D 参数）
php-fpm -F &
PHP_FPM_PID=$!

echo "[INFO] PHP-FPM 已启动 (PID: $PHP_FPM_PID)"

# ========================================
# 启动 Nginx（前台模式）
# ========================================
echo "[INFO] 启动 Nginx..."

# 等待 PHP-FPM 就绪
sleep 2

# 启动 Nginx（前台模式）
nginx -g 'daemon off;' &
NGINX_PID=$!

echo "[INFO] Nginx 已启动 (PID: $NGINX_PID)"

# ========================================
# 监控进程
# ========================================
echo "[INFO] 所有服务已启动，容器运行中..."

# 等待任一子进程退出
wait -n

# 如果某个进程意外退出，关闭所有进程
EXIT_CODE=$?
echo "[ERROR] 检测到进程异常退出 (退出码: $EXIT_CODE)"
handle_signal
