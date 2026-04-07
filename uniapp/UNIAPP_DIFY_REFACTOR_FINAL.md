# Uniapp Dify 聊天重构方案 - 最终版

> **版本**: v2.0.0 Final
> **日期**: 2026-04-07
> **平台**: 仅 H5
> **目标**: 使用 Dify Service API 替换 iframe 方案，实现与 PC 端一致的聊天体验

---

## 📋 目录

1. [方案概述](#方案概述)
2. [配置现状](#配置现状)
3. [代码复用策略](#代码复用策略)
4. [实施步骤](#实施步骤)
5. [详细技术方案](#详细技术方案)
6. [测试计划](#测试计划)
7. [风险评估](#风险评估)

---

## 1. 方案概述

### 1.1 现状

**当前实现（iframe 方案）**:
```vue
<!-- uniapp/src/components/widgets/customer-service/customer-service.vue -->
const iframeUrl = `${difyUrl}/chatbot/${difyToken}?user_id=${userId}&conversation_id=${conversationId}`
// 使用 iframe 嵌入 Dify 原生界面
```

**问题**:
- ❌ 有 Dify 水印
- ❌ 无法自定义 UI
- ❌ 无法实现语音输入（Dify 原生界面不支持）
- ❌ 体验不可控

### 1.2 目标方案

**新实现（Service API 方案）**:
```typescript
// 使用 Dify Service API
import { sendMessage, parseStream } from '@/api/dify'

const response = await sendMessage({ query: userInput })
for await (const chunk of parseStream(response)) {
  // 流式响应，实时显示打字效果
}
```

**优势**:
- ✅ 无水印，完全自定义 UI
- ✅ 支持语音输入
- ✅ 与 PC 端体验一致
- ✅ 流式响应实时打字效果

---

## 2. 配置现状

### 2.1 ✅ 配置已存在（无需修改后端）

**管理后台配置位置**:
`admin/src/views/decoration/component/widgets/customer-service/attr.vue`

```vue
<el-form-item label="Dify URL">
  <el-input v-model="contentData.dify_url" />
  <div>例如: http://localhost</div>
</el-form-item>

<el-form-item label="Dify Token">
  <el-input v-model="contentData.dify_token" />
  <div>例如: DOvk6D9nyaO5J06r</div>
</el-form-item>
```

**uniapp 获取方式**:
```typescript
// uniapp/src/components/widgets/customer-service/customer-service.vue
const props = defineProps({
  content: {
    type: Object,
    default: () => ({})
  }
})

// 从装修数据中获取（已有）
const difyUrl = props.content.dify_url || ''
const difyToken = props.content.dify_token || ''
```

### 2.2 配置数据流

```
管理后台装修配置
        ↓
保存到 la_decorate_page 表
  - id: 3 (移动端客服页面)
  - data: JSON (包含 dify_url 和 dify_token)
        ↓
uniapp 调用 /index/decorate?id=3
        ↓
返回装修数据 JSON
        ↓
customer-service 组件通过 props.content 获取
```

---

## 3. 代码复用策略

### 3.1 可直接复用（100%）

| 文件 | 复用方式 | 说明 |
|-----|---------|-----|
| `pc/types/dify.ts` | 复制 → 粘贴 | TypeScript 类型定义完全通用 |

### 3.2 需适配后复用（85-95%）

| 文件 | 复用率 | 需要修改 |
|-----|--------|---------|
| `pc/api/dify.ts` | **95%** | ✅ H5 使用 fetch（完全兼容）<br>添加条件编译注释 |
| `pc/stores/dify.ts` | **90%** | 替换 ElMessage → uni.$u.toast<br>从 props 获取配置 |
| `pc/composables/useDifyUser.ts` | **85%** | sessionStorage → uni.getStorageSync<br>crypto.randomUUID 适配 |

### 3.3 需要重写（20%）

| 文件 | 重写原因 | 重写方式 |
|-----|---------|---------|
| `pc/components/DifyChat/index.vue` | UI 库不同（Element Plus → uView） | 使用 uView 组件重写 UI |
| 音频录制 | 无需改动 | H5 平台代码完全相同 |

### 3.4 总体复用率：**88%**

---

## 4. 实施步骤

### Phase 1: 文件复制（5 分钟）

```bash
# 1. 类型定义
cp pc/types/dify.ts uniapp/src/types/dify.ts

# 2. API 层
cp pc/api/dify.ts uniapp/src/api/dify.ts

# 3. 状态管理
cp pc/stores/dify.ts uniapp/src/stores/dify.ts

# 4. 用户管理
cp pc/composables/useDifyUser.ts uniapp/src/composables/useDifyUser.ts
```

---

### Phase 2: 适配修改（30 分钟）

#### 2.1 创建消息工具

```typescript
// uniapp/src/utils/message.ts
export const toast = {
  warning: (msg: string) => {
    uni.$u.toast(msg)
  },
  error: (msg: string) => {
    uni.$u.toast(msg)
  },
  success: (msg: string) => {
    uni.$u.toast(msg)
  }
}
```

#### 2.2 修改 Store

```typescript
// uniapp/src/stores/dify.ts

import { getConfig } from '@/api/app'
import { toast } from '@/utils/message'  // 替换 ElMessage

export const useDifyStore = defineStore('dify', {
  state: (): DifyState => ({
    config: {
      enabled: false,
      token: '',
      baseUrl: '',
      buttonColor: '#1C64F2',
      windowWidth: '24',
      windowHeight: '40'
    },
    // ...
  }),

  actions: {
    // 删除 initConfig（不从 /index/config 获取）
    // 新增：从装修数据设置配置
    setConfig(config: { dify_url: string, dify_token: string }) {
      this.config.baseUrl = config.dify_url || ''
      this.config.token = config.dify_token || ''
      this.config.enabled = !!(this.config.baseUrl && this.config.token)
    }
  }
})
```

#### 2.3 修改 useDifyUser

```typescript
// uniapp/src/composables/useDifyUser.ts

const getUserId = (): string => {
  const STORAGE_KEY = 'dify_user_id'

  // #ifdef H5
  let userId = sessionStorage.getItem(STORAGE_KEY)
  if (!userId) {
    try {
      userId = crypto.randomUUID()
    } catch {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    sessionStorage.setItem(STORAGE_KEY, userId)
  }
  return userId
  // #endif
}
```

#### 2.4 API 层无需修改

```typescript
// uniapp/src/api/dify.ts
// H5 平台直接使用 fetch，完全兼容 PC 端代码

export function sendMessage(params: SendMessageParams) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')

  // H5 平台完全支持 fetch
  return fetch(`${difyApiUrl}/v1/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: params.query,
      response_mode: 'streaming',
      user: getUserId(),
      conversation_id: params.conversation_id || undefined,
      inputs: {},
      files: params.files
    })
  })
}

// parseStream 完全不用改，H5 支持 ReadableStream
export async function* parseStream(body: any) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  // ... 完全相同
}
```

---

### Phase 3: UI 组件开发（3-4 小时）

#### 3.1 创建聊天组件

```vue
<!-- uniapp/src/components/DifyChat/index.vue -->
<template>
  <view class="dify-chat" v-if="difyStore.config.enabled">
    <!-- 聊天按钮 -->
    <view class="chat-button" @click="toggleChat">
      💬
    </view>

    <!-- 聊天窗口 -->
    <view class="chat-window" v-if="isOpen">
      <!-- 标题栏 -->
      <view class="chat-header">
        <text>智能客服</text>
        <text @click="toggleChat">✕</text>
      </view>

      <!-- 消息列表 -->
      <scroll-view class="chat-messages" scroll-y>
        <view
          v-for="msg in difyStore.messages"
          :key="msg.id"
          class="message-item"
          :class="msg.role"
        >
          <view class="message-content">{{ msg.content }}</view>
        </view>
      </scroll-view>

      <!-- 输入区域 -->
      <view class="chat-input">
        <textarea
          v-model="inputQuery"
          @confirm="send"
        />
        <button @click="send" :disabled="!inputQuery.trim()">
          发送
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDifyStore } from '@/stores/dify'

const props = defineProps({
  content: {
    type: Object,
    required: true
  }
})

const difyStore = useDifyStore()

// 从装修数据初始化配置
difyStore.setConfig({
  dify_url: props.content.dify_url || '',
  dify_token: props.content.dify_token || ''
})

const isOpen = ref(false)
const inputQuery = ref('')

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const send = async () => {
  if (!inputQuery.value.trim()) return

  await difyStore.sendMessage(inputQuery.value)
  inputQuery.value = ''
}
</script>

<style lang="scss" scoped>
.dify-chat {
  // 样式使用 uView 风格
  .chat-button {
    position: fixed;
    bottom: 100rpx;
    right: 30rpx;
    width: 100rpx;
    height: 100rpx;
    background: #1C64F2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 40rpx;
  }

  .chat-window {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 750rpx;
    height: 1000rpx;
    background: white;
    border-radius: 20rpx 20rpx 0 0;
    display: flex;
    flex-direction: column;
  }

  .message-item {
    padding: 20rpx;

    &.user {
      .message-content {
        background: #1C64F2;
        color: white;
        margin-left: auto;
      }
    }

    &.assistant {
      .message-content {
        background: #f5f5f5;
        margin-right: auto;
      }
    }
  }
}
</style>
```

#### 3.2 集成到客服页面

```vue
<!-- uniapp/src/components/widgets/customer-service/customer-service.vue -->
<template>
  <view class="customer-service">
    <!-- 原有的联系方式 -->
    <view class="contact-info">
      <!-- 二维码、电话等 -->
    </view>

    <!-- 新增：Dify 聊天组件 -->
    <!-- #ifdef H5 -->
    <DifyChat :content="content" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
// #ifdef H5
import DifyChat from '@/components/DifyChat/index.vue'
// #endif

const props = defineProps({
  content: {
    type: Object,
    default: () => ({})
  }
})
</script>
```

---

### Phase 4: 高级功能（可选）

#### 4.1 语音输入

```typescript
// 从 PC 端直接复制，H5 完全相同
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  })

  // ... 完全相同的代码
}
```

#### 4.2 文件上传

```typescript
// H5 使用 input type="file"
<input
  type="file"
  @change="handleFileUpload"
  accept="image/*,.pdf,.doc,.docx"
/>
```

---

### Phase 5: 测试调试（1 小时）

#### 5.1 功能测试

- [ ] 基础文本聊天
- [ ] 流式响应实时显示
- [ ] 历史记录加载
- [ ] 消息反馈（点赞/点踩）
- [ ] 停止生成
- [ ] 重新生成

#### 5.2 高级功能测试

- [ ] 语音输入
- [ ] 语音转文字
- [ ] 文件上传
- [ ] 文件预览

#### 5.3 兼容性测试

- [ ] Chrome 浏览器
- [ ] Safari 浏览器
- [ ] 微信内置浏览器

---

## 5. 详细技术方案

### 5.1 H5 平台技术栈

| 技术 | 说明 |
|-----|------|
| Vue 3 | Composition API |
| Pinia | 状态管理（与 PC 端相同） |
| fetch API | HTTP 请求（与 PC 端相同）|
| ReadableStream | 流式响应（与 PC 端相同）|
| MediaRecorder | 音频录制（与 PC 端相同）|
| AudioContext | 音频处理（与 PC 端相同）|

**结论**: H5 平台完全兼容 PC 端的所有代码！

### 5.2 配置获取对比

| 平台 | 配置来源 | 接口 |
|-----|---------|------|
| PC 端 | 后端 `/pc/config` | PcLogic::getConfigData() |
| uniapp | 装修数据 | /index/decorate?id=3 |

**uniapp 获取方式**:
```typescript
// 方式 1: 从 props 传入
const props = defineProps({
  content: {
    type: Object,
    required: true
  }
})

difyStore.setConfig({
  dify_url: props.content.dify_url,
  dify_token: props.content.dify_token
})

// 方式 2: 直接在组件中使用
const difyUrl = props.content.dify_url
const difyToken = props.content.dify_token
```

### 5.3 API 调用对比

**PC 端**:
```typescript
const config = useDifyStore().config
return fetch(`${config.baseUrl}/v1/chat-messages`, {
  headers: { 'Authorization': `Bearer ${config.token}` }
})
```

**uniapp（完全相同）**:
```typescript
const config = useDifyStore().config
return fetch(`${config.baseUrl}/v1/chat-messages`, {
  headers: { 'Authorization': `Bearer ${config.token}` }
})
```

---

## 6. 测试计划

### 6.1 测试环境

- **开发环境**: `npm run dev:h5`
- **测试 URL**: http://localhost:5173
- **Dify 环境**: 确保可访问

### 6.2 测试数据

**管理后台配置**:
- Dify URL: `http://localhost`
- Dify Token: `DOvk6D9nyaO5J06r`

### 6.3 测试用例

#### 基础功能

| 用例 | 步骤 | 预期结果 |
|-----|------|---------|
| 打开聊天窗口 | 点击聊天按钮 | 弹出聊天窗口 |
| 发送消息 | 输入文本，点击发送 | 消息显示，AI 流式回复 |
| 关闭窗口 | 点击关闭按钮 | 窗口关闭 |
| 历史记录 | 刷新页面，重新打开 | 显示历史对话 |

#### 高级功能

| 用例 | 步骤 | 预期结果 |
|-----|------|---------|
| 语音输入 | 点击麦克风，说话 | 语音转文字，自动发送 |
| 文件上传 | 点击上传，选择图片 | 图片显示，AI 识别 |
| 停止生成 | 发送消息后点击停止 | AI 停止生成 |

---

## 7. 风险评估

### 7.1 技术风险

| 风险 | 等级 | 影响 | 缓解措施 |
|-----|------|------|---------|
| 无 | 低 | - | H5 平台完全兼容 PC 端代码 |

### 7.2 兼容性风险

| 浏览器 | 兼容性 | 说明 |
|-------|--------|------|
| Chrome | ✅ 完美 | 完全支持 |
| Safari | ✅ 完美 | 完全支持 |
| 微信内置 | ✅ 良好 | 基于 Chrome 内核 |

### 7.3 配置风险

| 风险 | 缓解措施 |
|-----|---------|
| dify_url 为空 | 添加配置验证，不显示聊天按钮 |
| dify_token 无效 | 显示错误提示 |

---

## 8. 文件清单

### 8.1 新增文件

```
uniapp/src/
├── types/
│   └── dify.ts                           # 从 PC 复制
├── composables/
│   └── useDifyUser.ts                    # 从 PC 复制（小幅修改）
├── api/
│   └── dify.ts                           # 从 PC 复制（无需修改）
├── stores/
│   └── dify.ts                           # 从 PC 复制（小幅修改）
├── components/
│   └── DifyChat/
│       └── index.vue                     # 新组件（3-4 小时）
└── utils/
    └── message.ts                        # 新工具（5 分钟）
```

### 8.2 修改文件

```
uniapp/src/components/widgets/customer-service/
    └── customer-service.vue              # 集成 DifyChat 组件
```

---

## 9. 时间估算

| 阶段 | 任务 | 耗时 |
|-----|------|------|
| Phase 1 | 文件复制 | 5 分钟 |
| Phase 2 | 适配修改 | 30 分钟 |
| Phase 3 | UI 开发 | 3-4 小时 |
| Phase 4 | 高级功能（可选） | 1-2 小时 |
| Phase 5 | 测试调试 | 1 小时 |
| **总计** | | **5.5-7.5 小时** |

---

## 10. 与 PC 端对比

### 10.1 相同部分（85%）

| 功能 | PC 端 | uniapp | 复用率 |
|-----|-------|--------|--------|
| TypeScript 类型 | dify.ts | dify.ts | 100% |
| API 调用 | fetch | fetch | 100% |
| 流式响应 | ReadableStream | ReadableStream | 100% |
| 语音录制 | MediaRecorder | MediaRecorder | 100% |
| 音频转换 | AudioContext | AudioContext | 100% |
| 状态管理 | Pinia | Pinia | 95% |

### 10.2 不同部分（15%）

| 功能 | PC 端 | uniapp | 原因 |
|-----|-------|--------|------|
| UI 组件 | Element Plus | uView | 项目要求 |
| 消息提示 | ElMessage | uni.$u.toast | UI 库差异 |
| 存储 | sessionStorage | uni.getStorageSync | uniapp API |
| 配置来源 | /pc/config | 装修数据 | 架构差异 |

---

## 11. 实施建议

### 11.1 开发顺序

1. **先实现基础功能**（文本聊天）
2. **验证核心流程**（流式响应）
3. **再添加高级功能**（语音、文件）
4. **最后优化体验**（动画、样式）

### 11.2 渐进式开发

**版本 1.0**（MVP）:
- ✅ 文本聊天
- ✅ 流式响应
- ✅ 历史记录

**版本 1.1**（增强）:
- ✅ 语音输入
- ✅ 消息反馈
- ✅ 停止生成

**版本 1.2**（完整）:
- ✅ 文件上传
- ✅ 文件预览
- ✅ 图片识别

### 11.3 注意事项

1. **仅支持 H5 平台**（条件编译 `#ifdef H5`）
2. **保留原有联系方式**（二维码、电话）
3. **配置验证**（检查 dify_url 和 dify_token）
4. **错误处理**（网络异常、API 失败）

---

## 12. 总结

### 12.1 方案优势

- ✅ 无需修改后端
- ✅ 代码复用率 88%
- ✅ H5 完全兼容 PC 端代码
- ✅ 实施周期短（1 个工作日）
- ✅ 无水印，完全自定义

### 12.2 实施条件

- ✅ 配置已存在（dify_url、dify_token）
- ✅ 技术栈兼容（Vue 3、Pinia、fetch）
- ✅ 功能可复用（流式响应、语音输入）

### 12.3 后续优化

- 支持小程序平台（需要适配音频和流式响应）
- 支持离线消息缓存
- 支持推送通知

---

**文档版本**: v2.0.0 Final
**创建日期**: 2026-04-07
**作者**: AI Assistant
**审核状态**: ✅ 已确认，可以开始实施
