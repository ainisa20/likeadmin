# PC 端编译指南

## 📋 项目概述

**PC 端前台** 基于 Nuxt 3 (Vue 3) 构建的静态站点，位于 `pc/` 目录，编译后输出到 `server/public/pc/`。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Nuxt | 3.6.5 | Vue 3 元框架 |
| Vue | 3.3.4 | 前端框架 |
| Element Plus | 2.5.2 | UI 组件库 |
| TypeScript | 4.9.3 | 类型安全 |
| Tailwind CSS | - | 原子化 CSS |
| Pinia | 2.0.3 | 状态管理 |
| Vite | - | 构建工具 |

---

## 🚀 快速开始

### 首次安装

```bash
cd pc
npm install
```

### 开发模式

```bash
cd pc
npm run dev
# 访问: http://localhost:3000
```

### 生产构建

```bash
cd pc
NODE_ENV=production npm run build
```

---

## 🔧 编译命令详解

```json
{
  "dev": "nuxt dev",                    // 开发模式（热重载）
  "build": "nuxt generate && ...",      // 静态站点生成（默认）
  "build:ssr": "nuxt build && ...",     // SSR 服务端渲染
  "start": "nuxt start",                // 启动生产服务器
  "preview": "nuxt preview"             // 预览构建结果
}
```

### 构建流程

```
修改源代码 (pc/pages/*.vue)
    ↓
npm run build
    ↓
步骤 1: nuxt generate
  └─ 生成静态站点到 .output/public/
     └─ 每个文件带内容哈希 (如 entry.743b28eb.js)
     
步骤 2: node scripts/build.mjs
  └─ 复制 .output/public/* → ../server/public/pc/
     └─ 自动更新 index.html 中的引用链接
```

---

## 📁 目录结构

```
pc/                              # 源码目录
├── pages/                        # 页面路由
│   ├── index.vue                # 首页
│   ├── user/                    # 用户相关页面
│   └── information/             # 资讯相关页面
├── components/                   # 公共组件
├── api/                          # API 接口
├── assets/                       # 静态资源
│   └── styles/                  # 样式文件
├── nuxt.config.ts               # Nuxt 配置
├── .env.production              # 生产环境变量
└── scripts/
    └── build.mjs                # 构建后复制脚本

.output/public/                   # Nuxt 生成目录（临时）
└── _nuxt/                        # 编译后的资源文件
    ├── entry.743b28eb.js        # 入口 JS（带哈希）
    └── entry.4a83df6a.css       # 入口 CSS（带哈希）

server/public/pc/                 # 最终发布目录
├── index.html                   # 入口 HTML（自动生成）
├── _nuxt/                       # 静态资源
└── [其他静态页面]
```

---

## 🔑 核心概念

### Hash 文件名的作用

```
_nuxt/entry.743b28eb.js    ← 内容哈希
```

**为什么需要哈希？**

| 场景 | 说明 |
|------|------|
| 缓存控制 | 文件内容变化 → 哈希变化 → 浏览器下载新文件 |
| 增量部署 | 未变化的文件保持旧哈希，利用浏览器缓存 |
| 避免冲突 | 多次构建并行部署，文件不会互相覆盖 |

**引用不会失效：**

```html
<!-- index.html 由 Nuxt 自动生成，每次构建都会更新引用 -->
<script src="/pc/_nuxt/entry.743b28eb.js"></script>
```

### SSR vs 静态模式

| 模式 | 命令 | 输出 | 特点 | 适用场景 |
|------|------|------|------|----------|
| **静态** | `npm run build` | 纯 HTML/CSS/JS | 无需 Node.js，SEO 一般 | 纯静态托管 |
| **SSR** | `npm run build:ssr` | Node.js 服务 | SEO 友好，首屏快 | 需要 Node.js 环境 |

本项目默认使用**静态模式**。

---

## ⚙️ 环境配置

### 关键配置项

创建 `.env.production` 文件：

```bash
# API 接口地址
NUXT_API_URL=

# 基础路径（⚠️ 重要！必须与部署路径一致）
NUXT_BASE_URL=/pc/

# API 前缀
NUXT_API_PREFIX=/api

# 客户端类型
NUXT_CLIENT=4

# 版本号
NUXT_VERSION=1.9.0

# SSR 开关（留空=静态模式）
NUXT_SSR=
```

### baseURL 配置详解

**问题：如果 `NUXT_BASE_URL` 配置错误**

```javascript
// 错误配置：baseURL: "/"
<script src="/_nuxt/entry.743b28eb.js"></script>

// 访问: http://domain.com/pc/
// 浏览器请求: http://domain.com/_nuxt/xxx.js
// 实际文件在: http://domain.com/pc/_nuxt/xxx.js
// 结果: 404 错误！
```

**正确配置：baseURL: "/pc/"**

```javascript
<script src="/pc/_nuxt/entry.743b28eb.js"></script>

// 访问: http://domain.com/pc/
// 浏览器请求: http://domain.com/pc/_nuxt/xxx.js
// 结果: ✓ 正常加载
```

---

## 🐛 常见问题

### 1. 重新构建后前端报错

**错误信息：**
```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"
```

**原因：**
- `baseURL` 配置错误，导致资源路径不匹配
- 浏览器请求了不存在的路径，返回 404 HTML 页面

**解决方案：**
```bash
# 1. 检查环境配置
cat pc/.env.production | grep NUXT_BASE_URL

# 2. 确保 NUXT_BASE_URL=/pc/

# 3. 重新构建
cd pc
NODE_ENV=production npm run build

# 4. 验证生成的配置
cat server/public/pc/index.html | grep 'baseURL:'
# 应该输出：baseURL:"/pc/"
```

### 2. 修改源码后没有效果

**原因：** 浏览器缓存

**解决方案：**
```bash
# 强制刷新
# Chrome/Edge: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
# Firefox: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
```

### 3. 构建后 hash 没有变化

**原因：** 文件内容未变化，Vite 生成相同哈希（正常现象）

**验证方法：**
```bash
cd pc

# 修改源码
echo "// test" >> pages/index.vue

# 重新构建
npm run build

# 检查 hash 是否变化
ls .output/public/_nuxt/entry*.js
```

---

## 📝 开发工作流

### 日常开发（推荐）

```bash
# 1. 启动开发服务器
cd pc
npm run dev

# 2. 修改代码，自动热重载
# 3. 浏览器实时查看效果
```

### 生产部署

```bash
# 1. 修改源码
cd pc
vim pages/index.vue

# 2. 设置环境变量
export NODE_ENV=production

# 3. 构建
npm run build

# 4. 验证
grep 'baseURL:' ../server/public/pc/index.html

# 5. 清除浏览器缓存，重新访问
```

### 完整清理重建

```bash
cd pc

# 清理所有缓存和构建产物
rm -rf .output node_modules/.cache

# 重新构建
NODE_ENV=production npm run build

# 验证
ls -lh ../server/public/pc/_nuxt/entry*.js
```

---

## 🔍 验证清单

构建完成后，检查以下项目：

```bash
# 1. 文件是否生成
ls server/public/pc/index.html
ls server/public/pc/_nuxt/entry*.js

# 2. baseURL 是否正确
grep 'baseURL:' server/public/pc/index.html
# 期望: baseURL:"/pc/"

# 3. 资源引用是否匹配
HTML_HASH=$(grep -o 'entry\.[a-z0-9]*\.js' server/public/pc/index.html)
FILE_HASH=$(ls server/public/pc/_nuxt/entry*.js | xargs basename)
[ "$HTML_HASH" = "$FILE_HASH" ] && echo "✓ 引用匹配" || echo "✗ 引用不匹配"

# 4. 访问测试
curl -I http://127.0.0.1:8088/pc/_nuxt/entry.*.js 2>&1 | grep "Content-Type"
# 期望: Content-Type: application/javascript
```

---

## 📚 参考文档

- [Nuxt 3 官方文档](https://nuxt.com)
- [Vue 3 官方文档](https://vuejs.org)
- [Element Plus 文档](https://element-plus.org)
- [Vite 官方文档](https://vitejs.dev)

---

## 📄 许可证

MIT License
