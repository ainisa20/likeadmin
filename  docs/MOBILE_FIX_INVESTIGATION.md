# Mobile 前端 API 配置修复

## 问题分析

原始 docker_old 使用的是**分离式架构**：
- Nginx 容器
- PHP-FPM 容器
- MySQL 容器
- Redis 容器

我们现在是**单容器架构**（Nginx + PHP-FPM 在一起），这导致配置方式不同。

## 解决方案

### 方案 1：参考原始配置（推荐）

按照 docker_old 的方式重新构建：

```yaml
# docker-compose.yml (分离式架构)
services:
  nginx:
    image: registry.cn-guangzhou.aliyuncs.com/likeadmin/nginx:1.23.1
    ports:
      - "8088:80"
    volumes:
      - ./server:/likeadmin_php/server
      - ./docker_old/config/nginx/conf.d:/etc/nginx/conf.d

  php:
    image: registry.cn-guangzhou.aliyuncs.com/likeadmin/php:8.0.30.3-fpm
    volumes:
      - ./server:/likeadmin_php/server

  mysql:
    image: registry.cn-guangzhou.aliyuncs.com/likeadmin/mysql:5.7.44
    environment:
      MYSQL_ROOT_PASSWORD: 123456

  redis:
    image: registry.cn-guangzhou.aliyuncs.com/likeadmin/redis:7.4.0
```

### 方案 2：修复当前单容器架构（快速）

修改 mobile 前端的配置，使其与当前架构兼容。

## 🔍 检查当前问题

让我先检查 mobile 前端到底使用了什么 API 配置：
