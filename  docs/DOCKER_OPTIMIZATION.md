# Docker 镜像优化分析

## 📊 当前镜像大小分析

**当前大小：1.46GB**

**大小组成分析：**
1. 基础镜像（PHP 8.0.30-fpm）: ~600MB
2. 系统包（Nginx + 工具）: ~200MB
3. PHP 扩展: ~150MB
4. Composer 依赖: ~200MB
5. 前端构建产物: ~50MB
6. 其他: ~260MB

## 🎯 优化方案

### 方案 1: 多阶段构建（推荐）

**原理：** 构建阶段使用完整环境，运行时只保留必要文件

**预期效果：** 减少 300-500MB

### 方案 2: 使用 Alpine 基础镜像

**原理：** Alpine Linux 更小（~5MB 基础镜像）

**问题：**
- PHP 官方没有 Alpine 版本
- 需要自己编译 PHP，构建时间长
- 可能存在兼容性问题

**预期效果：** 减少 400-600MB

### 方案 3: 优化层和缓存清理

**原理：** 合并 RUN 指令，清理包管理器缓存

**预期效果：** 减少 50-100MB

### 方案 4: 排除不必要的前端资源

**原理：** 只保留部署需要的前端文件

**预期效果：** 减少 20-30MB

## 🔍 具体优化点

### 1. 基础镜像选择

**当前：** `php:8.0.30-fpm` (Debian-based, ~600MB)

**更小的选择：**
- ❌ 无官方 PHP Alpine 镜像
- ✅ 当前 Debian 镜像已经比较优化
- ✅ Composer 依赖已优化（--no-dev --optimize-autoloader）

### 2. 可删除的文件

**开发工具（构建后不需要）：**
- vim
- git
- curl
- wget
- zip/unzip（构建时需要，运行时不需要）

**调试文件：**
- PHP 错误日志（生产环境）
- Nginx access.log（可选择禁用）

### 3. 可优化的层合并

**当前 Dockerfile 中的 RUN 指令可以合并：**
```dockerfile
# 当前：多个 RUN 指令（多个层）
RUN apt-get update
RUN apt-get install -y nginx ...
RUN apt-get clean

# 优化：合并为一个 RUN（一个层）
RUN apt-get update && \
    apt-get install -y nginx ... && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 4. 构建阶段和运行阶段分离

**多阶段构建示例：**
```dockerfile
# 构建阶段
FROM php:8.0.30-fpm AS builder
WORKDIR /app
COPY server/ /app/
RUN composer install --no-dev --optimize-autoloader

# 运行阶段
FROM php:8.0.30-fpm
COPY --from=builder /app /var/www/html
COPY docker/ /docker/
```

## 💡 推荐的优化策略

### 短期（快速优化）
1. 清理 apt 缓存（已做）
2. 移除开发工具
3. 合并 RUN 指令
4. 禁用 access.log

**预期效果：-50MB 到 -100MB**

### 中期（需要测试）
1. 多阶段构建
2. 使用 .dockerignore 优化上下文
3. 检查是否有重复的前端资源

**预期效果：-300MB 到 -500MB**

### 长期（需要大量测试）
1. 寻找更小的基础镜像替代方案
2. 考虑分离 Nginx 和 PHP 为独立容器
3. 定制最小化 PHP 镜像

**预期效果：-400MB 到 -600MB**
