# Mobile 前端配置完全修复方案

## 问题根源

通过分析源代码发现，Mobile 前端（uniapp）的 API 配置逻辑：

```typescript
// uniapp/src/config/index.ts
const envBaseUrl = import.meta.env.VITE_APP_BASE_URL || "";
let baseUrl = `${envBaseUrl}/`;

const config = {
    baseUrl,      // 请求接口域名
    urlPrefix: "api", // 请求默认前缀
    ...
};
```

**错误配置导致：**
- `VITE_APP_BASE_URL='/api'`
- `baseUrl = '/api/'`
- `urlPrefix = 'api'`
- **最终路径 = '/api/api/' ❌**

## ✅ 正确配置

```bash
# uniapp/.env.production
VITE_APP_BASE_URL=''
```

**结果：**
- `baseUrl = '/'`
- `urlPrefix = 'api'`
- **最终路径 = '/api/' ✅**

## 🔧 当前容器修复

我需要找到 JS 文件中 baseURL 的确切位置并修复：

```bash
# 查找配置对象
docker exec likeadmin-app grep -o '{base:[^}]*}' /var/www/html/public/mobile/assets/index-c7cba0e3.js

# 修复 baseURL
docker exec likeadmin-app sed -i 's/{base:"\/api\/"/{base:"\/"/g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js
```

## 📋 关于 docker_old 配置

原始 docker_old 使用**分离式架构**，配置更简单：

```nginx
location / {
    root /likeadmin_php/server/public;
    if (!-e $request_filename) {
        rewrite ^/(.*)$ /index.php?s=$1 last;
    }
}
```

这种架构下前端和后端是分离的，不会有路径拼接问题。

## 🚀 完整修复步骤

**1. 查找并修复 baseURL**
```bash
# 查找配置对象
docker exec likeadmin-app grep -oE 'base:"[^"]+"|baseURL:"[^"]+"|baseUrl:"[^"]+"' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js

# 修复所有可能的格式
docker exec likeadmin-app sed -i \
  -e 's/base:"\/api\/"/base:"\/"/g' \
  -e 's/baseURL:"\/api\/"/baseURL:"\/"/g' \
  -e 's/baseUrl:"\/api\/"/baseUrl:"\/"/g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js
```

**2. 重启容器**
```bash
docker-compose restart app
```

**3. 清除浏览器缓存并测试**
```
访问：http://localhost:8088/mobile/
强制刷新：Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
或使用无痕模式
```

## ✅ 验证

**浏览器控制台（F12）Network 标签页应该显示：**
```
✅ GET /api/index/config     200 OK
✅ GET /api/user/center      200 OK
✅ GET /api/index/decorate    200 OK
```

**不应该看到：**
```
❌ GET /api/api/index/config  404
```
