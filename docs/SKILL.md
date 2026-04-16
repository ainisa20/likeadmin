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

# AI 页面生成技能 - Schema 驱动标准 SOP

> 基于实际踩坑经验总结的标准流程，确保生成页面与现有系统完美集成

---

## ⚡ 标准 SOP 流程（7步）

**⚠️ 核心原则：**
1. **修改前必须备份**
2. **基于 Schema 配置生成**
3. **主题风格必须适配**（数据库 + CSS）
4. **保留系统功能菜单**

---

### 步骤 1：需求确认与分析

**确认事项：**
- ✅ 网站主题颜色（茶叶绿、科技蓝、书香墨色...）
- ✅ 目标用户群体
- ✅ 页面数量和类型
- ✅ 需要保留的系统功能（资讯、后台）

**输出：** 需求文档

---

### 步骤 2：创建 Schema 配置

**Schema 结构：**
```json
{
  "pageInfo": {
    "fileName": "products",
    "title": "产品中心",
    "description": "精选产品",
    "keywords": "产品"
  },
  "sections": [
    {
      "type": "page-header",
      "enabled": true,
      "order": 1,
      "config": {
        "title": "产品中心",
        "subtitle": "精选优质产品"
      }
    }
  ]
}
```

---

### 步骤 3：备份现有文件（⚠️ 必须）

```bash
# 备份主题文件
docker exec likeadmin-php bash -c "
  cp /var/www/likeadmin/pc/assets/styles/var.css \
     /var/www/likeadmin/pc/assets/styles/var.css.bak.\$(date +%Y%m%d_%H%M%S)
"

# 备份菜单文件
docker exec likeadmin-php bash -c "
  cp /var/www/likeadmin/pc/constants/menu.ts \
     /var/www/likeadmin/pc/constants/menu.ts.bak.\$(date +%Y%m%d_%H%M%S)
"
```

**备份命名格式：** `文件名.bak.YYYYMMDD_HHMMSS`

---

### 步骤 4：生成 Vue 代码

基于 Schema 配置生成完整的 Vue 组件代码（template + script + style）

---

### 步骤 4.5：表单规范（⚠️ 重要）

**可用表单：**
- ✅ 评估申请表单：`/api/assessment/submit`
- 字段：
  - `name`(姓名) - 必填
  - `phone`(电话) - 必填，11位手机号
  - `stage`(咨询类型) - 必填，可选值：idea(需求了解)/direction(方案沟通)/company(商务洽谈)/team(项目对接)
  - `content`(留言内容) - 选填，最多500字符
- 防重复：同手机号1小时内只能提交1次

**使用规则：**
| 需求 | 方案 |
|------|------|
| 产品/服务/商务咨询 | ✅ 用评估表单，stage映射为idea/direction/company |
| 联系我们 | ❌ 静态展示联系方式（电话、邮箱、地址）|
| 产品购买 | ❌ 按钮→显示联系方式弹窗 |

**❌ 禁止：**
- 生成假表单（有UI无后端）
- 调用不存在的API
- 显示假的成功提示

**✅ 必须做：**
- 表单功能需求时，优先用评估表单
- 不能用表单时，用静态展示或跳转
- 需求确认时明确告知用户限制

---

### 步骤 5：适配主题颜色（⚠️ 关键步骤）

#### 方式1：修改数据库配置（最关键！）

```bash
# 连接数据库
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here -D likeadmin

# 更新主题配置
UPDATE la_decorate_page
SET meta = '{
  "theme_config": {
    "primaryColor": "#212121",
    "headerBgColor": "#212121",
    "headerTextColor": "white",
    ...
  }
}'
WHERE id = 4;
```

#### 方式2：修改 var.css（可选，作为默认值）

编辑 `/var/www/likeadmin/pc/assets/styles/var.css`：

```css
:root body {
    /* 根据客户主题调整主色 */
    --color-primary: #212121;
    --el-color-primary: var(--color-primary);
    --color-minor: #424242;

    /* 相关色阶 */
    --el-color-primary-dark-2: #1a1a1a;
    --el-color-primary-light-3: #373737;
    --el-color-primary-light-5: #525252;
}
```

**⚠️ 重要说明：**
- Header 颜色由**数据库配置**控制，优先级最高
- `var.css` 只作为默认值，会被数据库配置覆盖
- 必须同时修改数据库和 CSS 才能确保生效

**常见主题颜色：**
- 🍵 **茶叶绿**：`#2E7D32`
- 🔵 **科技蓝**：`#4153ff`
- ⚫ **书香墨色**：`#212121`
- 🟠 **活力橙**：`#FF6B00`
- 🟣 **优雅紫**：`#9C27B0`

---

### 步骤 6：更新菜单配置（保留系统功能）

**⚠️ 重要：必须保留的系统菜单项**
- ✅ `资讯中心` - component: 'information'
- ✅ `管理后台` - component: 'admin'

**完整菜单示例：**
```typescript
export const NAVBAR = [
    { name: '首页', path: '/' },
    { name: '产品中心', path: '/products' },      // 新增
    { name: '品牌故事', path: '/story' },         // 新增
    { name: '茶文化', path: '/culture' },         // 新增
    { name: '联系我们', path: '/contact' },       // 新增
    { name: '资讯中心', path: '/information', component: 'information' },  // 保留
    { name: '管理后台', path: '/admin', component: 'admin' }             // 保留
]

export const SIDEBAR = [
    {
        module: 'personal',
        hidden: true,
        children: [
            { name: '个人中心', path: '/user', children: [...] },
            { name: '账户设置', path: '/account', children: [...] }
        ]
    }
]
```

---

### 步骤 7：构建与验证

**复制到容器：**
```bash
docker cp *.vue likeadmin-php:/var/www/likeadmin/pc/pages/
docker cp pc/constants/menu.ts likeadmin-php:/var/www/likeadmin/pc/constants/menu.ts
```

**重新构建：**
```bash
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"
```

**构建成功标志：**
```
✔ Client built in XXXms
文件已复制 ==> ../server/public/pc
```

**验证检查清单：**
- ✅ Header 颜色与客户主题一致
- ✅ 所有新页面可访问
- ✅ 资讯中心菜单存在
- ✅ 管理后台菜单存在
- ✅ 页面样式正常
- ✅ 响应式布局正常

---

## ⚠️ 踩坑经验与解决方案

### 踩坑1：忘记备份直接修改

**问题：** 修改后发现不符合需求，无法回滚

**解决方案：**
- ✅ **修改前必须备份**（添加到 SOP 流程）
- ✅ 使用时间戳备份命名
- ✅ 使用 Git 版本控制

---

### 踩坑2：Header 主题颜色不匹配（⚠️ 重要！）

**问题：** 修改了 `var.css` 但 Header 颜色仍然没有变化

**根本原因：** Header 颜色由**后台数据库动态配置**控制，不是由 `var.css` 控制！

**完整解决方案：**

**步骤1：修改数据库配置（最关键！）**
```bash
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here -D likeadmin << EOF
UPDATE la_decorate_page
SET meta = '{
  "dify_config": {...},
  "theme_config": {
    "primaryColor": "#212121",
    "headerBgColor": "#212121",
    "headerTextColor": "white",
    ...
  }
}'
WHERE id = 4;
EOF
```

**步骤2：可选择性修改 var.css（作为默认值）**
```css
/* /var/www/likeadmin/pc/assets/styles/var.css */
:root body {
    --color-primary: #212121;
    --el-color-primary: #212121;
}
```

**步骤3：重新构建前端**
```bash
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"
```

**为什么必须修改数据库？**

配置优先级：
1. **数据库配置**（运行时动态应用）- 优先级最高 ⭐⭐⭐
2. **app.vue 动态设置**（覆盖 CSS 变量）- 优先级次之 ⭐⭐
3. **var.css 默认值**（静态默认值）- 优先级最低 ⭐

**工作流程：**
```
页面加载
    ↓
app.vue 执行 applyThemeConfig()
    ↓
从数据库读取主题配置
    ↓
动态设置 CSS 变量（覆盖 var.css）
    ↓
Header 组件使用新的 CSS 变量渲染
```

**相关文件：**
- 数据库：`la_decorate_page` 表（ID=4）
- 后端：`/server/app/api/controller/PcController.php`
- 前端：`/pc/app.vue` - applyThemeConfig()
- Header：`/pc/layouts/components/header/index.vue`

---

### 踩坑3：系统功能菜单丢失

**问题：** 资讯中心、管理后台页签不见了

**原因：** 完全替换了菜单配置，没有保留原有项

**解决方案：**
- ✅ 默认保留 `资讯中心` (component: 'information')
- ✅ 默认保留 `管理后台` (component: 'admin')
- ✅ 保留 SIDEBAR 配置

---

### 踩坑4：Schema 流程不规范

**问题：** 直接手写 Vue 代码，没有使用 Schema 系统

**后果：**
- ❌ 流程不可复现
- ❌ 质量不稳定
- ❌ 难以维护

**解决方案：**
- ✅ 必须基于 Schema 配置
- ✅ 使用代码生成器
- ✅ 标准化 SOP 流程

---

### 踩坑5：依赖问题导致构建失败

**问题：** `vue-router` 依赖错误

**解决方案：**
```bash
# 删除 node_modules
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && rm -rf node_modules package-lock.json"

# 重新安装
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm install"

# 安装缺失依赖
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm install vue-router@4.2.5 --legacy-peer-deps"
```

---

### 踩坑6：修改后忘记构建

**问题：** 修改了 .vue 文件后刷新页面没有任何变化

**解决方案：**
- ✅ **修改任何前端文件后必须重新构建！**
- ✅ 检查构建成功标志
- ✅ 验证文件已复制到输出目录

---

### 踩坑7：生成假表单

**问题：** 表单有UI但没后端，用户提交无效果

**解决方案：**
- ✅ 能用评估表单（`/api/assessment/submit`）就用
- ✅ 不能用表单时，用静态联系方式展示
- ✅ 宁可电话/微信联系，不要假表单
- ✅ 需求确认时明确告知用户系统限制

---

## 📋 快速参考

### 常用命令

```bash
# 备份文件
docker exec likeadmin-php bash -c "cp /var/www/likeadmin/pc/assets/styles/var.css /var/www/likeadmin/pc/assets/styles/var.css.bak.\$(date +%Y%m%d_%H%M%S)"

# 复制文件到容器
docker cp file.vue likeadmin-php:/var/www/likeadmin/pc/pages/

# 重新构建
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"

# 查看数据库配置
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here -D likeadmin -e "SELECT meta FROM la_decorate_page WHERE id = 4;"

# 更新数据库配置
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here -D likeadmin -e "UPDATE la_decorate_page SET meta='{...}' WHERE id = 4;"
```

### 常见主题颜色

| 主题 | 主色 | 辅色 | 适用场景 |
|------|------|------|----------|
| 🍵 茶叶绿 | `#2E7D32` | `#4CAF50` | 茶叶、自然、健康 |
| 🔵 科技蓝 | `#4153ff` | `#7583ff` | 科技、商务、专业 |
| ⚫ 书香墨色 | `#212121` | `#424242` | 书籍、文化、高端 |
| 🟠 活力橙 | `#FF6B00` | `#FF8F00` | 年轻、活力、创意 |
| 🟣 优雅紫 | `#9C27B0` | `#BA68C8` | 艺术、美妆、时尚 |

---

## ✅ 最佳实践

### 应该做的 ✅

1. **修改前备份** - 永远的第一步
2. **使用 Schema** - 标准化流程
3. **适配主题** - 数据库 + CSS 双重配置
4. **保留功能** - 资讯、后台默认保留
5. **验证效果** - 完整测试再交付
6. **修改后构建** - 必须重新构建前端

### 不应该做的 ❌

1. ❌ 直接手写代码，不用 Schema
2. ❌ 忘记备份就修改
3. ❌ 只修改 CSS，不修改数据库
4. ❌ 覆盖系统功能菜单
5. ❌ 修改后不验证
6. ❌ 修改后不构建

---

**技能版本：** v1.0
**最后更新：** 2026-04-16
**维护者：** CMS Editor
