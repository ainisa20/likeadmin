# LikeAdmin Docker 快速部署指南

## 🚀 一键启动

```bash
# 启动所有服务（MySQL + Redis + App）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker logs likeadmin-app -f
```

## 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| **安装程序** | http://localhost:8088/install/install.php | 首次安装使用 |
| **管理后台** | http://localhost:8088/admin/ | 后台管理 |
| **PC 前台** | http://localhost:8088/pc/ | PC 端 |
| **手机端** | http://localhost:8088/mobile/ | H5 页面 |

## 🔧 服务端口

| 服务 | 容器端口 | 宿主机端口 | 说明 |
|------|---------|-----------|------|
| App | 80 | **8088** | Web 服务 |
| MySQL | 3306 | **3308** | 数据库 |
| Redis | 6379 | **6382** | 缓存 |

## 📋 首次安装步骤

### 1. 访问安装程序
```
http://localhost:8088/install/install.php
```

### 2. 填写数据库信息
```
数据库主机：mysql
数据库端口：3306
数据库名：likeadmin
用户名：root
密码：123456
```

### 3. 完成安装
安装完成后，系统会自动创建 `config/install.lock` 文件。

## 🔄 重新安装

如果需要重新安装系统：

```bash
# 方法1：删除容器内的锁文件
docker exec likeadmin-app rm -f /var/www/html/config/install.lock

# 方法2：重新构建镜像（会自动删除锁文件）
docker-compose build app && docker-compose up -d app
```

## 🗑️ 清理环境

```bash
# 停止所有服务
docker-compose down

# 删除数据卷（⚠️ 会删除所有数据）
docker-compose down -v

# 重新开始
docker-compose up -d
```

## 🔍 故障排查

### 查看日志
```bash
# 应用日志
docker logs likeadmin-app --tail 100

# Nginx 错误日志
docker exec likeadmin-app cat /var/log/nginx/error.log

# PHP-FPM 日志
docker exec likeadmin-app cat /var/log/php8.0-fpm.log
```

### 进入容器调试
```bash
# 进入应用容器
docker exec -it likeadmin-app bash

# 测试数据库连接
docker exec likeadmin-app php -r "new PDO('mysql:host=mysql;dbname=likeadmin','root','123456');"

# 查看 PHP 配置
docker exec likeadmin-app php -i | grep ini
```

### 常见问题

**Q: 403 Forbidden**
A: 检查 Nginx 配置，可能是路由规则问题

**Q: 500 Internal Server Error**
A: 检查数据库连接和表是否导入

**Q: 无法连接数据库**
A: 确认 .env 文件中的 HOSTNAME = mysql（不是 127.0.0.1）

## 📊 镜像信息

- **镜像大小**: 1.46GB
- **基础镜像**: php:8.0.30-fpm
- **包含组件**: Nginx + PHP-FPM + Redis 扩展
- **国内优化**: 阿里云镜像源

## 🎯 与 start.sh 的差异

| 特性 | start.sh | Docker |
|------|----------|--------|
| 环境依赖 | 本地安装 PHP/Nginx/MySQL | 容器化，无需本地环境 |
| 端口 | 8088 | 8088 |
| 数据库 | 本地 MySQL | 容器化 MySQL (3308) |
| Redis | 本地 Redis | 容器化 Redis (6382) |
| 隔离性 | 共享本地环境 | 完全隔离 |

## 📝 重要说明

1. **install.lock 处理**: Dockerfile 会自动删除此文件，允许重新安装
2. **数据持久化**: 建议挂载 volume 保存数据库数据
3. **生产环境**: 修改默认密码，配置 HTTPS，限制资源
4. **容器通信**: 容器间使用服务名（mysql/redis），不是 127.0.0.1
