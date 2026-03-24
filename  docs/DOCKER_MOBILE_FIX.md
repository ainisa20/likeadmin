# Mobile CORS 问题修复说明

## ✅ 问题已解决

### 问题原因

Mobile 前端 JavaScript 文件中硬编码了 `http://127.0.0.1:8088` 作为 API 地址，导致从 `http://localhost:8088/mobile/` 访问时出现跨域错误：

```
Origin: http://localhost:8088
Request: http://127.0.0.1:8088/api/...
```

### 修复方法

**1. 修改容器内的 JS 文件**
```bash
# 将 127.0.0.1:8088 替换为相对路径 /api
docker exec likeadmin-app sed -i 's|http://127\.0\.0\.1:8088|/api|g' /var/www/html/public/mobile/assets/index-c7cba0e3.js
```

**2. 重启容器**
```bash
docker-compose restart app
```

**3. 更新源码配置（防止下次构建时再次出现）**
```bash
# 修改 uniapp/.env.production
VITE_APP_BASE_URL='/api'
```

## 🧪 测试验证

**请访问并刷新浏览器：**
```
http://localhost:8088/mobile/
```

**强制刷新缓存：**
```
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

**检查浏览器控制台（F12）：**
- Console 标签页：不应该再有 CORS 错误
- Network 标签页：API 请求应该是 `/api/...` 而不是 `http://127.0.0.1:8088/api/...`

## 🔍 验证步骤

1. **打开开发者工具（F12）**
2. **刷新页面**
3. **查看 Network 标签**
   - ✅ 应该看到：`/api/index/config`
   - ❌ 不应该看到：`http://127.0.0.1:8088/api/index/config`
4. **查看 Console 标签**
   - ✅ 不应该有 CORS 错误
   - ✅ 页面应该正常加载

## 📋 如果问题仍然存在

**方案 1：清除浏览器缓存**
```bash
# 使用无痕模式测试
Chrome: Cmd/Ctrl + Shift + N
Firefox: Cmd/Ctrl + Shift + P
```

**方案 2：手动修改浏览器 URL**
```
如果自动跳转到 127.0.0.1，手动改回 localhost:8088
```

**方案 3：重新构建 Mobile 前端**
```bash
cd uniapp
# 修改 .env.production 为 VITE_APP_BASE_URL='/api'
npm run build
# 选择 2（H5）
# 复制构建产物到 server/public/mobile/
```

## ✅ 成功标志

**正常工作时应该看到：**
- ✅ Mobile 页面正常加载
- ✅ 没有 CORS 错误
- ✅ API 请求使用相对路径 `/api/...`
- ✅ 能够正常获取数据并显示
