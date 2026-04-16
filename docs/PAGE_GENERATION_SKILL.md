---
name: ai_page_generator
description: "通过灵活的Schema系统，让AI智能体快速生成Vue页面代码。"
metadata:
  {
    "builtin_skill_version": "1.0",
    "qwenpaw":
      {
        "emoji": "🤖",
        "requires": {}
      }
  }
---

# AI页面生成技能 - 灵活的Schema系统

> 一个通用的页面配置Schema系统，让AI智能体能够稳定生成Vue组件代码

---

## ⚡ 快速参考

**Docker环境（最常用）**
```bash
# 1. AI生成代码 → 保存 products.vue

# 2. 复制到容器
docker cp products.vue likeadmin-php:/var/www/likeadmin/pc/pages/

# 3. 更新导航菜单
docker cp pc/constants/menu.ts likeadmin-php:/var/www/likeadmin/pc/constants/menu.ts

# 4. 构建
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"

# 访问: http://your-domain/pc/products
```

**本地环境**
```bash
# 1. AI生成代码 → 保存 pc/pages/products.vue
# 2. 更新导航菜单 pc/constants/menu.ts
# 3. npm run build
# 访问: http://localhost:3000/products
```

**⚠️ 两个关键点**：
1. 必须在 `pc/constants/menu.ts` 中添加菜单配置
2. 修改文件后必须重新构建

---

## 🎯 技能概述

本技能定义了一套灵活的JSON Schema系统，支持AI智能体（ChatGPT、Claude、OpenClaw、文心一言等）根据用户需求自动生成Vue页面代码。

### 核心特性

- ✅ **三种模式**：预定义版块、自定义版块、原始模板
- ✅ **通用性**：可被任意AI智能体调用
- ✅ **稳定性**：Schema约束确保输出格式正确
- ✅ **灵活性**：支持从快速生成到完全自定义
- ✅ **纯前端**：生成代码后直接部署，无需后端

### 工作原理

```
用户需求 → AI智能体 → Vue代码 → pc/pages/xxx.vue → 构建 → 部署
```

---

## 🚀 快速开始（5步完成）

### 步骤1：向AI发送提示词

**提示词模板（推荐）**：
```
请根据以下需求生成完整的Vue组件代码：

需求：[描述页面，例如：产品展示页面，包含3个产品卡片]

要求：
1. 生成完整的 .vue 文件（template + script + style）
2. 内容通用、中性
3. 代码可直接使用
```

**支持的AI智能体**：ChatGPT、Claude、OpenClaw、文心一言、通义千问、Kimi等

### 步骤2：保存生成的代码

```bash
# 保存到 pc/pages/your-page.vue
# Docker环境
docker cp your-page.vue likeadmin-php:/var/www/likeadmin/pc/pages/

# 本地环境
# 直接保存到 pc/pages/your-page.vue
```

### 步骤3：更新导航菜单

**⚠️ 必须步骤，否则无法访问页面！**

编辑 `pc/constants/menu.ts`：
```typescript
export const NAVBAR = [
    { name: '首页', path: '/' },
    { name: '产品中心', path: '/products' },  // ← 添加新页面
    { name: '关于我们', path: '/about' }
]
```

```bash
# Docker环境
docker cp pc/constants/menu.ts likeadmin-php:/var/www/likeadmin/pc/constants/menu.ts

# 本地环境：直接编辑文件
```

### 步骤4：重新构建

```bash
# Docker环境
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"

# 本地环境
npm run build
```

**构建成功标志**：
```
✔ Client built in XXXms
文件已复制 ==> ../server/public/pc
```

### 步骤5：访问页面

| 环境 | 访问路径 |
|------|----------|
| Docker | http://your-domain/pc/your-page |
| 本地 | http://localhost:3000/your-page |

---

## 📐 三种模式详解

### 模式1：预定义版块（推荐新手）

**特点**：快速、稳定、开箱即用

**适用场景**：标准企业网站页面

**18种预定义版块**：

| 版块类型 | 说明 | 典型用途 |
|----------|------|----------|
| `page-header` | 页面标题区 | 页面顶部大标题 |
| `hero` | Hero大图 | 首屏展示 |
| `mission` | 使命宣言 | 企业使命介绍 |
| `text-block` | 文本块 | 段落文字 |
| `values` | 价值观卡片 | 优势展示 |
| `cards` | 通用卡片 | 任意卡片列表 |
| `products` | 产品展示 | 产品列表 |
| `services` | 服务列表 | 服务项目 |
| `cases` | 案例展示 | 成功案例 |
| `contact` | 联系方式 | 联系信息 |
| `cta` | 行动号召 | 按钮引导 |
| `stats` | 统计数据 | 数字展示 |
| `timeline` | 时间线 | 发展历程 |
| `team` | 团队介绍 | 团队成员 |
| `faq` | 常见问题 | Q&A列表 |
| `pricing` | 价格方案 | 套餐价格 |
| `testimonials` | 客户评价 | 用户评价 |

**配置示例**：
```json
{
  "type": "products",
  "enabled": true,
  "order": 2,
  "config": {
    "title": "产品中心",
    "items": [
      { "name": "产品A", "description": "描述", "price": "￥299" }
    ]
  }
}
```

---

### 模式2：自定义版块（推荐进阶）

**特点**：灵活组合、自由定制

**适用场景**：需要独特布局

**20+可用组件**：

heading, text, button, image, video, card, list, table, timeline,
form, tabs, accordion, container, grid, flex, divider, spacer,
badge, progress, alert

**6种布局**：
- `container` - 居中容器
- `grid-2/3/4` - 2/3/4列网格
- `list` - 列表
- `flex` - 弹性排列

**配置示例**：
```json
{
  "type": "custom-features",
  "config": {
    "layout": "grid-3",
    "content": [
      { "component": "heading", "props": { "text": "标题" } },
      { "component": "card", "props": { "title": "卡片1" } }
    ]
  }
}
```

---

### 模式3：原始模板（高级）

**特点**：完全自定义、最大灵活

**适用场景**：特殊交互效果、嵌入第三方组件

**配置示例**：
```json
{
  "type": "raw-special",
  "config": {
    "template": "<div class='custom'>...</div>",
    "style": ".custom { ... }"
  }
}
```

---

## 📋 配置规范

### 必须遵守的规则

1. **文件命名**：`fileName` 只能用小写字母、数字、横线
2. **版块顺序**：`order` 必须是从1开始的连续整数
3. **内容完整**：预定义版块的 `config` 必须包含所有必填字段
4. **数量限制**：
   - `sections` 最多15个
   - `items` 根据类型限制（通常3-10个）

### 完整配置结构

```json
{
  "pageInfo": {
    "fileName": "about",
    "title": "关于我们",
    "description": "了解我们的使命",
    "keywords": "关于,企业"
  },
  "sections": [
    {
      "type": "page-header",
      "enabled": true,
      "order": 1,
      "config": { "title": "关于我们" }
    }
  ]
}
```

---

## 💡 最佳实践

### 1. 模式选择

| 需求 | 推荐模式 |
|------|----------|
| 快速生成标准页面 | 预定义版块 |
| 需要自定义布局 | 自定义版块 |
| 特殊交互效果 | 原始模板 |

### 2. 内容建议

**推荐**：
- ✅ 通用词汇："我们"、"专业"、"创新"
- ✅ 占位内容，用户可自行替换

**避免**：
- ❌ 具体产品名、地名、人名
- ❌ 行业特定术语

### 3. 版块组合

**企业网站典型结构**：
```
page-header → mission → values → services → cases → cta
```

**产品展示典型结构**：
```
page-header → products → values → stats → cta
```

---

## ❓ 常见问题

### Q1: 生成页面后访问404？

**A:** 需要在导航菜单中添加配置

编辑 `pc/constants/menu.ts`，添加：
```typescript
{ name: '页面名', path: '/page-route' }
```

### Q2: 修改页面后没有变化？

**A:** 必须重新构建

```bash
# Docker
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"

# 本地
npm run build
```

### Q3: 构建失败提示依赖错误？

**A:** 安装依赖

```bash
# Docker
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm install"

# 本地
npm install
```

### Q4: 如何备份现有页面？

**A:** Docker自动备份

```bash
docker exec likeadmin-php cp \
  /var/www/likeadmin/pc/pages/about.vue \
  /var/www/likeadmin/pc/pages/about.vue.bak.$(date +%Y%m%d_%H%M%S)
```

### Q5: 菜单配置文件在哪里？

**A:** `pc/constants/menu.ts`

### Q6: 支持哪些AI智能体？

**A:** 任何支持JSON输出的AI

ChatGPT、Claude、OpenClaw、文心一言、通义千问、Kimi等

---

## 📂 附录

### 文件结构

```
likeadmin-code/
├── docs/                                    # 技能文档
│   ├── PAGE_GENERATION_SKILL.md            # 本文档
│   ├── schemas/page-config-flexible.schema.json
│   ├── generators/FlexiblePageGenerator.ts
│   └── libraries/component-library.ts
├── pc/
│   ├── pages/                              # ← Vue代码放这里
│   └── constants/menu.ts                   # ← 菜单配置
└── server/                                 # PHP后端
```

### 技术栈

- Vue 3 + Nuxt 3
- JSON Schema Draft 07
- TypeScript
- SCSS

### 相关资源

- Schema定义：`/docs/schemas/page-config-flexible.schema.json`
- 代码生成器：`/docs/generators/FlexiblePageGenerator.ts`
- 组件库：`/docs/libraries/component-library.ts`

---

**现在就可以使用本技能，让任意AI智能体为您生成Vue页面代码！** 🚀
