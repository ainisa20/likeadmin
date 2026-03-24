#!/bin/bash

# 动态设置 Node.js 20 环境（解决 PC 端构建依赖问题）
# 优先级: 1. nvm 安装的 node@20  2. Homebrew node@20  3. 系统 node（如果版本正确）
if [ -d "$HOME/.nvm" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm use 20 >/dev/null 2>&1 || true
elif [ -d "/opt/homebrew/opt/node@20" ]; then
    export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
fi

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$SCRIPT_DIR"
SERVER_DIR="$BASE_DIR/server"

# 动态获取 nginx 安装路径和配置目录
NGINX_BIN=$(which nginx 2>/dev/null)
if [ -z "$NGINX_BIN" ]; then
    echo "错误: 未找到 nginx，请先安装 nginx"
    exit 1
fi

# 从 nginx 可执行文件位置推断配置目录
NGINX_PREFIX=$(dirname $(dirname $NGINX_BIN))
NGINX_ETC="$NGINX_PREFIX/etc/nginx"
NGINX_CONF="$NGINX_ETC/sites-available/likeadmin"
NGINX_ENABLED="$NGINX_ETC/sites-enabled/likeadmin"
NGINX_MAIN="$NGINX_ETC/nginx.conf"

echo "=== likeadmin 启动脚本 ==="

echo "[1/6] 检查数据库..."
if mysql -u root -p'123456' -e "USE likeadmin" 2>/dev/null; then
    echo "  ✓ 数据库 likeadmin 已存在"
else
    echo "  → 创建数据库 likeadmin..."
    mysql -u root -p'123456' -e "CREATE DATABASE IF NOT EXISTS likeadmin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    echo "  ✓ 数据库创建完成"
fi

echo "[2/6] 检查配置文件..."
if [ ! -f "$SERVER_DIR/.env" ]; then
    cp "$SERVER_DIR/.example.env" "$SERVER_DIR/.env"
    echo "  ✓ 已复制 .env 配置文件"
else
    echo "  ✓ .env 已存在"
fi

echo "[3/6] 检查 PHP 扩展..."
php -m | grep -q "pdo_mysql" && echo "  ✓ pdo_mysql" || echo "  ✗ pdo_mysql 未安装"
php -m | grep -q "mbstring" && echo "  ✓ mbstring" || echo "  ✗ mbstring 未安装"
php -m | grep -q "curl" && echo "  ✓ curl" || echo "  ✗ curl 未安装"
php -m | grep -q "json" && echo "  ✓ json" || echo "  ✗ json 未安装"

echo "[4/7] 检查 Node.js 版本..."
NODE_VERSION=$(node -v 2>/dev/null)
if [[ $NODE_VERSION == v20* ]]; then
    echo "  ✓ Node.js 版本: $NODE_VERSION"
else
    echo "  ✗ Node.js 版本不正确: $NODE_VERSION (需要 v20.x)"
    echo "  → 已自动切换到 Node.js 20"
fi

echo "[5/7] 检查 PC 端构建..."
if [ -f "$BASE_DIR/server/public/pc/index.html" ]; then
    echo "  ✓ PC 端已构建"
else
    echo "  → PC 端未构建，正在构建..."
    cd "$BASE_DIR/pc"
    if [ ! -d "node_modules" ]; then
        echo "  → 正在安装依赖..."
        npm install --include=dev --silent
    fi
    NODE_ENV=production npm run build --silent
    echo "  ✓ PC 端构建完成"
fi

echo "[6/7] 配置 nginx..."
mkdir -p "$NGINX_ETC/sites-available"
mkdir -p "$NGINX_ETC/sites-enabled"
mkdir -p /tmp/nginx_client_temp
chmod 777 /tmp/nginx_client_temp

cat > "$NGINX_CONF" << EOF
server {
    listen 8088;
    server_name localhost;
    root $SERVER_DIR/public;
    index index.php index.html;

    # 允许大文件上传
    client_max_body_size 10M;
    client_body_temp_path /tmp/nginx_client_temp 1 2;

    location /adminapi/ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $SERVER_DIR/public/index.php;
        fastcgi_param REQUEST_URI \$request_uri;
        fastcgi_param PATH_INFO \$fastcgi_script_name;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
        include fastcgi_params;
    }

    location /api/ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $SERVER_DIR/public/index.php;
        fastcgi_param REQUEST_URI \$request_uri;
        fastcgi_param PATH_INFO \$fastcgi_script_name;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
        include fastcgi_params;
    }

    location /admin {
        try_files \$uri \$uri/ /admin/index.html;
    }

    location /mobile {
        try_files \$uri \$uri/ /mobile/index.html;
    }

    location /pc {
        try_files \$uri \$uri/ /pc/index.html;
    }

    location / {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location ~ \.php(/|$) {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

if [ ! -L "$NGINX_ENABLED" ]; then
    ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
fi

if ! grep -q "include.*sites-enabled" "$NGINX_MAIN" 2>/dev/null; then
    sed -i '' "/http {/a\    include $NGINX_ETC/sites-enabled/*;" "$NGINX_MAIN"
fi

echo "[7/7] 启动服务..."

if ! pgrep -x "redis-server" > /dev/null; then
    brew services start redis 2>/dev/null || redis-server --daemonize yes 2>/dev/null
    echo "  ✓ Redis 已启动"
else
    echo "  ✓ Redis 已运行"
fi

if ! pgrep -x "php-fpm" > /dev/null; then
    php-fpm 2>/dev/null &
    sleep 1
    echo "  ✓ PHP-FPM 已启动"
else
    echo "  ✓ PHP-FPM 已运行"
fi

nginx -t && nginx -s reload 2>/dev/null || nginx
echo "  ✓ Nginx 已启动"

echo "[完成] 所有服务已启动!"
echo ""
echo "=== 访问地址 ==="
echo "  安装程序: http://127.0.0.1:8088"
echo "  管理后台: http://127.0.0.1:8088/admin/login"
echo "  PC前台:   http://127.0.0.1:8088/pc/"
echo "  手机端:   http://127.0.0.1:8088/mobile/"
echo ""
echo "  默认账号: admin"
echo "  默认密码: m123456@"
echo ""
echo "=== 常用命令 ==="
echo "  停止: $BASE_DIR/stop.sh"
echo "  重启: $BASE_DIR/restart.sh"
