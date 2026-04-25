# PC 端页面构建器（Page Builder）设计方案

> 版本: 1.0  
> 日期: 2026-04-25  
> 状态: 待评审  
> 作者: Sisyphus

---

## 目录

1. [背景与目标](#1-背景与目标)
2. [现状分析](#2-现状分析)
3. [核心设计理念](#3-核心设计理念)
4. [JSON Schema 设计](#4-json-schema-设计)
5. [组件目录（Component Catalog）](#5-组件目录component-catalog)
6. [Agent Skill 设计](#6-agent-skill-设计)
7. [前端动态渲染方案](#7-前端动态渲染方案)
8. [后台编辑器改造](#8-后台编辑器改造)
9. [后端 API 适配](#9-后端-api-适配)
10. [数据迁移方案](#10-数据迁移方案)
11. [实施路线图](#11-实施路线图)
12. [附录](#12-附录)

---

## 1. 背景与目标

### 1.1 背景

当前 PC 端首页（`pc/pages/index.vue`）的页面结构是硬编码的。除轮播图数据从 `la_decorate_page` 的 JSON 读取外，表单区域、优势展示、CTA 等模块全部写死在 Vue 模板中。

管理后台的装修模块（`admin/src/views/decoration/`）虽然有一个基于 widget 的编辑器，但：
- 组件种类少（banner / nav / search / news 等基础组件）
- 编辑体验传统（iframe 覆盖层 + 间接属性面板）
- PC 前端并未消费这套 widget JSON 做动态渲染

### 1.2 目标

设计一套 **Agent-First** 的页面构建系统：

```
用户自然语言
  → Agent Skill（理解意图 + 查阅组件目录）
    → 生成 / 修改 JSON
      → API 写入 la_decorate_page.data
        → PC 前端动态渲染
          → 后台可视化微调
```

**核心设计约束**：JSON Schema 必须让 AI 模型能**稳定、可靠、可增量地**生成和修改。

### 1.3 设计原则

| 原则 | 说明 |
|------|------|
| 扁平 section 列表 | 一维有序数组，避免深层嵌套。模型生成一维数组的准确率远高于嵌套结构 |
| 严格类型枚举 | 组件类型是有限集合（不是自由字符串），模型选择更准确 |
| 语义化 ID | `hero-main` 而非 `uuid-xxxx`，模型能理解和引用 |
| Props 扁平化 | 避免 `props.nested.deep.value`，降低模型出错率 |
| 样式用 CSS 标准 | `padding`、`backgroundColor` 等标准属性名，模型对 CSS 熟悉 |
| 版本化 | `_meta.version` 字段支持后续 schema 升级和数据迁移 |
| 向后兼容 | 新旧 JSON 格式可共存，前端渲染层做兼容 |

---

## 2. 现状分析

### 2.1 数据库

**表**: `la_decorate_page`

```sql
CREATE TABLE `la_decorate_page` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` tinyint(2) UNSIGNED NOT NULL DEFAULT 10 COMMENT '页面类型 1=商城首页,2=个人中心,3=客服设置,4=PC首页',
  `name` varchar(100) NOT NULL DEFAULT '' COMMENT '页面名称',
  `data` text NULL COMMENT '页面数据',
  `meta` text NULL COMMENT '页面设置',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `update_time` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
);
```

PC 首页对应 `id=4`。

- `data` 字段：当前存储旧 widget 格式的 JSON 数组
- `meta` 字段：当前存储 `dify_config` 和 `theme_config`

**不需要修改表结构**。新 schema 复用 `data` 和 `meta` 字段。

### 2.2 当前 data 字段格式（旧）

```json
[
  {
    "title": "首页轮播图",
    "name": "pc-banner",
    "content": {
      "enabled": 1,
      "data": [
        { "image": "/path/to/img.png", "name": "", "link": {} }
      ]
    },
    "styles": {}
  },
  {
    "title": "搜索",
    "name": "search",
    "disabled": 1,
    "content": {},
    "styles": {}
  },
  {
    "title": "导航菜单",
    "name": "nav",
    "content": { "enabled": 1, "data": [...] },
    "styles": {}
  },
  {
    "title": "资讯",
    "name": "news",
    "disabled": 1,
    "content": {},
    "styles": {}
  }
]
```

### 2.3 当前 PC 前端消费方式

`pc/pages/index.vue` 只消费了 `pc-banner` 的轮播图数据：

```typescript
const getSwiperData = computed(() => {
  const data = JSON.parse(pageData.value.page.data)
  return data.find((item) => item.name === 'pc-banner')?.content || {}
})
```

其余内容（表单、亮点展示等）全部硬编码在 Vue 模板中。

### 2.4 当前后台编辑器

编辑器由三部分组成：

| 组件 | 文件 | 作用 |
|------|------|------|
| 左侧菜单 | `component/pages/menu.vue` | 页面列表导航 |
| 中间预览 | `component/pages/preview-pc.vue` | iframe 嵌入 + 组件覆盖层 |
| 右侧属性 | `component/pages/attr-setting.vue` | 动态加载 widget 的 attr.vue |

Widget 结构：每个 widget 目录包含 `index.ts` + `options.ts` + `content.vue` + 可选 `attr.vue`。

---

## 3. 核心设计理念

### 3.1 Agent-First 设计

传统页面构建器以「可视化拖拽」为核心交互。本方案以「Agent 生成 + 可视化微调」为核心：

```
传统:   用户拖拽 → 生成 JSON → 渲染
本方案: 用户说需求 → Agent 生成 JSON → 渲染 → 后台微调
```

这意味着：
- JSON Schema 的首要读者是 **AI 模型**，不是人类
- Schema 必须无歧义、可枚举、可验证
- 组件 props 的每个字段都有明确类型和默认值
- 模型不需要理解 CSS 布局细节，通过 `styles` 字段可选暴露

### 3.2 分层架构

```
┌─────────────────────────────────────────────────┐
│ Layer 4: 后台编辑器（可视化微调）               │
│   读取 sections JSON → 表单编辑 → 写回 JSON     │
├─────────────────────────────────────────────────┤
│ Layer 3: API 层                                 │
│   CRUD 操作 la_decorate_page.data / meta        │
├─────────────────────────────────────────────────┤
│ Layer 2: JSON Schema（核心）                     │
│   _meta + settings + sections[]                 │
│   严格定义组件类型和 props 规范                  │
├─────────────────────────────────────────────────┤
│ Layer 1: Agent Skill                            │
│   自然语言 → 解析意图 → 选择组件 → 生成 JSON    │
└─────────────────────────────────────────────────┘
```

### 3.3 数据流

```
┌──────────┐    自然语言     ┌──────────────┐
│   用户    │ ──────────────→ │  Agent Skill  │
└──────────┘                 └──────┬───────┘
                                    │ 生成/修改 JSON
                                    ▼
┌──────────┐    GET/POST    ┌──────────────┐
│ PC 前端   │ ←────────────→ │  后端 API     │
│ (Nuxt)   │                │ (ThinkPHP)    │
└──────────┘                └──────┬───────┘
  动态渲染 sections                   │ 读写
                                    ▼
                             ┌──────────────┐
                             │ la_decorate   │
                             │ _page.data    │
                             └──────────────┘
                                    ▲
                                    │ 表单编辑
                             ┌──────────────┐
                             │  后台编辑器    │
                             │  (Vue Admin)  │
                             └──────────────┘
```

---

## 4. JSON Schema 设计

### 4.1 顶层结构

```json
{
  "_meta": {
    "version": "1.0",
    "pageId": 4,
    "pageType": "pc-home",
    "generatedBy": "agent",
    "updatedAt": "2026-04-25T10:00:00Z"
  },
  "settings": {
    "maxWidth": "1200px",
    "gap": "0px",
    "backgroundColor": "#f5f7fa"
  },
  "sections": []
}
```

#### _meta 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | string | 是 | Schema 版本号，当前 `"1.0"` |
| `pageId` | number | 是 | 对应 `la_decorate_page.id`，PC 首页 = 4 |
| `pageType` | string | 是 | 页面类型标识，PC 首页 = `"pc-home"` |
| `generatedBy` | string | 否 | 生成方式：`"agent"` 或 `"manual"` |
| `updatedAt` | string | 否 | ISO 8601 时间戳，Agent 每次修改时更新 |

> **_meta 由系统自动填充，Agent 不需要生成。** 后端 API 在 save 时自动注入。

#### settings 字段说明

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxWidth` | string | `"1200px"` | 内容区域最大宽度 |
| `gap` | string | `"0px"` | section 之间的全局间距 |
| `backgroundColor` | string | `"#f5f7fa"` | 页面全局背景色 |

### 4.2 Section 通用结构

每个 section 遵循统一的外层结构：

```json
{
  "id": "hero-main",
  "type": "hero-banner",
  "title": "首页主横幅",
  "visible": true,
  "props": { ... },
  "styles": { ... }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 语义化唯一标识。格式：`{type简称}-{用途}`。例：`hero-main`、`features-core`、`stats-company` |
| `type` | string | 是 | 组件类型，必须是组件目录中定义的类型之一（见第 5 章） |
| `title` | string | 是 | 管理员可读标题，用于后台编辑器显示。例：`"首页主横幅"` |
| `visible` | boolean | 是 | 是否显示，默认 `true`。后台编辑器可切换 |
| `props` | object | 是 | 组件特有属性。不同 type 有不同的 props schema |
| `styles` | object | 否 | 通用 CSS 样式覆盖。使用标准 CSS 属性名（camelCase） |

#### ID 命名规则

Agent 生成 ID 时遵循以下规则：

| 规则 | 说明 | 示例 |
|------|------|------|
| 格式 | `{类型简写}-{用途}` | `hero-main` |
| 唯一性 | 同一页面内不重复 | 不同时出现两个 `hero-main` |
| 可读性 | 人和模型都能理解含义 | `features-core` 而非 `section-1` |
| 稳定性 | 修改内容时不改变 ID | 修改标题后 ID 不变 |

常见 ID 前缀约定：

| type | ID 前缀 |
|------|---------|
| `hero-banner` | `hero-` |
| `feature-grid` | `features-` |
| `rich-text` | `content-` |
| `image-carousel` | `carousel-` |
| `stats-bar` | `stats-` |
| `testimonials` | `reviews-` |
| `faq-accordion` | `faq-` |
| `cta-section` | `cta-` |
| `card-list` | `cards-` |
| `contact-form` | `form-` |
| `divider` | `divider-` |
| `custom-html` | `custom-` |

#### styles 字段说明

`styles` 使用标准 CSS 属性名（JavaScript camelCase 格式）。Agent 只需使用以下常见属性：

| 属性 | 类型 | 示例 | 说明 |
|------|------|------|------|
| `padding` | string | `"60px 0"` | 内边距 |
| `paddingTop` | string | `"80px"` | 上内边距 |
| `paddingBottom` | string | `"80px"` | 下内边距 |
| `backgroundColor` | string | `"#ffffff"` | 背景色 |
| `backgroundImage` | string | `"url('/bg.jpg')"` | 背景图 |
| `color` | string | `"#333333"` | 文字颜色 |
| `textAlign` | string | `"center"` | 文字对齐 |

> **不建议 Agent 使用**: `margin`、`position`、`z-index`、`transform` 等布局相关属性。这些由前端渲染组件内部控制。

---

## 5. 组件目录（Component Catalog）

组件目录是 Agent Skill 的核心参考，定义了所有可用组件类型及其 props schema。

### 5.1 组件总览

| # | type | 名称 | 用途 | 复杂度 |
|---|------|------|------|--------|
| 1 | `hero-banner` | 大图横幅 | 首屏主视觉区域 | 简单 |
| 2 | `feature-grid` | 特性展示 | 图标+文字网格 | 简单 |
| 3 | `rich-text` | 图文混排 | 标题+正文+配图 | 中等 |
| 4 | `image-carousel` | 图片轮播 | 多图轮播展示 | 简单 |
| 5 | `stats-bar` | 数据统计条 | 数字+标签横向排列 | 简单 |
| 6 | `testimonials` | 客户评价 | 头像+评语卡片 | 中等 |
| 7 | `faq-accordion` | FAQ 折叠 | 问答对展开/折叠 | 简单 |
| 8 | `cta-section` | 行动号召 | 大标题+按钮引导 | 简单 |
| 9 | `card-list` | 卡片列表 | 文章/案例/产品卡片 | 复杂 |
| 10 | `contact-form` | 联系表单 | 可配置字段的表单 | 复杂 |
| 11 | `divider` | 分隔线 | 区域间距 | 简单 |
| 12 | `custom-html` | 自定义 HTML | 兜底方案 | 高级 |

### 5.2 详细 Props Schema

#### 5.2.1 hero-banner（大图横幅）

首页首屏主视觉区域，包含主标题、副标题和可选 CTA 按钮。

```json
{
  "type": "hero-banner",
  "props": {
    "heading":         "string, 必填, 主标题",
    "subheading":      "string, 可选, 副标题",
    "backgroundImage": "string, 可选, 背景图 URL, 留空则用 backgroundColor",
    "backgroundColor": "string, 可选, 背景色, 默认 '#1a1a2e'",
    "textColor":       "string, 可选, 文字颜色, 默认 '#ffffff'",
    "textAlign":       "enum: 'left' | 'center', 默认 'center'",
    "height":          "string, 可选, CSS height, 默认 '420px'",
    "ctaText":         "string, 可选, 按钮文字, 为空则不显示按钮",
    "ctaLink":         "string, 可选, 按钮跳转链接",
    "ctaStyle":        "enum: 'primary' | 'outline' | 'link', 默认 'primary'"
  }
}
```

**Agent 生成示例**：

```json
{
  "id": "hero-main",
  "type": "hero-banner",
  "title": "主横幅",
  "visible": true,
  "props": {
    "heading": "专业解决方案，助力企业增长",
    "subheading": "一站式服务，从咨询到落地全程陪伴",
    "backgroundColor": "#1a1a2e",
    "textAlign": "center",
    "height": "420px",
    "ctaText": "免费咨询",
    "ctaLink": "#form-contact",
    "ctaStyle": "primary"
  },
  "styles": {}
}
```

---

#### 5.2.2 feature-grid（特性展示）

图标 + 标题 + 描述的网格布局，常用于展示核心优势、服务特色。

```json
{
  "type": "feature-grid",
  "props": {
    "heading":     "string, 可选, 区域标题, 如 '为什么选择我们'",
    "subheading":  "string, 可选, 区域副标题",
    "columns":     "number, enum: 2 | 3 | 4, 默认 3",
    "items": [
      {
        "icon":         "string, 必填, emoji 或图标名, 如 '🎯'",
        "title":        "string, 必填",
        "description":  "string, 必填"
      }
    ]
  }
}
```

**约束**：
- `items` 数组最少 2 项，最多 8 项
- `columns` 建议与 items 数量协调（3项配3列，4项配2或4列）
- `icon` 推荐使用 emoji，渲染端直接展示

**Agent 生成示例**：

```json
{
  "id": "features-core",
  "type": "feature-grid",
  "title": "核心优势",
  "visible": true,
  "props": {
    "heading": "为什么选择我们",
    "columns": 3,
    "items": [
      { "icon": "🎯", "title": "专业团队", "description": "多年行业经验，深度理解业务需求" },
      { "icon": "🤝", "title": "优质服务", "description": "以客户为中心，全程贴心服务保障" },
      { "icon": "💼", "title": "成功案例", "description": "服务众多客户，积累了丰富的实战经验" }
    ]
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#ffffff" }
}
```

---

#### 5.2.3 rich-text（图文混排）

支持多种布局的图文内容区域，可含标题、正文、配图和 CTA。

```json
{
  "type": "rich-text",
  "props": {
    "layout":     "enum: 'text-only' | 'left-image' | 'right-image' | 'full-width', 默认 'text-only'",
    "heading":    "string, 可选",
    "content":    "string, 必填, 正文内容, 支持基础 HTML（p, strong, em, ul, ol, li, a）",
    "image":      "string, 可选, 配图 URL",
    "imageAlt":   "string, 可选, 图片描述",
    "ctaText":    "string, 可选, 底部按钮文字",
    "ctaLink":    "string, 可选, 底部按钮链接"
  }
}
```

**约束**：
- `content` 中只允许基础 HTML 标签：`<p>`, `<strong>`, `<em>`, `<ul>`, `<ol>`, `<li>`, `<a>`, `<br>`
- 不允许 `<script>`, `<iframe>`, `<style>` 等标签（前端渲染时做 sanitize）
- `layout` 为 `left-image` 或 `right-image` 时，`image` 字段必须提供

**Agent 生成示例**：

```json
{
  "id": "content-about",
  "type": "rich-text",
  "title": "关于我们",
  "visible": true,
  "props": {
    "layout": "right-image",
    "heading": "关于我们",
    "content": "<p>我们是一家专注于<strong>企业数字化转型</strong>的服务公司。</p><p>自成立以来，已为超过500家企业提供专业解决方案。</p>",
    "image": "",
    "imageAlt": "团队合照"
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#ffffff" }
}
```

---

#### 5.2.4 image-carousel（图片轮播）

多图轮播展示，支持自动播放和手动切换。

```json
{
  "type": "image-carousel",
  "props": {
    "height":    "string, 可选, 轮播高度, 默认 '340px'",
    "autoplay":  "boolean, 可选, 自动播放, 默认 true",
    "interval":  "number, 可选, 切换间隔毫秒, 默认 4000",
    "items": [
      {
        "image":  "string, 必填, 图片 URL",
        "title":  "string, 可选, 图片标题",
        "link":   "string, 可选, 点击跳转 URL"
      }
    ]
  }
}
```

**约束**：
- `items` 数组最少 1 项，最多 8 项
- 建议图片尺寸统一

**Agent 生成示例**：

```json
{
  "id": "carousel-showcase",
  "type": "image-carousel",
  "title": "案例展示轮播",
  "visible": true,
  "props": {
    "height": "340px",
    "autoplay": true,
    "interval": 4000,
    "items": [
      { "image": "", "title": "案例一" },
      { "image": "", "title": "案例二" },
      { "image": "", "title": "案例三" }
    ]
  },
  "styles": { "padding": "40px 0", "backgroundColor": "#ffffff" }
}
```

---

#### 5.2.5 stats-bar（数据统计条）

数字 + 标签的横向排列，常用于展示公司数据。

```json
{
  "type": "stats-bar",
  "props": {
    "items": [
      {
        "value":  "string, 必填, 数字文本, 如 '500+' 或 '98%'",
        "label":  "string, 必填, 描述文字",
        "icon":   "string, 可选, emoji"
      }
    ]
  }
}
```

**约束**：
- `items` 数组最少 2 项，最多 6 项
- `value` 推荐格式：数字 + 单位/符号（`500+`、`98%`、`10年`）

**Agent 生成示例**：

```json
{
  "id": "stats-company",
  "type": "stats-bar",
  "title": "公司数据",
  "visible": true,
  "props": {
    "items": [
      { "value": "500+", "label": "服务客户", "icon": "🏢" },
      { "value": "98%", "label": "客户满意度", "icon": "⭐" },
      { "value": "10年+", "label": "行业经验", "icon": "📅" },
      { "value": "50+", "label": "专业团队", "icon": "👥" }
    ]
  },
  "styles": { "padding": "40px 0", "backgroundColor": "#ffffff" }
}
```

---

#### 5.2.6 testimonials（客户评价）

客户评价卡片展示，支持头像、评分和评语。

```json
{
  "type": "testimonials",
  "props": {
    "heading":    "string, 可选, 区域标题",
    "columns":    "number, enum: 2 | 3, 默认 3",
    "items": [
      {
        "avatar":   "string, 可选, 头像 URL, 留空显示默认头像",
        "name":     "string, 必填",
        "role":     "string, 可选, 职位/公司",
        "content":  "string, 必填, 评价内容",
        "rating":   "number, 可选, 1-5 星"
      }
    ]
  }
}
```

**约束**：
- `items` 数组最少 2 项，最多 9 项
- `rating` 范围 1-5，不提供则不显示星标

**Agent 生成示例**：

```json
{
  "id": "reviews-clients",
  "type": "testimonials",
  "title": "客户评价",
  "visible": true,
  "props": {
    "heading": "客户怎么说",
    "columns": 3,
    "items": [
      { "name": "张总", "role": "某科技公司 CEO", "content": "服务专业，效率极高，推荐合作。", "rating": 5 },
      { "name": "李经理", "role": "某制造企业 运营总监", "content": "解决方案很贴合实际需求，落地效果超出预期。", "rating": 5 },
      { "name": "王女士", "role": "某教育机构 创始人", "content": "团队很负责任，从方案设计到实施全程跟进。", "rating": 4 }
    ]
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#f5f7fa" }
}
```

---

#### 5.2.7 faq-accordion（FAQ 折叠面板）

常见问题的展开/折叠列表。

```json
{
  "type": "faq-accordion",
  "props": {
    "heading":  "string, 可选, 区域标题",
    "items": [
      {
        "question":  "string, 必填",
        "answer":    "string, 必填, 支持基础 HTML"
      }
    ]
  }
}
```

**约束**：
- `items` 数组最少 2 项，最多 15 项
- `answer` 中允许的 HTML 标签同 `rich-text.content`

**Agent 生成示例**：

```json
{
  "id": "faq-common",
  "type": "faq-accordion",
  "title": "常见问题",
  "visible": true,
  "props": {
    "heading": "常见问题",
    "items": [
      { "question": "服务周期一般是多久？", "answer": "根据项目复杂度，通常为 2-8 周。" },
      { "question": "是否提供售后支持？", "answer": "是的，项目交付后提供 6 个月免费技术支持。" },
      { "question": "如何开始合作？", "answer": "您可以通过页面底部的联系表单提交需求，我们会在 24 小时内联系您。" }
    ]
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#ffffff" }
}
```

---

#### 5.2.8 cta-section（行动号召区块）

大标题 + 副标题 + 按钮，引导用户执行操作。

```json
{
  "type": "cta-section",
  "props": {
    "heading":          "string, 必填",
    "subheading":       "string, 可选",
    "ctaText":          "string, 必填, 按钮文字",
    "ctaLink":          "string, 可选, 按钮链接",
    "backgroundImage":  "string, 可选, 背景图 URL",
    "backgroundColor":  "string, 可选, 默认 '#4153ff'",
    "textColor":        "string, 可选, 默认 '#ffffff'",
    "style":            "enum: 'centered' | 'split', 默认 'centered'"
  }
}
```

**Agent 生成示例**：

```json
{
  "id": "cta-footer",
  "type": "cta-section",
  "title": "底部行动号召",
  "visible": true,
  "props": {
    "heading": "准备好开始了吗？",
    "subheading": "立即联系我们，获取免费咨询和专属方案",
    "ctaText": "立即咨询",
    "ctaLink": "#form-contact",
    "backgroundColor": "#4153ff"
  },
  "styles": {}
}
```

---

#### 5.2.9 card-list（卡片列表）

通用的卡片网格，支持手动指定内容或自动拉取文章。

```json
{
  "type": "card-list",
  "props": {
    "heading":    "string, 可选, 区域标题",
    "source":     "enum: 'manual' | 'article-latest' | 'article-hot', 默认 'manual'",
    "columns":    "number, enum: 2 | 3 | 4, 默认 3",
    "limit":      "number, 可选, 自动拉取数量, 默认 6, 仅 source 非manual时生效",
    "showImage":  "boolean, 可选, 是否显示图片, 默认 true",
    "showTag":    "boolean, 可选, 是否显示标签, 默认 true",
    "items": [
      {
        "image":        "string, 可选, 卡片封面图 URL",
        "title":        "string, 必填",
        "description":  "string, 可选, 摘要",
        "tag":          "string, 可选, 标签文字",
        "link":         "string, 可选, 点击跳转 URL"
      }
    ]
  }
}
```

**约束**：
- `source` 为 `manual` 时，内容由 `items` 数组提供
- `source` 为 `article-latest` 或 `article-hot` 时，前端从 API 拉取文章数据，`items` 字段忽略
- `items` 数组最少 1 项，最多 12 项

**Agent 生成示例（自动文章源）**：

```json
{
  "id": "cards-latest",
  "type": "card-list",
  "title": "最新资讯",
  "visible": true,
  "props": {
    "heading": "最新资讯",
    "source": "article-latest",
    "columns": 3,
    "limit": 6
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#f5f7fa" }
}
```

**Agent 生成示例（手动内容）**：

```json
{
  "id": "cards-cases",
  "type": "card-list",
  "title": "成功案例",
  "visible": true,
  "props": {
    "heading": "成功案例",
    "source": "manual",
    "columns": 3,
    "items": [
      { "image": "", "title": "某科技公司数字化转型", "description": "通过全面数字化改造，效率提升 200%", "tag": "数字化" },
      { "image": "", "title": "某零售品牌线上平台", "description": "3个月内搭建完成线上销售渠道", "tag": "电商" },
      { "image": "", "title": "某教育机构管理系统", "description": "定制化管理系统，覆盖招生到教学全流程", "tag": "教育" }
    ]
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#ffffff" }
}
```

---

#### 5.2.10 contact-form（联系表单）

可配置字段的联系表单。

```json
{
  "type": "contact-form",
  "props": {
    "heading":         "string, 必填",
    "subheading":      "string, 可选",
    "fields": [
      {
        "name":        "string, 必填, 字段标识, 英文小写+下划线",
        "label":       "string, 必填, 显示标签",
        "type":        "enum: 'text' | 'email' | 'phone' | 'select' | 'textarea', 默认 'text'",
        "required":    "boolean, 可选, 默认 false",
        "placeholder": "string, 可选",
        "options":     "string[], 仅 type='select' 时使用"
      }
    ],
    "submitText":       "string, 可选, 默认 '提交'",
    "successMessage":   "string, 可选, 默认 '提交成功'"
  }
}
```

**约束**：
- `fields` 数组最少 1 项，最多 10 项
- `fields[].name` 在同一表单内唯一
- `type` 为 `select` 时，`options` 必须提供且不为空
- 表单提交由前端统一处理，调用现有 `/api/assessment/submit` 接口

**Agent 生成示例**：

```json
{
  "id": "form-contact",
  "type": "contact-form",
  "title": "联系表单",
  "visible": true,
  "props": {
    "heading": "联系我们，获取专属方案",
    "subheading": "填写您的需求，我们将在24小时内与您联系",
    "fields": [
      { "name": "name", "label": "姓名", "type": "text", "required": true, "placeholder": "请输入您的姓名" },
      { "name": "phone", "label": "手机号", "type": "phone", "required": true, "placeholder": "请输入您的手机号" },
      { "name": "type", "label": "咨询类型", "type": "select", "required": true, "options": ["需求了解", "方案沟通", "商务洽谈", "项目对接"] },
      { "name": "content", "label": "留言内容", "type": "textarea", "required": false, "placeholder": "请描述您的具体需求" }
    ],
    "submitText": "提交咨询",
    "successMessage": "提交成功！我们将于24小时内联系您"
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#f5f7fa" }
}
```

---

#### 5.2.11 divider（分隔线）

用于区域之间的视觉分隔或间距调整。

```json
{
  "type": "divider",
  "props": {
    "style":    "enum: 'line' | 'space' | 'gradient', 默认 'space'",
    "height":   "string, 可选, 默认 '40px'",
    "color":    "string, 可选, 仅 style='line' 时生效, 默认 '#e0e0e0'"
  }
}
```

**Agent 生成示例**：

```json
{
  "id": "divider-1",
  "type": "divider",
  "title": "间距",
  "visible": true,
  "props": {
    "style": "space",
    "height": "60px"
  },
  "styles": {}
}
```

---

#### 5.2.12 custom-html（自定义 HTML）

兜底方案，当上述组件无法满足需求时使用。

```json
{
  "type": "custom-html",
  "props": {
    "html": "string, 必填, HTML 内容"
  }
}
```

**约束**：
- 前端渲染时做 HTML sanitize（移除 `<script>`, `<iframe>`, `<style>` 等危险标签）
- 仅作为兜底方案，Agent 应优先使用其他组件类型

---

### 5.3 完整页面示例

以下是一个 Agent 生成的完整 PC 首页 JSON：

```json
{
  "_meta": {
    "version": "1.0",
    "pageId": 4,
    "pageType": "pc-home",
    "generatedBy": "agent",
    "updatedAt": "2026-04-25T10:00:00Z"
  },
  "settings": {
    "maxWidth": "1200px",
    "gap": "0px",
    "backgroundColor": "#f5f7fa"
  },
  "sections": [
    {
      "id": "hero-main",
      "type": "hero-banner",
      "title": "主横幅",
      "visible": true,
      "props": {
        "heading": "专业解决方案，助力企业增长",
        "subheading": "一站式服务，从咨询到落地全程陪伴",
        "backgroundColor": "#1a1a2e",
        "textAlign": "center",
        "height": "420px",
        "ctaText": "免费咨询",
        "ctaLink": "#form-contact",
        "ctaStyle": "primary"
      },
      "styles": {}
    },
    {
      "id": "stats-company",
      "type": "stats-bar",
      "title": "公司数据",
      "visible": true,
      "props": {
        "items": [
          { "value": "500+", "label": "服务客户", "icon": "🏢" },
          { "value": "98%", "label": "客户满意度", "icon": "⭐" },
          { "value": "10年+", "label": "行业经验", "icon": "📅" },
          { "value": "50+", "label": "专业团队", "icon": "👥" }
        ]
      },
      "styles": { "padding": "40px 0", "backgroundColor": "#ffffff" }
    },
    {
      "id": "features-core",
      "type": "feature-grid",
      "title": "核心优势",
      "visible": true,
      "props": {
        "heading": "为什么选择我们",
        "columns": 3,
        "items": [
          { "icon": "🎯", "title": "专业团队", "description": "多年行业经验，深度理解业务需求" },
          { "icon": "🤝", "title": "优质服务", "description": "以客户为中心，全程贴心服务保障" },
          { "icon": "💼", "title": "成功案例", "description": "服务众多客户，积累了丰富的实战经验" }
        ]
      },
      "styles": { "padding": "80px 0", "backgroundColor": "#ffffff" }
    },
    {
      "id": "content-about",
      "type": "rich-text",
      "title": "关于我们",
      "visible": true,
      "props": {
        "layout": "right-image",
        "heading": "关于我们",
        "content": "<p>我们是一家专注于<strong>企业数字化转型</strong>的服务公司。</p><p>自成立以来，已为超过 500 家企业提供专业解决方案，涵盖技术架构、产品设计和运营优化。</p>",
        "image": "",
        "imageAlt": "公司环境"
      },
      "styles": { "padding": "80px 0", "backgroundColor": "#f5f7fa" }
    },
    {
      "id": "cards-latest",
      "type": "card-list",
      "title": "最新资讯",
      "visible": true,
      "props": {
        "heading": "最新资讯",
        "source": "article-latest",
        "columns": 3,
        "limit": 6
      },
      "styles": { "padding": "80px 0", "backgroundColor": "#ffffff" }
    },
    {
      "id": "reviews-clients",
      "type": "testimonials",
      "title": "客户评价",
      "visible": true,
      "props": {
        "heading": "客户怎么说",
        "columns": 3,
        "items": [
          { "name": "张总", "role": "某科技公司 CEO", "content": "服务专业，效率极高，强烈推荐。", "rating": 5 },
          { "name": "李经理", "role": "某制造企业 运营总监", "content": "解决方案很贴合实际需求，落地效果超出预期。", "rating": 5 },
          { "name": "王女士", "role": "某教育机构 创始人", "content": "团队很负责任，从方案设计到实施全程跟进。", "rating": 4 }
        ]
      },
      "styles": { "padding": "80px 0", "backgroundColor": "#f5f7fa" }
    },
    {
      "id": "faq-common",
      "type": "faq-accordion",
      "title": "常见问题",
      "visible": true,
      "props": {
        "heading": "常见问题",
        "items": [
          { "question": "服务周期一般是多久？", "answer": "根据项目复杂度，通常为 2-8 周。" },
          { "question": "是否提供售后支持？", "answer": "是的，项目交付后提供 6 个月免费技术支持。" },
          { "question": "如何开始合作？", "answer": "通过页面底部的联系表单提交需求，我们会在 24 小时内联系您。" }
        ]
      },
      "styles": { "padding": "80px 0", "backgroundColor": "#ffffff" }
    },
    {
      "id": "form-contact",
      "type": "contact-form",
      "title": "联系表单",
      "visible": true,
      "props": {
        "heading": "联系我们，获取专属方案",
        "subheading": "填写您的需求，我们将在24小时内与您联系",
        "fields": [
          { "name": "name", "label": "姓名", "type": "text", "required": true, "placeholder": "请输入您的姓名" },
          { "name": "phone", "label": "手机号", "type": "phone", "required": true, "placeholder": "请输入您的手机号" },
          { "name": "type", "label": "咨询类型", "type": "select", "required": true, "options": ["需求了解", "方案沟通", "商务洽谈", "项目对接"] },
          { "name": "content", "label": "留言内容", "type": "textarea", "required": false, "placeholder": "请描述您的具体需求" }
        ],
        "submitText": "提交咨询",
        "successMessage": "提交成功！我们将于24小时内联系您"
      },
      "styles": { "padding": "80px 0", "backgroundColor": "#f5f7fa" }
    },
    {
      "id": "cta-footer",
      "type": "cta-section",
      "title": "底部行动号召",
      "visible": true,
      "props": {
        "heading": "准备好开始了吗？",
        "subheading": "立即联系我们，获取免费咨询和专属方案",
        "ctaText": "立即咨询",
        "ctaLink": "#form-contact",
        "backgroundColor": "#4153ff"
      },
      "styles": {}
    }
  ]
}
```

---

## 6. Agent Skill 设计

### 6.1 Skill 定位

Skill 是一份精心设计的 prompt，注入到 Agent 中，使其具备：
1. 理解用户的自然语言页面需求
2. 将需求转化为符合 Schema 的 JSON
3. 支持增量修改（基于现有 JSON 做局部变更）

### 6.2 Skill 内容结构

```
Skill 内容
├── 1. 角色定义
├── 2. 任务说明
├── 3. 组件目录（完整 props schema）
├── 4. JSON Schema 规范
├── 5. 操作类型与规则
│   ├── 5.1 创建新页面
│   ├── 5.2 添加 section
│   ├── 5.3 修改 section
│   ├── 5.4 删除 section
│   ├── 5.5 调整顺序
│   └── 5.6 替换内容
├── 6. 输出格式
├── 7. 质量规则
└── 8. Few-shot 示例
```

### 6.3 Skill Prompt（完整版）

```markdown
# PC Page Builder Skill

## 角色

你是一个 PC 端页面构建助手。用户通过自然语言描述页面需求，你通过生成或修改 JSON 数据来构建页面内容。

你的输出将被存储到数据库，并由 PC 端前端动态渲染为实际页面。

## 任务

根据用户的自然语言描述，生成或修改符合以下 Schema 的 JSON 数据。

## JSON Schema 规范

### 顶层结构

{
  "_meta": { "version": "1.0", ... },    // 系统自动填充，你不需要生成
  "settings": { "maxWidth", "gap", "backgroundColor" },  // 全局设置，通常不需要修改
  "sections": [...]                       // 核心：有序 section 列表
}

### Section 结构

{
  "id": "语义化ID",        // 格式: {类型简写}-{用途}，如 hero-main
  "type": "组件类型",      // 必须是以下 12 种之一
  "title": "管理员标题",    // 中文，用于后台识别
  "visible": true,
  "props": { ... },       // 组件特有属性
  "styles": { ... }       // 可选 CSS 样式
}

### 可用组件类型（12 种）

[此处插入第 5 章的完整组件目录]

### styles 常用属性

- padding: "60px 0"
- backgroundColor: "#ffffff" 或 "#f5f7fa"
- 交替使用白色和灰色背景，营造视觉节奏

## 操作规则

### 创建新页面

1. 根据用户描述选择合适的组件组合
2. 典型企业首页结构：hero → stats → features → content → cards → testimonials → faq → form → cta
3. 相邻 section 背景色交替（白色/灰色），形成视觉节奏
4. 每个 section 必须有唯一语义化 ID
5. 图片 URL 一律留空字符串 ""，后续由用户在后台替换
6. 文案要自然、专业、具体，避免空洞的占位文字

### 添加 section

1. 确定插入位置（在哪个 section 之前/之后）
2. 生成新的 section 对象
3. 新 ID 不能与已有 ID 冲突
4. 注意与相邻 section 的背景色协调

### 修改 section

1. 通过 ID 或 type 定位目标 section
2. 只修改用户提到的字段，其他字段保持不变
3. 如果用户说"改标题"，只改 props.heading，不改其他
4. 输出完整的修改后 section，不要只输出差异

### 删除 section

1. 通过 ID 或 title 或 type 定位
2. 移除整个 section 对象
3. 注意删除后相邻 section 的背景色是否需要调整

### 调整顺序

1. 用户说"把 X 移到 Y 下面/上面"
2. 调整 sections 数组的顺序
3. 检查移动后背景色节奏是否被破坏

### 替换内容

1. 用户说"把轮播图换成数据统计"
2. 删除旧 section，插入新 section
3. 或修改现有 section 的 type 和 props

## 输出规则

1. 只输出 JSON，不输出其他说明文字
2. JSON 必须是合法的，可直接 JSON.parse()
3. 不确定的可选字段不要生成（省略即可）
4. 中文文案要自然、专业、具体
5. emoji 图标要选择视觉清晰的
6. 样式只使用 padding 和 backgroundColor
7. 图片 URL 留空 ""

## 质量规则

1. 首页 sections 建议在 6-12 个之间
2. 不要连续 3 个以上相同背景色的 section
3. 每种组件类型在同一页面中建议不超过 2 个
4. feature-grid 的 items 建议 3-6 个
5. stats-bar 的 items 建议 3-5 个
6. 文案长度：标题 8-20 字，描述 10-50 字
7. 联系表单字段建议 3-6 个

## 示例

### 示例 1: 用户说"做一个企业官网首页"

输出完整 sections JSON（参考第 5.3 节的完整示例）

### 示例 2: 用户说"在优势展示下面加一个客户评价"

在 id 为 "features-core" 的 section 之后插入：

{
  "id": "reviews-clients",
  "type": "testimonials",
  "title": "客户评价",
  "visible": true,
  "props": {
    "heading": "客户怎么说",
    "columns": 3,
    "items": [
      { "name": "客户A", "role": "某公司", "content": "评价内容...", "rating": 5 }
    ]
  },
  "styles": { "padding": "80px 0", "backgroundColor": "#f5f7fa" }
}

### 示例 3: 用户说"把主横幅标题改成数字化转型专家"

定位 type="hero-banner" 的 section，修改 props.heading：

"props": {
  "heading": "数字化转型专家",
  ... // 其余字段不变
}
```

### 6.4 Agent 执行流程

```
输入: 用户自然语言 + 当前页面 JSON（通过 API 获取）

步骤:
1. 读取当前 la_decorate_page.data (GET /decorate.page/detail?id=4)
2. 解析 JSON，理解现有 sections 结构
3. 根据用户意图 + Skill 中的组件目录，确定操作类型
4. 生成/修改 JSON
5. 调用 API 写回 (POST /decorate.page/save)
6. 返回操作结果说明
```

### 6.5 Skill 与 Agent 的交互方式

Skill 作为 Agent 的系统 prompt 的一部分。Agent 在运行时：

```
Agent Session
├── System Prompt
│   ├── 通用指令
│   └── [注入 Skill 内容] ← PC Page Builder Skill
├── Tools
│   ├── GET  /decorate.page/detail  ← 读取当前 JSON
│   └── POST /decorate.page/save    ← 写入修改后的 JSON
└── Conversation
    ├── User: "帮我做一个企业官网首页"
    ├── Agent: [读取现有数据 → 生成完整 JSON → 调用 API 保存]
    ├── User: "在优势下面加一个客户评价"
    └── Agent: [读取当前数据 → 插入新 section → 调用 API 保存]
```

---

## 7. 前端动态渲染方案

### 7.1 渲染架构

```
pc/pages/index.vue
  └── 读取 la_decorate_page.data
      └── 解析 sections JSON
          └── 遍历 sections 数组
              └── SectionRenderer.vue（通用渲染器）
                  └── 根据 section.type 映射具体组件
                      ├── RenderHeroBanner.vue
                      ├── RenderFeatureGrid.vue
                      ├── RenderRichText.vue
                      ├── RenderCarousel.vue
                      ├── RenderStatsBar.vue
                      ├── RenderTestimonials.vue
                      ├── RenderFaq.vue
                      ├── RenderCta.vue
                      ├── RenderCardList.vue
                      ├── RenderContactForm.vue
                      ├── RenderDivider.vue
                      └── RenderCustomHtml.vue
```

### 7.2 文件结构

```
pc/
├── pages/
│   └── index.vue                    # 首页（改造为动态渲染）
├── components/
│   └── render/
│       ├── SectionRenderer.vue      # 通用 section 渲染器
│       ├── RenderHeroBanner.vue
│       ├── RenderFeatureGrid.vue
│       ├── RenderRichText.vue
│       ├── RenderCarousel.vue
│       ├── RenderStatsBar.vue
│       ├── RenderTestimonials.vue
│       ├── RenderFaq.vue
│       ├── RenderCta.vue
│       ├── RenderCardList.vue
│       ├── RenderContactForm.vue
│       ├── RenderDivider.vue
│       └── RenderCustomHtml.vue
└── composables/
    └── usePageSections.ts           # 页面 sections 数据获取与解析
```

### 7.3 核心 composable

```typescript
// pc/composables/usePageSections.ts
interface Section {
  id: string
  type: string
  title: string
  visible: boolean
  props: Record<string, any>
  styles?: Record<string, string>
}

interface PageSettings {
  maxWidth: string
  gap: string
  backgroundColor: string
}

interface PageData {
  _meta: { version: string; pageId: number; pageType: string }
  settings: PageSettings
  sections: Section[]
}

export function usePageSections() {
  const appStore = useAppStore()

  // 获取页面原始数据
  const { data: rawData } = await useAsyncData(() => getIndex())

  // 解析 sections
  const pageData = computed<PageData>(() => {
    try {
      const raw = JSON.parse(rawData.value?.page?.data || '{}')

      // 新 schema 格式（有 sections 字段）
      if (raw.sections && Array.isArray(raw.sections)) {
        return {
          _meta: raw._meta || { version: '1.0', pageId: 4, pageType: 'pc-home' },
          settings: raw.settings || { maxWidth: '1200px', gap: '0px', backgroundColor: '#f5f7fa' },
          sections: raw.sections
        }
      }

      // 旧 schema 格式（兼容）
      return migrateLegacyFormat(raw)
    } catch {
      return {
        _meta: { version: '1.0', pageId: 4, pageType: 'pc-home' },
        settings: { maxWidth: '1200px', gap: '0px', backgroundColor: '#f5f7fa' },
        sections: []
      }
    }
  })

  // 过滤可见 sections
  const visibleSections = computed(() =>
    pageData.value.sections.filter(s => s.visible !== false)
  )

  return { pageData, visibleSections, settings: computed(() => pageData.value.settings) }
}
```

### 7.4 SectionRenderer 组件

```vue
<!-- pc/components/render/SectionRenderer.vue -->
<template>
  <component
    :is="componentMap[section.type]"
    v-if="componentMap[section.type]"
    v-bind="section.props"
    :section-id="section.id"
  />
  <!-- 未识别的 type：静默忽略，不报错 -->
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const props = defineProps<{
  section: {
    id: string
    type: string
    props: Record<string, any>
  }
}>()

// 异步加载组件，按需加载
const componentMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'hero-banner':    defineAsyncComponent(() => import('./RenderHeroBanner.vue')),
  'feature-grid':   defineAsyncComponent(() => import('./RenderFeatureGrid.vue')),
  'rich-text':      defineAsyncComponent(() => import('./RenderRichText.vue')),
  'image-carousel': defineAsyncComponent(() => import('./RenderCarousel.vue')),
  'stats-bar':      defineAsyncComponent(() => import('./RenderStatsBar.vue')),
  'testimonials':   defineAsyncComponent(() => import('./RenderTestimonials.vue')),
  'faq-accordion':  defineAsyncComponent(() => import('./RenderFaq.vue')),
  'cta-section':    defineAsyncComponent(() => import('./RenderCta.vue')),
  'card-list':      defineAsyncComponent(() => import('./RenderCardList.vue')),
  'contact-form':   defineAsyncComponent(() => import('./RenderContactForm.vue')),
  'divider':        defineAsyncComponent(() => import('./RenderDivider.vue')),
  'custom-html':    defineAsyncComponent(() => import('./RenderCustomHtml.vue')),
}
</script>
```

### 7.5 首页改造

```vue
<!-- pc/pages/index.vue（改造后） -->
<template>
  <div class="homepage" :style="{ backgroundColor: settings.backgroundColor }">
    <section
      v-for="section in visibleSections"
      :key="section.id"
      :id="section.id"
      :style="{ ...section.styles }"
    >
      <div class="section-inner" :style="{ maxWidth: settings.maxWidth, margin: '0 auto' }">
        <SectionRenderer :section="section" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { visibleSections, settings } = await usePageSections()
</script>
```

### 7.6 单个渲染组件规范

每个 `Render*.vue` 组件遵循以下规范：

```
1. props 直接声明为组件属性（使用 defineProps<T>()）
2. props 类型与组件目录中定义的 props schema 对应
3. 不处理 styles（由 SectionRenderer 外层 section 处理）
4. 图片 URL 通过 appStore.getImageUrl() 转换
5. 富文本内容通过 v-html 渲染（需 sanitize）
6. 响应式布局：使用 CSS Grid / Flexbox
```

### 7.7 渲染组件示例

#### RenderFeatureGrid

```vue
<template>
  <div class="feature-grid">
    <h2 v-if="heading" class="section-title">{{ heading }}</h2>
    <p v-if="subheading" class="section-subtitle">{{ subheading }}</p>
    <div class="grid" :style="gridStyle">
      <div v-for="item in items" :key="item.title" class="card">
        <div class="icon">{{ item.icon }}</div>
        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-desc">{{ item.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FeatureItem {
  icon: string
  title: string
  description: string
}

const props = withDefaults(defineProps<{
  heading?: string
  subheading?: string
  columns?: 2 | 3 | 4
  items: FeatureItem[]
}>(), {
  columns: 3
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`
}))
</script>
```

#### RenderContactForm

```vue
<template>
  <div class="contact-form-wrapper">
    <div class="form-container">
      <h2 class="form-title">{{ heading }}</h2>
      <p v-if="subheading" class="form-subtitle">{{ subheading }}</p>

      <ElForm ref="formRef" :model="formData" :rules="formRules" label-position="top">
        <div v-for="field in fields" :key="field.name" class="form-field">
          <ElFormItem :label="field.label" :prop="field.name">
            <ElSelect v-if="field.type === 'select'" v-model="formData[field.name]"
              :placeholder="field.placeholder">
              <ElOption v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
            </ElSelect>
            <ElInput v-else-if="field.type === 'textarea'" v-model="formData[field.name]"
              type="textarea" :rows="4" :placeholder="field.placeholder" />
            <ElInput v-else v-model="formData[field.name]"
              :placeholder="field.placeholder" :maxlength="field.type === 'phone' ? 11 : undefined" />
          </ElFormItem>
        </div>
        <ElButton type="primary" @click="handleSubmit" :loading="submitting">
          {{ submitText }}
        </ElButton>
      </ElForm>
    </div>
  </div>
</template>
```

---

## 8. 后台编辑器改造

### 8.1 设计目标

后台编辑器需要支持：
1. 读取 Agent 生成的 sections JSON
2. 可视化编辑每个 section 的 props（文字、图片、开关等）
3. 调整 section 顺序（拖拽）
4. 显示/隐藏 section
5. 添加新 section（从组件目录选择）
6. 删除 section

### 8.2 编辑器架构

```
admin/src/views/decoration/
├── pc.vue                          # 主页面（保留现有主题/Dify配置）
├── pc_details.vue                  # 改造：页面编辑器入口
├── component/
│   ├── pages/
│   │   ├── SectionList.vue         # 新增：左侧 section 列表
│   │   ├── SectionEditor.vue       # 新增：右侧 props 编辑器
│   │   ├── SectionPreview.vue      # 改造 preview-pc.vue
│   │   └── ComponentCatalog.vue    # 新增：添加组件选择面板
│   └── editors/                    # 新增：按 type 分的 props 编辑器
│       ├── HeroBannerEditor.vue
│       ├── FeatureGridEditor.vue
│       ├── RichTextEditor.vue
│       ├── CarouselEditor.vue
│       ├── StatsBarEditor.vue
│       ├── TestimonialsEditor.vue
│       ├── FaqEditor.vue
│       ├── CtaEditor.vue
│       ├── CardListEditor.vue
│       ├── ContactFormEditor.vue
│       ├── DividerEditor.vue
│       └── CustomHtmlEditor.vue
```

### 8.3 编辑器工作流

```
┌──────────┬───────────────────────────────┬──────────────┐
│ Section  │         预览区域              │   属性编辑   │
│  列表    │                               │              │
│          │  ┌─────────────────────────┐  │              │
│ [拖拽]   │  │  hero-main (预览)       │  │ [当前选中]   │
│ ▼ 主横幅 │  │  专业解决方案...         │  │ 主横幅       │
│   数据   │  └─────────────────────────┘  │              │
│   优势   │  ┌─┐┌─┐┌─┐┌─┐              │ 标题         │
│   资讯   │  │5││9││1││5│              │ [________]   │
│   评价   │  │0││8││0││0│              │              │
│   FAQ    │  └─┘└─┘└─┘└─┘              │ 副标题       │
│   表单   │                               │ [________]   │
│   CTA    │  [iframe 实时预览 PC 前端]    │              │
│          │                               │ 背景色       │
│ [+添加]  │                               │ [🎨]         │
│          │                               │              │
│ [保存]   │                               │ [保存修改]   │
└──────────┴───────────────────────────────┴──────────────┘
```

### 8.4 SectionEditor 动态加载

```vue
<!-- admin/src/views/decoration/component/pages/SectionEditor.vue -->
<template>
  <div class="section-editor" v-if="section">
    <div class="editor-title">{{ section.title }}</div>

    <!-- 通用字段 -->
    <el-form-item label="显示标题">
      <el-input v-model="section.title" />
    </el-form-item>
    <el-form-item label="是否显示">
      <el-switch v-model="section.visible" />
    </el-form-item>

    <el-divider />

    <!-- 组件特有字段：动态加载编辑器 -->
    <component
      :is="editorMap[section.type]"
      :props-data="section.props"
      @update="handlePropsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
const editorMap = {
  'hero-banner':    defineAsyncComponent(() => import('../editors/HeroBannerEditor.vue')),
  'feature-grid':   defineAsyncComponent(() => import('../editors/FeatureGridEditor.vue')),
  'rich-text':      defineAsyncComponent(() => import('../editors/RichTextEditor.vue')),
  'image-carousel': defineAsyncComponent(() => import('../editors/CarouselEditor.vue')),
  'stats-bar':      defineAsyncComponent(() => import('../editors/StatsBarEditor.vue')),
  'testimonials':   defineAsyncComponent(() => import('../editors/TestimonialsEditor.vue')),
  'faq-accordion':  defineAsyncComponent(() => import('../editors/FaqEditor.vue')),
  'cta-section':    defineAsyncComponent(() => import('../editors/CtaEditor.vue')),
  'card-list':      defineAsyncComponent(() => import('../editors/CardListEditor.vue')),
  'contact-form':   defineAsyncComponent(() => import('../editors/ContactFormEditor.vue')),
  'divider':        defineAsyncComponent(() => import('../editors/DividerEditor.vue')),
  'custom-html':    defineAsyncComponent(() => import('../editors/CustomHtmlEditor.vue')),
}
</script>
```

### 8.5 编辑器组件示例

#### FeatureGridEditor

```vue
<template>
  <el-form label-width="80px">
    <el-form-item label="区域标题">
      <el-input v-model="localProps.heading" />
    </el-form-item>
    <el-form-item label="列数">
      <el-radio-group v-model="localProps.columns">
        <el-radio :value="2">2列</el-radio>
        <el-radio :value="3">3列</el-radio>
        <el-radio :value="4">4列</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-divider>特性列表</el-divider>

    <div v-for="(item, index) in localProps.items" :key="index" class="item-card">
      <el-form-item :label="`特性 ${index + 1}`">
        <div class="item-fields">
          <el-input v-model="item.icon" placeholder="emoji 图标" style="width: 80px" />
          <el-input v-model="item.title" placeholder="标题" />
          <el-input v-model="item.description" placeholder="描述" />
          <el-button v-if="localProps.items.length > 2" type="danger" circle
            :icon="Delete" @click="removeItem(index)" />
        </div>
      </el-form-item>
    </div>

    <el-button v-if="localProps.items.length < 8" @click="addItem">
      添加特性
    </el-button>
  </el-form>
</template>
```

---

## 9. 后端 API 适配

### 9.1 现有 API 变更

**不需要新增 API**。复用现有接口：

| 接口 | 现有功能 | 适配方式 |
|------|---------|---------|
| `GET /decorate.page/detail?id=4` | 获取页面数据 | 直接返回，data 字段内容由前端解析 |
| `POST /decorate.page/save` | 保存页面数据 | 直接保存，不做 schema 校验（保持灵活） |
| `GET /decorate.data/pc` | 获取 PC 配置 | 新增返回 `settings` 信息 |

### 9.2 后端逻辑层修改

#### DecorateDataLogic::pc()

```php
public static function pc(): array
{
    $pcPage = DecoratePage::findOrEmpty(4)->toArray();
    $updateTime = !empty($pcPage['update_time']) ? $pcPage['update_time'] : date('Y-m-d H:i:s');

    // 解析 data 字段
    $data = json_decode($pcPage['data'], true);
    $isNewSchema = isset($data['sections']) && is_array($data['sections']);

    return [
        'update_time' => $updateTime,
        'pc_url' => request()->domain() . '/pc/',
        'dify_config' => self::getDifyConfig($pcPage),
        'theme_config' => self::getThemeConfig($pcPage),
        'schema_version' => $isNewSchema ? ($data['_meta']['version'] ?? '1.0') : 'legacy',
        'section_count' => $isNewSchema ? count($data['sections']) : 0,
    ];
}
```

#### PcLogic::getIndexData()

```php
public static function getIndexData()
{
    $decoratePage = DecoratePage::findOrEmpty(4);

    // 直接返回原始 data，让前端做兼容解析
    $pageData = $decoratePage->toArray();

    $newArticle = self::getLimitArticle('new', 7);
    $allArticle = self::getLimitArticle('all', 5);
    $hotArticle = self::getLimitArticle('hot', 8);

    return [
        'page' => $pageData,
        'all' => $allArticle,
        'new' => $newArticle,
        'hot' => $hotArticle
    ];
}
```

### 9.3 验证器调整

`DecoratePageValidate` 保持简单：

```php
protected $rule = [
    'id'   => 'require',
    'type' => 'require',
    'data' => 'require',
];
```

data 字段的 JSON 内容不做后端 schema 校验。原因：
1. Schema 由 Agent Skill 约束，不需要后端重复校验
2. 保持灵活性，前端渲染层做容错处理（未识别的 type 静默忽略）

---

## 10. 数据迁移方案

### 10.1 兼容策略

采用**渐进式迁移**，不做一次性数据迁移：

```
阶段 1: 前端兼容旧格式 → 新旧并存
阶段 2: Agent 逐步将旧数据转为新格式
阶段 3: 旧格式标记为 deprecated
```

### 10.2 前端兼容层

```typescript
// pc/composables/usePageSections.ts

function migrateLegacyFormat(rawData: any[]): PageData {
  // 旧格式是 widget 数组
  if (!Array.isArray(rawData)) {
    return defaultPageData()
  }

  const sections: Section[] = []

  for (const widget of rawData) {
    switch (widget.name) {
      case 'pc-banner':
        if (widget.content?.enabled) {
          sections.push({
            id: 'carousel-legacy',
            type: 'image-carousel',
            title: '轮播图',
            visible: true,
            props: {
              height: '340px',
              autoplay: true,
              interval: 4000,
              items: (widget.content.data || []).map((item: any) => ({
                image: item.image || '',
                title: item.name || '',
                link: item.link?.path || ''
              }))
            },
            styles: {}
          })
        }
        break
      case 'news':
        sections.push({
          id: 'cards-news-legacy',
          type: 'card-list',
          title: '资讯',
          visible: true,
          props: {
            heading: '最新资讯',
            source: 'article-latest',
            columns: 3,
            limit: 6
          },
          styles: { padding: '40px 0', backgroundColor: '#f5f7fa' }
        })
        break
      // 其他旧 widget 映射...
    }
  }

  return {
    _meta: { version: '1.0', pageId: 4, pageType: 'pc-home' },
    settings: { maxWidth: '1200px', gap: '0px', backgroundColor: '#f5f7fa' },
    sections
  }
}
```

### 10.3 迁移触发

当 Agent 首次修改旧格式页面时，自动完成迁移：

```
1. Agent 读取当前 data（旧格式 widget 数组）
2. Agent 调用迁移函数，将旧格式转为新 schema
3. 在新 schema 基础上执行用户请求的修改
4. 保存为新格式
```

---

## 11. 实施路线图

### 11.1 阶段划分

#### P0 - Schema + Skill（1-2 天）

| 任务 | 产出 |
|------|------|
| 确认组件目录 | 12 个组件的 props schema 定义 |
| 编写 Agent Skill prompt | 完整的 Skill markdown 文件 |
| 定义 TypeScript 类型 | `pc/types/page-builder.ts` |

**验收标准**：Skill prompt 可以指导模型生成合法 JSON，经过 5+ 种不同用户意图测试，JSON 结构均符合 Schema。

#### P1 - 前端渲染（3-4 天）

| 任务 | 产出 |
|------|------|
| usePageSections composable | 数据获取 + 旧格式兼容 |
| SectionRenderer.vue | 通用渲染器 + 组件映射 |
| 6-8 个基础渲染组件 | hero-banner, feature-grid, stats-bar, cta-section, divider, rich-text, faq-accordion, image-carousel |
| 2-4 个复杂渲染组件 | card-list, contact-form, testimonials, custom-html |
| 首页改造 | index.vue 切换为动态渲染 |

**验收标准**：Agent 生成一段完整 JSON，PC 前端可正确渲染所有 12 种组件，视觉效果与硬编码版本相当。

#### P2 - 后端适配（1 天）

| 任务 | 产出 |
|------|------|
| DecorateDataLogic 适配 | pc() 方法返回 schema 信息 |
| PcLogic 适配 | getIndexData() 返回原始 data |
| 旧格式迁移函数 | migrateLegacyWidgets() |

**验收标准**：新旧两种 JSON 格式的页面数据都能正常获取，前端渲染无异常。

#### P3 - 后台编辑器（2-3 天）

| 任务 | 产出 |
|------|------|
| SectionList 组件 | 左侧 section 列表 + 拖拽排序 |
| SectionEditor 组件 | 右侧 props 编辑 + 动态加载编辑器 |
| ComponentCatalog 组件 | 添加新 section 的组件选择面板 |
| 8-12 个 props 编辑器 | 按 type 分的表单编辑器 |

**验收标准**：后台编辑器可以读取、编辑、保存 Agent 生成的 JSON，修改后 PC 前端实时生效。

#### P4 - 集成测试 + 优化（1-2 天）

| 任务 | 产出 |
|------|------|
| 端到端测试 | Agent 生成 → API 保存 → 前端渲染 → 后台编辑 → 修改保存 → 前端更新 |
| 响应式适配 | 渲染组件移动端适配 |
| 性能优化 | 懒加载、图片优化 |
| SEO 适配 | Nuxt SSR 渲染验证 |

**验收标准**：完整流程闭环，无数据丢失，渲染无异常。

### 11.2 总工期

| 阶段 | 天数 | 依赖 |
|------|------|------|
| P0 Schema + Skill | 1-2 天 | 无 |
| P1 前端渲染 | 3-4 天 | P0 |
| P2 后端适配 | 1 天 | P0 |
| P3 后台编辑器 | 2-3 天 | P0 + P1 |
| P4 集成测试 | 1-2 天 | P1 + P2 + P3 |
| **合计** | **8-12 天** | |

### 11.3 优先级

```
P0（必须先做）→ P1 + P2 可并行 → P3（依赖 P1）→ P4（收尾）
```

### 11.4 风险点

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Agent 生成的 JSON 不合法 | 页面渲染失败 | 前端 try-catch 兜底，JSON.parse 失败时显示默认页面 |
| 组件 props 缺失或类型错误 | 组件渲染异常 | 每个渲染组件的 props 设置默认值 |
| 新旧格式切换期间数据丢失 | 用户看到空白页 | 兼容层：检测旧格式自动迁移 |
| 图片 URL 为空 | 显示占位图 | 渲染组件对空 URL 显示占位图 |
| 后台编辑器保存时覆盖 Agent 格式 | 数据结构破坏 | 编辑器保存时校验 JSON 结构完整性 |

---

## 12. 附录

### 12.1 TypeScript 类型定义

```typescript
// pc/types/page-builder.ts

// Section 类型
export interface Section {
  id: string
  type: SectionType
  title: string
  visible: boolean
  props: Record<string, any>
  styles?: SectionStyles
}

// 组件类型枚举
export type SectionType =
  | 'hero-banner'
  | 'feature-grid'
  | 'rich-text'
  | 'image-carousel'
  | 'stats-bar'
  | 'testimonials'
  | 'faq-accordion'
  | 'cta-section'
  | 'card-list'
  | 'contact-form'
  | 'divider'
  | 'custom-html'

// 样式类型
export interface SectionStyles {
  padding?: string
  paddingTop?: string
  paddingBottom?: string
  backgroundColor?: string
  backgroundImage?: string
  color?: string
  textAlign?: string
}

// 页面设置
export interface PageSettings {
  maxWidth: string
  gap: string
  backgroundColor: string
}

// 页面元信息
export interface PageMeta {
  version: string
  pageId: number
  pageType: string
  generatedBy?: 'agent' | 'manual'
  updatedAt?: string
}

// 完整页面数据
export interface PageData {
  _meta: PageMeta
  settings: PageSettings
  sections: Section[]
}

// ─── 各组件 Props 类型 ───

export interface HeroBannerProps {
  heading: string
  subheading?: string
  backgroundImage?: string
  backgroundColor?: string
  textColor?: string
  textAlign?: 'left' | 'center'
  height?: string
  ctaText?: string
  ctaLink?: string
  ctaStyle?: 'primary' | 'outline' | 'link'
}

export interface FeatureGridProps {
  heading?: string
  subheading?: string
  columns?: 2 | 3 | 4
  items: FeatureItem[]
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface RichTextProps {
  layout?: 'text-only' | 'left-image' | 'right-image' | 'full-width'
  heading?: string
  content: string
  image?: string
  imageAlt?: string
  ctaText?: string
  ctaLink?: string
}

export interface ImageCarouselProps {
  height?: string
  autoplay?: boolean
  interval?: number
  items: CarouselItem[]
}

export interface CarouselItem {
  image: string
  title?: string
  link?: string
}

export interface StatsBarProps {
  items: StatsItem[]
}

export interface StatsItem {
  value: string
  label: string
  icon?: string
}

export interface TestimonialsProps {
  heading?: string
  columns?: 2 | 3
  items: TestimonialItem[]
}

export interface TestimonialItem {
  avatar?: string
  name: string
  role?: string
  content: string
  rating?: number
}

export interface FaqAccordionProps {
  heading?: string
  items: FaqItem[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface CtaSectionProps {
  heading: string
  subheading?: string
  ctaText: string
  ctaLink?: string
  backgroundImage?: string
  backgroundColor?: string
  textColor?: string
  style?: 'centered' | 'split'
}

export interface CardListProps {
  heading?: string
  source?: 'manual' | 'article-latest' | 'article-hot'
  columns?: 2 | 3 | 4
  limit?: number
  showImage?: boolean
  showTag?: boolean
  items?: CardItem[]
}

export interface CardItem {
  image?: string
  title: string
  description?: string
  tag?: string
  link?: string
}

export interface ContactFormProps {
  heading: string
  subheading?: string
  fields: FormField[]
  submitText?: string
  successMessage?: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: string[]
}

export interface DividerProps {
  style?: 'line' | 'space' | 'gradient'
  height?: string
  color?: string
}

export interface CustomHtmlProps {
  html: string
}
```

### 12.2 组件目录 JSON Schema（可编程校验用）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PageSections",
  "type": "object",
  "required": ["_meta", "settings", "sections"],
  "properties": {
    "_meta": {
      "type": "object",
      "required": ["version"],
      "properties": {
        "version": { "type": "string", "const": "1.0" },
        "pageId": { "type": "number" },
        "pageType": { "type": "string" }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "maxWidth": { "type": "string", "default": "1200px" },
        "gap": { "type": "string", "default": "0px" },
        "backgroundColor": { "type": "string", "default": "#f5f7fa" }
      }
    },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "type", "title", "visible", "props"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
          "type": {
            "type": "string",
            "enum": [
              "hero-banner", "feature-grid", "rich-text",
              "image-carousel", "stats-bar", "testimonials",
              "faq-accordion", "cta-section", "card-list",
              "contact-form", "divider", "custom-html"
            ]
          },
          "title": { "type": "string" },
          "visible": { "type": "boolean" },
          "props": { "type": "object" },
          "styles": { "type": "object" }
        }
      }
    }
  }
}
```

### 12.3 HTML Sanitize 白名单

富文本字段（`rich-text.content`、`faq-accordion.items[].answer`）中允许的 HTML 标签：

```
允许的标签: p, br, strong, em, b, i, u, ul, ol, li, a, h1, h2, h3, h4, span, div
允许的属性: href (仅 a 标签), target (仅 a 标签), class
禁止的标签: script, style, iframe, form, input, object, embed
禁止的协议: javascript:, data:, vbscript:
```

推荐使用 `sanitize-html` 库（Nuxt 端）：

```typescript
import sanitizeHtml from 'sanitize-html'

const cleanHtml = (dirty: string) => sanitizeHtml(dirty, {
  allowedTags: ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'span', 'div'],
  allowedAttributes: { 'a': ['href', 'target'] },
  disallowedTagsMode: 'discard',
})
```

---

> 文档结束。如有疑问或需要调整，请在评审时提出。
