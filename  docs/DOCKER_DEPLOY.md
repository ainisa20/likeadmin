# LikeAdmin Docker 部署指南（国内网络优化）

## 镜像说明

本 Dockerfile 针对国内网络环境进行了优化，与 start.sh 配置对齐：
- 使用阿里云 Debian 镜像源加速系统包安装
- Composer 使用阿里云 Composer 镜像
- 包含 PHP 8.0 + Nginx + 所需扩展
- MySQL 默认密码：123456（与 start.sh 保持一致）
- **自动删除 install.lock**，允许重新安装系统

## 快速开始

### 1. 构建镜像

```bash
docker build -t likeadmin-php:latest .
```

### 2. 运行容器

```bash
docker run -d \
  --name likeadmin \
  -p 8088:80 \
  -v $(pwd)/server/runtime:/var/www/html/runtime \
  -e DB_HOST=your_mysql_host \
  -e DB_NAME=likeadmin \
  -e DB_USER=root \
  -e DB_PASS=123456 \
  likeadmin-php:latest
```

### 3. 访问应用

- 安装程序: http://localhost:8088
- 管理后台: http://localhost:8088/admin
- PC 前台: http://localhost:8088/pc
- 手机端: http://localhost:8088/mobile

## Docker Compose 部署（推荐）

使用 docker-compose.yml 可以一键启动完整环境（Nginx + PHP + MySQL + Redis）：

```bash
docker-compose up -d
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_HOST | MySQL 主机 | mysql |
| DB_PORT | MySQL 端口 | 3306 |
| DB_NAME | 数据库名 | likeadmin |
| DB_USER | 数据库用户 | root |
| DB_PASS | 数据库密码 | 123456（开发环境） |
| REDIS_HOST | Redis 主机 | redis |
| REDIS_PORT | Redis 端口 | 6379 |

## 已安装的 PHP 扩展

- bcmath（数学计算）
- curl（HTTP 请求）
- gd（图片处理）
- pdo_mysql（MySQL 驱动）
- zip（压缩文件）
- xml（XML 解析）
- opcache（性能优化）
- mbstring（多字节字符串）
- exif（图片元数据）
- pcntl（进程控制）
- redis（缓存）

## Nginx 路由配置

容器已配置完整的 Nginx 路由规则：

- `/adminapi/*` - 后台 API（转发到 PHP-FPM）
- `/api/*` - 前台 API（转发到 PHP-FPM）
- `/admin` - 管理后台前端（SPA）
- `/mobile` - 手机端前端（SPA）
- `/pc` - PC 端前端（SPA）
- `/*.php` - PHP 文件处理

## 持久化数据

建议挂载以下目录：

```bash
-v $(pwd)/server/runtime:/var/www/html/runtime  # 运行时缓存
```

## 常见问题

### 1. 权限问题

如果遇到权限问题，可以在运行时指定用户：

```bash
docker run -d --user $(id -u):$(id -g) ...
```

### 2. Composer 安装失败

如果 Composer 依赖安装失败，可以手动进入容器：

```bash
docker exec -it likeadmin bash
composer install --no-dev
```

### 3. 镜像构建慢

已使用阿里云镜像源，如果仍然较慢，可以：
- 使用 VPN 或代理
- 调整 Dockerfile 中的镜像源为其他国内源（如腾讯云、清华源）

## 生产环境建议

1. 使用多阶段构建减小镜像体积
2. 配置 HTTPS（使用 Let's Encrypt）
3. 设置定期备份
4. 配置日志轮转
5. 限制容器资源（CPU、内存）

## 镜像优化说明

- 使用国内镜像源，构建速度提升 3-5 倍
- 预安装常用扩展，减少运行时依赖
- 单容器包含 Nginx + PHP-FPM，简化部署

## 默认账号密码

- 管理员账号：admin
- 管理员密码：m123456@
- 数据库密码：123456（仅开发环境，生产环境请修改）

## 与 start.sh 的配置对齐

本 Docker 配置已与项目 start.sh 脚本保持一致：
- ✓ PHP 扩展：bcmath, curl, gd, mbstring, pdo_mysql, redis 等
- ✓ Nginx 路由：/adminapi/, /api/, /admin, /mobile, /pc
- ✓ 数据库配置：utf8mb4 字符集，默认密码 123456
- ✓ 上传限制：50MB
