#!/bin/bash
# Docker 容器启动脚本

# 删除默认 Nginx 配置，避免冲突
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-available/default

# 启动 PHP-FPM
php-fpm -D

# 启动 Nginx
nginx -g 'daemon off;'
