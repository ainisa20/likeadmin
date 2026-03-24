# ✅ Mobile API 路径问题已修复

## 🔧 修复内容

### 问题原因
第一次替换时将 `http://127.0.0.1:8088` 替换为 `/api`，导致：
- 原来：`http://127.0.0.1:8088/api/...`
- 错误：`/api/api/...`

### 修复方案
```bash
# 修复重复的 /api/api/ 为 /api/
docker exec likeadmin-app sed -i 's|/api/api/|/api/|g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js
```

## ✅ 验证结果

**1. API 路径正确**
```bash
# 不再有重复的 /api/api/
grep -c "/api/api/" /var/www/html/public/mobile/assets/index-c7cba0e3.js
# 返回：0 ✅
```

**2. API 正常工作**
```bash
curl http://localhost:8088/api/index/config
# 返回：{"code":1,"data":{...}} ✅
```

**3. 容器已重启**
```bash
docker-compose restart app
# 状态：Running ✅
```

## 🌐 现在请测试

**访问地址：**
```
http://localhost:8088/mobile/
```

**重要：强制刷新浏览器**
```
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

## ✅ 预期结果

**API 请求应该是：**
- ✅ `/api/index/config`
- ✅ `/api/user/center`
- ✅ `/api/index/decorate`
- ✅ `/api/index/index`

**不应该是：**
- ❌ `/api/api/index/config`
- ❌ `http://127.0.0.1:8088/api/...`

**浏览器控制台（F12）：**
- ✅ Network 标签页：API 请求返回 200 OK
- ✅ Console 标签页：没有红色错误
- ✅ 页面正常加载并显示内容

## 📋 完整修复总结

### 修复步骤

**第 1 步：修复 CORS 跨域问题**
```bash
# 替换硬编码的 127.0.0.1:8088 为相对路径 /api
docker exec likeadmin-app sed -i 's|http://127\.0\.0\.1:8088|/api|g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js
```

**第 2 步：修复重复的 API 路径**
```bash
# 修复 /api/api/ 为 /api/
docker exec likeadmin-app sed -i 's|/api/api/|/api/|g' \
  /var/www/html/public/mobile/assets/index-c7cba0e3.js
```

**第 3 步：更新源码配置**
```bash
# uniapp/.env.production
VITE_APP_BASE_URL='/api'
```

**第 4 步：重启容器**
```bash
docker-compose restart app
```

## 🎯 根本原因

**Mobile 前端配置问题：**
1. 构建时使用硬编码的 `http://127.0.0.1:8088/api` 作为基础 URL
2. 从 `localhost:8088` 访问时触发 CORS 跨域错误
3. 需要使用相对路径 `/api` 而不是绝对 URL

**正确的配置：**
```javascript
// ❌ 错误：硬编码 IP
VITE_APP_BASE_URL='http://127.0.0.1:8088/api'

// ✅ 正确：使用相对路径
VITE_APP_BASE_URL='/api'
```

## 🔍 验证方法

**浏览器开发者工具（F12）：**

**Network 标签页：**
1. 打开 http://localhost:8088/mobile/
2. 切换到 Network 标签页
3. 刷新页面
4. 查看请求列表
5. ✅ 应该看到：`/api/index/config` (状态 200)
6. ❌ 不应该看到：`/api/api/...` (状态 404)

**Console 标签页：**
1. 不应该有红色错误信息
2. 不应该有 CORS 错误
3. 应该有正常的日志输出

## 📝 下次构建时的注意事项

**重新构建 Mobile 前端时：**

1. **修改配置文件**
   ```bash
   cd uniapp
   # 确保 .env.production 使用相对路径
   echo "VITE_APP_BASE_URL='/api'" > .env.production
   ```

2. **构建 H5 版本**
   ```bash
   npm run build
   # 选择 2（H5）
   ```

3. **复制到部署目录**
   ```bash
   cp -r .output/public/* ../server/public/mobile/
   ```

4. **验证构建产物**
   ```bash
   # 检查是否还有硬编码的 IP
   grep -r "127.0.0.1" ../server/public/mobile/
   ```

这样就能避免以后再次出现同样的问题！
