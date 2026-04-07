# Dify 自定义聊天功能 - 更新日志

## 概述

本更新用 Dify Service API 替换了原有的 embed.min.js 嵌入式方案，实现完全自定义的聊天界面，规避 Dify 水印问题。

---

## 新增文件

### 1. pc/api/dify.ts
Dify API 服务层，提供与 Dify 服务器通信的所有接口。

**主要功能：**
- `sendMessage()` - 发送聊天消息（流式响应）
- `parseStream()` - SSE 流式响应解析器
- `getMessages()` - 获取会话消息列表
- `getConversations()` - 获取会话列表
- `loadConversationHistory()` - 加载最近一次对话历史
- `uploadFile()` - 文件上传
- `stopResponse()` - 停止 AI 生成
- `feedbackMessage()` - 消息点赞/点踩
- `getAppFeedbacks()` - 获取应用反馈列表
- `audioToText()` - 语音转文字

### 2. pc/stores/dify.ts
Pinia 状态管理，管理聊天状态和对话数据。

**主要功能：**
- 配置初始化 (`initConfig`)
- 发送消息 (`sendMessage`)
- 停止响应 (`stopCurrentResponse`)
- 消息反馈 (`feedback`)
- 加载历史 (`loadHistory`)
- 新建对话 (`newConversation`)
- 上传文件管理 (`uploadedFiles` Map)

### 3. pc/components/DifyChat/index.vue
聊天组件主文件，包含完整的 UI 和交互逻辑。

**主要功能：**
- 聊天气泡按钮
- 聊天窗口（标题栏、消息区、输入区）
- 消息气泡（用户/助手）
- 文件上传和显示
- 语音输入（麦克风）
- 点赞/点踩/复制/重新生成
- 打字指示器动画
- 图片预览弹窗
- 文件下载（带正确文件名）

### 4. pc/composables/useDifyUser.ts
用户标识管理，确保用户会话一致性。

**主要功能：**
- 生成/获取用户 ID（基于 localStorage）
- 获取系统变量
- 重置用户 ID

### 5. pc/types/dify.ts
完整的 TypeScript 类型定义。

**主要类型：**
- `DifyConfig` - 配置接口
- `DifyMessage` - 消息接口
- `DifyConversation` - 会话接口
- `SendMessageParams` - 发送参数
- `StreamEvent` - 流式事件
- 等等...

---

## 修改文件

### 1. pc/app.vue
- 移除了原有的 Dify embed.min.js 脚本加载逻辑
- 简化为使用 Pinia store 初始化

```diff
- // 移除了大量 embed.min.js 相关代码
+ import { useDifyStore } from './stores/dify'
+ const difyStore = useDifyStore()
+ onMounted(async () => {
+   await appStore.getConfig()
+   await difyStore.initConfig()
+ })
```

### 2. pc/layouts/default.vue
- 添加了 `<ClientOnly>` 包裹的 `<DifyChat />` 组件

```vue
<ClientOnly>
  <DifyChat v-if="difyStore.config.enabled" />
</ClientOnly>
```

---

## 核心功能实现

### 1. 流式响应
使用 `fetch` + `ReadableStream` 读取 SSE 响应，实时更新消息内容。

```typescript
for await (const chunk of parseStream(response)) {
  if (chunk.event === 'message') {
    lastMsg.content += chunk.answer
  }
}
```

### 2. 历史记录加载
兼容 Dify API 返回的消息格式（每条消息同时包含 query 和 answer）：

```typescript
for (const msg of rawMessages) {
  if (msg.query) {
    this.messages.push({ role: 'user', content: msg.query })
  }
  if (msg.answer) {
    this.messages.push({ role: 'assistant', content: msg.answer })
  }
}
```

### 3. 文件上传与下载
- 上传：使用 FormData 发送到 `/v1/files/upload`
- 下载：使用 `as_attachment=true` 参数，Dify 返回正确文件名

```typescript
// 下载时带认证头
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
})
// 从 Content-Disposition 响应头获取文件名
```

### 4. 语音转文字
使用麦克风录制音频，通过 AudioContext 转换为标准 wav 格式后发送给 Dify。

```typescript
// 1. 使用 MediaRecorder 录制 webm 格式
const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })

// 2. 录音结束后转换为 wav 格式
const wavBlob = await convertToWav(webmBlob)

// 3. 发送到 Dify
const text = await audioToText(wavBlob, 'wav')
```

**支持的格式：** mp3, mp4, mpeg, mpga, m4a, wav, webm

### 5. 消息反馈
- 点赞/点踩状态保存到 Dify
- 历史加载时从 `feedback.rating` 恢复状态

### 6. 重新生成
向前搜索最近的 user 消息，删除后续消息后重新发送。

### 7. 停止生成
通过 `task_id` 调用停止接口终止 AI 生成。

---

## UI 布局优化

### 输入区域
- 有文件时采用垂直布局（`.uploaded-file` + `.input-row`）
- 防止发送按钮被挤出视窗
- 新增麦克风按钮（语音输入）
- 录音状态按钮变红闪烁

---

## 数据库配置

需要在 `la_decorate_page` 表中配置 dify：

```json
{
  "enabled": true,
  "token": "app-xxx",
  "baseUrl": "http://localhost:8082",
  "buttonColor": "#1C64F2",
  "windowWidth": "24",
  "windowHeight": "40"
}
```

---

## 已解决的问题

1. **水印问题** - 使用 Service API 而非 embed.js，规避 Dify 水印
2. **历史记录不显示用户消息** - 修复 API 返回格式兼容
3. **文件名称显示错误** - 使用 `filename` 字段，从 Content-Disposition 提取
4. **文件下载 404** - Dify 文件需要 `as_attachment=true` 参数
5. **刷新后反馈状态丢失** - 改为从消息的 `feedback.rating` 读取
6. **重新生成按钮无效** - 修复查找用户消息的逻辑
7. **发送按钮被挤出** - 修复输入区域布局
8. **语音转文字 415 错误** - 使用 AudioContext 将 webm 转换为标准 wav 格式

---

## 待优化项

1. **文件预览** - 文档类型文件暂不支持预览，需下载后查看
2. **停止响应** - 依赖 `task_id`，部分场景可能获取不到
3. **错误处理** - 可增加重试机制

---

## 版本信息

- 更新日期：2026-04-07
- 远程仓库：https://github.com/ainisa20/likeadmin.git
- 分支：master
- 提交数：4 个
