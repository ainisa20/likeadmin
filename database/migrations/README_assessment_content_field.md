# 评估申请表单 - 添加留言内容字段

**更新日期：** 2026-04-16
**作者：** CMS Editor
**版本：** v1.1

---

## 📋 更新概述

为评估申请表单添加了 `content` 字段，用户可以填写留言内容或需求说明。

---

## ✅ 已完成的修改

### 1. 数据库修改

**文件：** 数据库表 `la_assessment`

**修改内容：**
```sql
ALTER TABLE `la_assessment`
ADD COLUMN `content` TEXT NULL COMMENT '用户留言内容（最多500字符）'
AFTER `stage`;
```

**验证：**
```bash
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here -D likeadmin -e "DESC la_assessment;"
```

---

### 2. 后端修改

#### 2.1 验证器

**文件：** `/var/www/likeadmin/server/app/api/validate/AssessmentValidate.php`

**修改内容：**
- 添加 `content` 字段验证规则
- 最大长度：500个字符
- 允许为空（可选填）

**关键代码：**
```php
protected $rule = [
    'name' => 'require',
    'phone' => 'require|regex:/^1[3-9]\d{9}$/',
    'stage' => 'require|in:idea,direction,company,team',
    'content' => 'max:500',  // 新增
];

protected $message = [
    // ...
    'content.max' => '留言内容不能超过500个字符',  // 新增
];

public function sceneSubmit()
{
    return $this->only(['name', 'phone', 'stage', 'content']);  // 添加 content
}
```

#### 2.2 逻辑层

**文件：** `/var/www/likeadmin/server/app/api/logic/AssessmentLogic.php`

**说明：** 无需修改，`Assessment::create($params)` 会自动保存 content 字段

---

### 3. 数据库迁移文件

**文件：** `/var/www/likeadmin/database/migrations/20260416_add_content_to_assessment.sql`

**用途：** 记录数据库变更，便于版本管理和回滚

**使用方法：**
```bash
# 在新环境部署时执行
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here < /var/www/likeadmin/database/migrations/20260416_add_content_to_assessment.sql
```

**回滚方法：**
```sql
ALTER TABLE `la_assessment` DROP COLUMN `content`;
```

---

### 4. 前端示例代码

**文件：** `/var/www/likeadmin/examples/assessment-form-example.vue`

**包含功能：**
- ✅ 完整的表单组件（姓名、电话、咨询类型、留言内容）
- ✅ 表单验证（前后端双重验证）
- ✅ 字数统计（最多500字）
- ✅ 提交状态反馈
- ✅ 响应式布局

**使用方法：**
```bash
# 1. 查看示例代码
docker exec likeadmin-php cat /var/www/likeadmin/examples/assessment-form-example.vue

# 2. 复制到项目中
docker exec likeadmin-php cp /var/www/likeadmin/examples/assessment-form-example.vue /var/www/likeadmin/pc/pages/assessment.vue

# 3. 修改路由配置
docker exec likeadmin-php vim /var/www/likeadmin/pc/constants/menu.ts

# 4. 重新构建
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"
```

---

## 🔧 API 接口说明

### 提交评估申请

**接口地址：** `/api/assessment/submit`
**请求方法：** `POST`

**请求参数：**
```json
{
  "name": "张三",
  "phone": "13800138000",
  "stage": "idea",
  "content": "我想了解更多关于产品的详细信息"  // 新增字段，可选
}
```

**响应示例：**
```json
{
  "code": 1,
  "msg": "提交成功，我们将于24小时内联系您",
  "data": []
}
```

**错误响应：**
```json
{
  "code": 0,
  "msg": "留言内容不能超过500个字符",
  "data": []
}
```

---

## 📊 数据库字段说明

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `content` | TEXT | 用户留言内容，最多500字符 | "我想咨询产品价格" |

**字段特性：**
- ✅ 允许为空（用户可选填）
- ✅ 最大500个字符
- ✅ 支持多行文本
- ✅ 前后端双重验证

---

## 🎯 使用场景

### 场景1：产品咨询页面

```vue
<template>
  <div class="product-consult">
    <h2>产品咨询</h2>
    <p>如有任何问题，请填写下方表单</p>

    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="电话" prop="phone">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item label="咨询类型" prop="stage">
        <el-select v-model="form.stage">
          <el-option label="产品咨询" value="idea" />
        </el-select>
      </el-form-item>

      <el-form-item label="问题描述" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          placeholder="请描述您的问题"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-button type="primary" @click="submitForm">
        提交咨询
      </el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  name: '',
  phone: '',
  stage: 'idea',
  content: ''  // 新增的留言内容字段
})

const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  phone: [{ required: true, pattern: /^1[3-9]\d{9}$/ }],
  stage: [{ required: true }],
  content: [{ max: 500, message: '最多500字' }]  // 新增验证规则
}

const submitForm = async () => {
  await formRef.value.validate()

  const res = await request({
    url: '/api/assessment/submit',
    method: 'POST',
    data: form  // 包含 content 字段
  })

  if (res.code === 1) {
    ElMessage.success('提交成功！')
  }
}
</script>
```

---

## ⚠️ 注意事项

### 1. 字段验证

**前端验证：**
```javascript
content: [
  { max: 500, message: '留言内容不能超过500个字符', trigger: 'blur' }
]
```

**后端验证：**
```php
'content' => 'max:500',
```

### 2. 字段区别

- **`content`** - 用户填写的留言内容（前端提交）
- **`remark`** - 管理员在后台添加的备注（后台管理）

两者用途不同，不要混淆。

### 3. 防重复提交

系统已有防重复提交机制：
- 同一手机号1小时内只能提交1次
- 即使 content 不同，也会被拦截

---

## 🔄 升级步骤（新环境部署）

如果在新的服务器上部署，按以下步骤执行：

```bash
# 1. 执行数据库迁移
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here < /var/www/likeadmin/database/migrations/20260416_add_content_to_assessment.sql

# 2. 验证表结构
docker exec likeadmin-mysql mysql -uroot -pyour_secure_password_here -D likeadmin -e "DESC la_assessment;"

# 3. 验证后端代码
docker exec likeadmin-php cat /var/www/likeadmin/server/app/api/validate/AssessmentValidate.php | grep "content"

# 4. 测试API
curl -X POST http://localhost/api/assessment/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","phone":"13800138000","stage":"idea","content":"测试留言"}'

# 5. 重新构建前端
docker exec likeadmin-php bash -c "cd /var/www/likeadmin/pc && npm run build"
```

---

## 📞 技术支持

如有问题，请联系：
- **文档：** `/skills/cms_content_editor/SKILL.md`
- **记忆：** `MEMORY.md`
- **人设：** `SOUL.md`

---

**更新完成！** ✅
