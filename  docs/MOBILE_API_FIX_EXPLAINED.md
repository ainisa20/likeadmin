# Mobile 前端 API 路径问题根本原因与解决方案

## 🔍 问题根源

### 配置文件分析

**uniapp/src/config/index.ts：**
```typescript
const envBaseUrl = import.meta.env.VITE_APP_BASE_URL || "";
let baseUrl = `${envBaseUrl}/`;

const config = {
    baseUrl,      // 请求接口域名
    urlPrefix: "api", // 请求默认前缀
    ...
};
```

### 错误的配置导致的问题

**之前的错误配置：**
```bash
# uniapp/.env.production
VITE_APP_BASE_URL='/api'
```

**导致的结果：**
```javascript
baseUrl = '/api/'      // 来自 VITE_APP_BASE_URL
urlPrefix = 'api'      // 配置文件中固定

最终路径 = '/api/' + '/api/' = '/api/api/' ❌
```

## ✅ 正确的解决方案

### 修改配置文件

**uniapp/.env.production：**
```bash
VITE_APP_BASE_URL=''
```

**或者：**
```bash
VITE_APP_BASE_URL='/'
```

**正确的逻辑：**
```javascript
// 当 VITE_APP_BASE_URL='' 时：
baseUrl = '' + '/' = '/'
urlPrefix = 'api'
最终路径 = '/' + '/api/' = '/api/' ✅
```

### 立即修复当前部署

```bash
# 修复已部署的文件（临时方案）
docker exec likeadmin-app sed -i 's|"baseURL":"/api/|"baseURL":"/"|g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js

# 或者更精确的替换
docker exec likeadmin-app sed -i 's|/api/api/|/api/|g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js
```

### 重新构建 Mobile 前端（永久方案）

```bash
cd /Users/vinson/Documents/www/likeadmin_php/uniapp

# 1. 确保 .env.production 正确
echo "VITE_APP_BASE_URL=''" > .env.production

# 2. 清理旧的构建产物
rm -rf dist .output

# 3. 重新构建
npm run build
# 选择 2（H5）

# 4. 复制到部署目录
cp -r .output/public/* ../server/public/mobile/
```

## 🎯 docker_old 配置分析

原始 docker_old 使用**分离式架构**：

```yaml
services:
  nginx:
    image: registry.cn-guangzhou.aliyuncs.com/likeadmin/nginx:1.23.1
    volumes:
      - ../server:/likeadmin_php/server
  
  php:
    image: registry.cn-guangzhou.aliyuncs.com/likeadmin/php:8.0.30.3-fpm
    volumes:
      - ../server:/likeadmin_php/server
```

**Nginx 配置（docker_old/config/nginx/conf.d/www.likeadmin.host.conf）：**
```nginx
location / {
    root /likeadmin_php/server/public;
    if (!-e $request_filename) {
        rewrite ^/(.*)$ /index.php?s=$1 last;
    }
}
```

这种架构更简单，Nginx 和 PHP 分别处理，没有复杂的路由问题。

## 📋 两种方案对比

### 方案 1：单容器架构（当前）
- ✅ 部署简单，一个容器包含所有服务
- ✅ 适合开发和小型项目
- ❌ Nginx 配置复杂
- ❌ 前端路由配置需要特别注意

### 方案 2：分离式架构（docker_old）
- ✅ 职责分离，Nginx 和 PHP 独立
- ✅ 配置更清晰
- ✅ 生产环境推荐
- ❌ 部署稍微复杂

## 🚀 推荐方案

对于当前情况，建议：

**短期（立即修复）：**
```bash
# 修复已部署的 mobile 前端
docker exec likeadmin-app sed -i 's|"baseURL":"/api/|"baseURL":"/"|g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js
docker-compose restart app
```

**长期（正确配置）：**
```bash
# 更新源码配置
echo "VITE_APP_BASE_URL=''" > uniapp/.env.production

# 重新构建 mobile 前端
cd uniapp && npm run build
# 选择 H5

# 复制到部署目录
cp -r .output/public/* ../server/public/mobile/
```

## ✅ 验证方法

修复后访问：
```
http://localhost:8088/mobile/
```

浏览器控制台（F12）Network 标签页应该显示：
```
✅ GET /api/index/config     200 OK
✅ GET /api/user/center      200 OK
```

而不是：
```
❌ GET /api/api/index/config  404
```
