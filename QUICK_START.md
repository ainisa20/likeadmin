# LikeAdmin Docker 快速启动指南

## 🚀 三步启动

### 1️⃣ 配置环境

```bash
cp .env.example .env
```

### 2️⃣ 构建前端

```bash
./scripts/build-all.sh
```

### 3️⃣ 启动服务

```bash
./scripts/docker-start.sh
```

---

## 🌐 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 后端 API | http://localhost:18088 | API 接口 |
| Admin 后台 | http://admin.likeadmin.local:18088 | 管理后台 |
| PC 前台 | http://pc.likeadmin.local:18088 | PC 端 |
| 移动端 H5 | http://mobile.likeadmin.local:18088 | 移动端（可选）|
| phpMyAdmin | http://localhost:18089 | 数据库管理 |

> ⚠️ **注意**: 需要先配置 hosts 文件

### 配置 hosts

```bash
# macOS/Linux
sudo vim /etc/hosts

# 添加以下内容
127.0.0.1 admin.likeadmin.local pc.likeadmin.local mobile.likeadmin.local
```

---

## 📋 端口配置

| 服务 | 容器端口 | 主机端口 |
|------|---------|---------|
| Nginx | 80 | **18088** |
| MySQL | 3306 | **13306** |
| Redis | 6379 | **16397** |
| phpMyAdmin | 80 | **18089** |

---

## 🛠️ 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [服务名]

# 进入 PHP 容器
docker-compose exec php bash

# 启动 phpMyAdmin
docker-compose --profile tools up -d
```

---

## 📚 更多文档

- **[DOCKER_DEPLOY.md](DOCKER_DEPLOY.md)** - 完整部署指南
- **[DOCKER_COMMANDS.md](DOCKER_COMMANDS.md)** - 命令参考手册
- **[PORTS.md](PORTS.md)** - 端口配置说明

---

## ⚠️ 注意事项

1. **前端构建**: 首次启动需要先构建前端 `./scripts/build-all.sh`
2. **hosts 配置**: 必须配置 hosts 才能访问多端域名
3. **数据持久化**: 数据存储在 `data/` 目录，注意备份
4. **端口冲突**: 如遇端口冲突，修改 `.env` 文件

---

## 🐛 故障排查

### 端口被占用

```bash
# 查看端口占用
lsof -i :18088
lsof -i :13306

# 修改端口
vim .env
```

### 容器启动失败

```bash
# 查看日志
docker-compose logs [服务名]

# 重新构建
docker-compose build php
docker-compose up -d
```

### 前端无法访问

```bash
# 检查构建产物
ls admin/dist
ls pc/.output/public

# 重新构建
./scripts/build-all.sh
```
