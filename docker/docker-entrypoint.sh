#!/bin/bash
# Docker 容器启动脚本

# 启动 PHP-FPM
php-fpm -D

# 启动 Nginx
nginx -g 'daemon off;'
