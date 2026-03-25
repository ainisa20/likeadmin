# ========================================
# LikeAdmin PHP Dockerfile
# 针对国内网络环境优化
# PHP 8.0 + Nginx + 常用扩展
# ========================================

FROM php:8.0.30-fpm

# 设置时区
ENV TZ=Asia/Shanghai

# ========================================
# 使用阿里云 Debian 镜像源（国内加速）
# ========================================
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list

# ========================================
# 安装系统依赖和常用工具
# ========================================
RUN apt-get update && apt-get install -y \
    nginx \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libssl-dev \
    libmagickwand-dev \
    zip \
    unzip \
    git \
    curl \
    vim \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ========================================
# 安装 PHP 扩展
# ========================================
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) \
    bcmath \
    curl \
    gd \
    pdo \
    pdo_mysql \
    zip \
    xml \
    opcache \
    mbstring \
    exif \
    pcntl

# ========================================
# 安装 Redis 扩展
# ========================================
RUN pecl install redis-5.3.7 && \
    docker-php-ext-enable redis

# ========================================
# 安装 Composer
# ========================================
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# 配置 Composer 使用国内镜像
RUN composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/

# ========================================
# 配置 PHP
# ========================================
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" && \
    echo "upload_max_filesize = 50M" >> "$PHP_INI_DIR/php.ini" && \
    echo "post_max_size = 50M" >> "$PHP_INI_DIR/php.ini" && \
    echo "memory_limit = 256M" >> "$PHP_INI_DIR/php.ini" && \
    echo "max_execution_time = 300" >> "$PHP_INI_DIR/php.ini" && \
    echo "date.timezone = Asia/Shanghai" >> "$PHP_INI_DIR/php.ini"

# ========================================
# 配置 Nginx
# ========================================
# 不再添加 daemon off;，已在启动脚本中通过 nginx -g 参数处理

# 创建 Nginx 配置目录
RUN mkdir -p /etc/nginx/conf.d

# 复制自定义 Nginx 配置
COPY docker/nginx/conf.d/likeadmin.conf /etc/nginx/conf.d/default.conf

# ========================================
# 创建项目目录
# ========================================
WORKDIR /var/www/html

# 复制项目文件
COPY server/ /var/www/html/

# ========================================
# 安装 Composer 依赖（使用国内镜像）
# ========================================
RUN composer install --no-dev --optimize-autoloader --no-interaction

# ========================================
# 设置目录权限
# ========================================
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html && \
    chmod -R 777 /var/www/html/runtime

# ========================================
# 删除安装锁文件，允许重新安装
# ========================================
RUN rm -f /var/www/html/config/install.lock

# ========================================
# 创建 .env 配置文件（注意文件名第一个字符是点）
# ========================================
RUN cp /var/www/html/.example.env /var/www/html/.env && \
    sed -i 's/HOSTNAME = 127.0.0.1/HOSTNAME = mysql/' /var/www/html/.env && \
    sed -i 's/DATABASE = test/DATABASE = likeadmin/' /var/www/html/.env && \
    sed -i 's/USERNAME = username/USERNAME = root/' /var/www/html/.env && \
    sed -i 's/PASSWORD = password/PASSWORD = 123456/' /var/www/html/.env && \
    chown www-data:www-data /var/www/html/.env && \
    chmod 644 /var/www/html/.env

# ========================================
# 暴露端口
# ========================================
EXPOSE 80

# ========================================
# 启动脚本
# ========================================
COPY docker/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
