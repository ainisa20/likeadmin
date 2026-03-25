# ========================================
# LikeAdmin PHP Dockerfile (优化版)
# 多阶段构建 + 安全加固 + 性能优化
# PHP 8.0 + Nginx + 常用扩展
# ========================================

# ========================================
# Stage 1: 构建阶段
# 用于安装 Composer 依赖和构建前端资源
# ========================================
FROM php:8.0.30-fpm AS builder

# 设置工作目录
WORKDIR /build

# 安装系统依赖和 PHP 扩展
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    && rm -rf /var/lib/apt/lists/*

# 安装 PHP 扩展（builder 阶段也需要）
RUN docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install -j$(nproc) \
    bcmath \
    curl \
    gd \
    pdo \
    pdo_mysql \
    zip \
    xml \
    mbstring \
    exif \
    pcntl

# 安装 Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 复制 composer 文件（利用 Docker 缓存）
COPY server/composer.json server/composer.lock ./server/

# 安装 Composer 依赖（禁用脚本，因为 think 文件还没复制）
RUN cd server && composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# 复制整个 server 目录（包含 think 文件）
COPY server/ /build/server/

# ========================================
# Stage 2: 运行阶段
# 最终镜像，只包含运行时依赖
# ========================================
FROM php:8.0.30-fpm

# 设置时区
ENV TZ=Asia/Shanghai \
    # PHP 配置
    UPLOAD_MAX_FILESIZE=50M \
    POST_MAX_SIZE=50M \
    MEMORY_LIMIT=256M \
    MAX_EXECUTION_TIME=300

# ========================================
# 使用阿里云 Debian 镜像源（国内加速）
# ========================================
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list

# ========================================
# 仅安装运行时依赖
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
# 配置 PHP
# ========================================
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" && \
    echo "upload_max_filesize = ${UPLOAD_MAX_FILESIZE}" >> "$PHP_INI_DIR/php.ini" && \
    echo "post_max_size = ${POST_MAX_SIZE}" >> "$PHP_INI_DIR/php.ini" && \
    echo "memory_limit = ${MEMORY_LIMIT}" >> "$PHP_INI_DIR/php.ini" && \
    echo "max_execution_time = ${MAX_EXECUTION_TIME}" >> "$PHP_INI_DIR/php.ini" && \
    echo "date.timezone = ${TZ}" >> "$PHP_INI_DIR/php.ini" && \
    echo "opcache.enable=1" >> "$PHP_INI_DIR/php.ini" && \
    echo "opcache.memory_consumption=128" >> "$PHP_INI_DIR/php.ini" && \
    echo "opcache.interned_strings_buffer=8" >> "$PHP_INI_DIR/php.ini" && \
    echo "opcache.max_accelerated_files=10000" >> "$PHP_INI_DIR/php.ini" && \
    echo "opcache.revalidate_freq=2" >> "$PHP_INI_DIR/php.ini"

# ========================================
# 配置 Nginx
# ========================================
RUN mkdir -p /etc/nginx/conf.d

# 复制优化的 Nginx 配置
COPY docker/nginx/conf.d/likeadmin.conf /etc/nginx/conf.d/default.conf

# ========================================
# 复制项目文件
# ========================================
WORKDIR /var/www/html

# 复制源代码
COPY server/ /var/www/html/

# 从构建阶段复制 vendor 目录
COPY --from=builder /build/server/vendor/ /var/www/html/vendor/

# ========================================
# 设置目录权限（使用最小权限原则）
# ========================================
# 创建必要的目录
RUN mkdir -p /var/www/html/runtime/cache \
    /var/www/html/runtime/log \
    /var/www/html/runtime/temp

# 设置所有权和权限
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html && \
    chmod -R 750 /var/www/html/runtime && \
    chmod -R 770 /var/www/html/runtime/cache && \
    chmod -R 770 /var/www/html/runtime/log && \
    chmod -R 770 /var/www/html/runtime/temp

# ========================================
# 环境变量配置（支持运行时覆盖）
# ========================================
ARG DB_HOST=mysql
ARG DB_PORT=3306
ARG DB_NAME=likeadmin
ARG DB_USER=root
ARG DB_PASS=
ARG REDIS_HOST=redis
ARG REDIS_PORT=6379

# 创建 .env 配置文件模板
RUN if [ ! -f /var/www/html/.env ]; then \
        cp /var/www/html/.example.env /var/www/html/.env; \
    fi && \
    sed -i "s/HOSTNAME = 127.0.0.1/HOSTNAME = ${DB_HOST}/" /var/www/html/.env && \
    sed -i "s/HOSTPORT = 3306/HOSTPORT = ${DB_PORT}/" /var/www/html/.env && \
    sed -i "s/DATABASE = test/DATABASE = ${DB_NAME}/" /var/www/html/.env && \
    sed -i "s/USERNAME = username/USERNAME = ${DB_USER}/" /var/www/html/.env && \
    sed -i "s/PASSWORD = password/PASSWORD = ${DB_PASS}/" /var/www/html/.env && \
    chown www-data:www-data /var/www/html/.env && \
    chmod 640 /var/www/html/.env

# ========================================
# 暴露端口
# ========================================
EXPOSE 80

# ========================================
# 健康检查
# ========================================
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD php-fpm-healthcheck || exit 1 && \
    curl -f http://localhost/health || exit 1

# ========================================
# 使用 tini 作为 init 系统
# ========================================
RUN apt-get update && apt-get install -y tini && rm -rf /var/lib/apt/lists/*

# ========================================
# 启动脚本（支持信号处理）
# ========================================
COPY docker/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/bin/tini", "--", "docker-entrypoint.sh"]
