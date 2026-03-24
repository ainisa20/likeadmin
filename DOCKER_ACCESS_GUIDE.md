# LikeAdmin Docker 部署 - 访问指南

## 🌐 正确的访问地址（注意端口号！）

### ⚠️ 常见错误

**❌ 错误地址：**
```
http://localhost/pc/
http://localhost/mobile/
http://localhost/admin/
```

**✅ 正确地址（端口 8088）：**
```
http://localhost:8088/pc/
http://localhost:8088/mobile/
http://localhost:8088/admin/
http://localhost:8088/
```

## 📊 服务端口映射

| 服务 | 容器端口 | 宿主机端口 | 访问地址 |
|------|---------|-----------|----------|
| **Web** | 80 | **8088** | http://localhost:8088 |
| **MySQL** | 3306 | **3308** | localhost:3308 |
| **Redis** | 6379 | **6382** | localhost:6382 |

## 🎯 各端访问地址

### 首页
```
http://localhost:8088/
```

### 管理后台
```
http://localhost:8088/admin/
```

### PC 端前台
```
http://localhost:8088/pc/
```
### 手机端前台
```
http://localhost:8088/mobile/
```

## 🔍 问题排查

### 如果页面一直显示 "加载中" 或旋转动画

**1. 检查 API 是否正常**
```bash
# 测试 PC 端 API
curl http://localhost:8088/api/pc/config

# 测试手机端 API
curl http://localhost:8088/api/pc/config

# 测试文章分类
curl http://localhost:8088/api/article/cate
```

**2. 检查浏览器控制台（F12）**
- 打开开发者工具
- 查看 Console 标签页是否有错误
- 查看 Network 标签页，确认 API 请求是否成功

**3. 清除浏览器缓存**
```
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

### 如果 404 Not Found

**检查文件是否存在**
```bash
# PC 端
docker exec likeadmin-app ls -la /var/www/html/public/pc/

# 手机端
docker exec likeadmin-app ls -la /var/www/html/public/mobile/

# 管理后台
docker exec likeadmin-app ls -la /var/www/html/public/admin/
```

### 如果无法连接

**1. 检查服务状态**
```bash
docker-compose ps
```

**2. 重启服务**
```bash
docker-compose restart
```

**3. 查看日志**
```bash
docker logs likeadmin-app --tail 50
```

## 💡 关于"跳转"问题

如果您看到页面在 `http://localhost/pc/` 和 `http://localhost:8088/pc/` 之间跳转：

**原因：**
- 端口号错误：应该使用 **8088** 而不是 80
- 浏览器可能缓存了旧地址

**解决方案：**
1. 直接访问：http://localhost:8088/pc/
2. 清除浏览器缓存
3. 使用无痕模式/隐私模式测试

## 🎉 成功标志

**访问成功时应该看到：**
- PC 端：显示网站内容（不是一直 loading）
- 手机端：显示 uniapp 应用界面
- 管理后台：显示登录页面

**API 正常工作的标志：**
```json
{
    "code": 1,
    "data": { ... }
}
```
