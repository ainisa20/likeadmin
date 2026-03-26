FROM php:8.0-fpm-alpine

LABEL maintainer="likeadmin"

WORKDIR /var/www/html/server

RUN apk add --no-cache --virtual .build-deps \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    wget \
    git \
    oniguruma-dev \
    autoconf \
    automake \
    libtool \
    gcc \
    g++ \
    make \
    && apk add --no-cache \
    libzip \
    freetype \
    libjpeg-turbo \
    libpng \
    libgcc \
    libstdc++ \
    icu-dev

RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo \
    pdo_mysql \
    zip \
    opcache \
    bcmath \
    mbstring \
    exif \
    intl

RUN pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

EXPOSE 9000

CMD ["php-fpm"]
