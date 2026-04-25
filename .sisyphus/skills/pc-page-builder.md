# PC页面构建

## 数据库结构

| 页面id | 路由 | 当前sections |
|--------|------|-------------|
| 4 | / | carousel-hero, stats-company, features-core, cards-latest, form-contact, cta-footer |
| 6 | /pc/services | hero-services, features-services, content-process, cta-contact |
| 7 | /pc/cases | hero-cases, cases-all, reviews-cases, cta-cases |
| 8 | /pc/about | hero-about, content-intro, stats-about, features-values, form-about |

**表**: `la_decorate_page` (id, type, data: JSON字符串)

---

## 操作流程

### 读取页面
```
GET /api/pc/page?id=4
```
返回 `{code:1, data:{page:{id:4, type:4, data:"{\"sections\":[...]}"}}}`

需要用 `JSON.parse(response.data.page.data)` 解析data字段

### 保存页面
```
POST /adminapi/decorate.page/save
Body: {"id": 4, "data": "紧凑JSON字符串"}
```

### 主题配置
```
GET /api/pc/config
```
返回 `data.theme_config.primaryColor=#4153ff, headerBgColor=#4153ff`

---

## Section基础结构

```json
{
  "id": "section唯一id",
  "type": "组件类型",
  "title": "管理员显示标题",
  "visible": true,
  "props": { ... },
  "styles": { "padding": "60px 0", "backgroundColor": "#ffffff" }
}
```

---

## 10大组件

### hero-banner (大横幅)
```json
{
  "type": "hero-banner",
  "props": {
    "heading": "主标题",
    "subheading": "副标题",
    "backgroundColor": "#4153ff",
    "textColor": "#ffffff",
    "textAlign": "center",
    "height": "420px",
    "ctaText": "按钮文字",
    "ctaLink": "/pc/services",
    "ctaStyle": "primary"
  }
}
```

### feature-grid (特色网格)
```json
{
  "type": "feature-grid",
  "props": {
    "heading": "为什么选择我们",
    "subheading": "副标题",
    "columns": 3,
    "items": [
      {"icon": "🎯", "title": "专业团队", "description": "多年行业经验"},
      {"icon": "🤝", "title": "优质服务", "description": "全程贴心服务"},
      {"icon": "💼", "title": "成功案例", "description": "丰富实战经验"}
    ]
  }
}
```

### rich-text (富文本)
```json
{
  "type": "rich-text",
  "props": {
    "heading": "标题",
    "content": "<p>HTML内容</p><ul><li>项目1</li></ul>",
    "layout": "text-only"
  }
}
```

### image-carousel (轮播图)
```json
{
  "type": "image-carousel",
  "props": {
    "height": "420px",
    "autoplay": true,
    "interval": 4000,
    "items": [
      {"image": "/resource/image/adminapi/default/banner001.png", "title": "标题", "link": "www.baidu.com"},
      {"image": "/resource/image/adminapi/default/banner002.png", "title": "标题2", "link": ""}
    ]
  }
}
```

### stats-bar (统计条)
```json
{
  "type": "stats-bar",
  "props": {
    "items": [
      {"value": "500+", "label": "服务客户", "icon": "🏢"},
      {"value": "98%", "label": "满意度", "icon": "⭐"}
    ]
  }
}
```

### testimonials (客户评价)
```json
{
  "type": "testimonials",
  "props": {
    "heading": "客户评价",
    "columns": 3,
    "items": [
      {"name": "张总", "role": "CEO", "content": "服务专业，推荐！", "rating": 5}
    ]
  }
}
```

### card-list (卡片列表)
```json
{
  "type": "card-list",
  "props": {
    "heading": "最新案例",
    "source": "manual",
    "columns": 3,
    "items": [
      {"image": "/resource/image/adminapi/default/xxx.png", "title": "标题", "description": "描述"}
    ]
  }
}
```

### contact-form (联系表单)
```json
{
  "type": "contact-form",
  "props": {
    "heading": "联系我们",
    "subheading": "提交后24小时内联系您",
    "fields": [
      {"name": "name", "label": "姓名", "type": "text", "required": true},
      {"name": "phone", "label": "手机号", "type": "phone", "required": true},
      {"name": "content", "label": "备注", "type": "textarea", "required": false}
    ],
    "submitText": "提交",
    "successMessage": "提交成功！"
  }
}
```

### cta-section (行动号召)
```json
{
  "type": "cta-section",
  "props": {
    "heading": "准备好开始了吗？",
    "subheading": "立即联系我们",
    "ctaText": "在线咨询",
    "ctaLink": "#form-contact",
    "backgroundColor": "#4153ff",
    "textColor": "#ffffff"
  }
}
```

### divider (分割线)
```json
{
  "type": "divider",
  "props": {"style": "space", "height": "40px"}
}
```

---

## 操作示例

### 示例1: 修改首页轮播图标题

1. GET /api/pc/page?id=4 获取数据
2. 找到 id="carousel-hero" 的 section
3. 修改 props.items[0].title = "新标题"
4. POST /adminapi/decorate.page/save {"id":4, "data":"新JSON"}

### 示例2: 首页添加轮播图

在 sections 数组开头添加:
```json
{
  "id": "carousel-hero",
  "type": "image-carousel",
  "title": "首页轮播图",
  "visible": true,
  "props": {
    "height": "420px",
    "items": [
      {"image": "/resource/image/adminapi/default/banner001.png", "title": "专业解决方案", "link": "www.baidu.com"}
    ]
  }
}
```

### 示例3: 修改主题色背景

在 hero-banner 的 props 中设置:
```json
{"backgroundColor": "#4153ff", "textColor": "#ffffff"}
```

### 示例4: 删除某个section

从 sections 数组中移除整个对象

### 示例5: 表单提交

- PC表单 → POST /api/assessment/submit (name, phone, content)
- 数据存 la_assessment 表
- Admin查看: /admin/assessment

---

## 规则

- **图片路径**: `/resource/image/adminapi/default/xxx.png`
- **外链自动加https**: 填 `www.baidu.com` → `https://www.baidu.com`
- **主题色**: #4153ff
- **存储JSON**: 必须紧凑 `JSON.stringify(obj)`

---

## 新增页面SOP

### 步骤1: 插入数据库记录

```sql
-- 假设新增 id=9 的隐私政策页面
INSERT INTO la_decorate_page (id, type, data) VALUES (9, 9, '{}');
-- 或通过API创建
```

### 步骤2: 添加PC前端页面文件

新建 `pc/pages/policy/[slug].vue` 或 `pc/pages/xxx.vue`:

```vue
<template>
  <div>
    <SectionRenderer :sections="sections" />
  </div>
</template>

<script setup>
const route = useRoute()
const pageId = 9  // 或根据route解析
const { data } = await useFetch(`/api/pc/page?id=${pageId}`)
const sections = computed(() => data.value?.page ? JSON.parse(data.value.page.data).sections : [])
</script>
```

### 步骤3: 配置路由（可选）

如果使用动态路由 `[slug].vue`，不需要额外配置

### 步骤4: 添加导航菜单（数据库）

```sql
-- 在 la_auth_menu 添加菜单项（Admin后台显示）
INSERT INTO la_auth_menu (pid, name, icon, route, component, menu_name, menu_type, is_show, sort) 
VALUES (0, 'policy', '', '/pc/policy', '', '隐私政策', 'dir', 1, 99);
```

或在 `pc/constants/menu.ts` 添加:

```ts
{ name: '隐私政策', path: '/pc/policy' }
```

### 步骤5: 构建部署

```bash
cd pc && npm run build
# 文件复制到 server/public/pc/
```

### 步骤6: 访问

访问 `/pc/policy` 测试