# Dify 集成功能分析文档

## 📋 目录

- [概述](#概述)
- [架构设计](#架构设计)
- [后端实现](#后端实现)
- [前端实现（PC端）](#前端实现pc端)
- [前端实现（移动端）](#前端实现移动端)
- [管理后台](#管理后台)
- [配置说明](#配置说明)
- [功能特性](#功能特性)
- [API 接口](#api-接口)
- [数据流](#数据流)
- [部署指南](#部署指南)

---

## 概述

本项目集成了 Dify AI 聊天机器人功能，为 PC 端和移动端用户提供智能对话服务。Dify 是一个开源的 LLM 应用开发平台，支持构建 AI 对话应用。

### 核心特性

- ✅ **多端支持**：PC 端（Nuxt.js）+ 移动端（UniApp）
- ✅ **实时对话**：基于 SSE 的流式响应
- ✅ **文件上传**：支持图片和文档上传
- ✅ **语音输入**：支持语音转文字（Web Audio API）
- ✅ **Markdown 渲染**：富文本消息显示
- ✅ **思考过程展示**：Workflow 节点输出可视化
- ✅ **消息操作**：点赞、点踩、复制、重新生成
- ✅ **历史记录**：自动保存和恢复对话历史
- ✅ **自定义配置**：UI 颜色、尺寸、欢迎语、推荐提问

---

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户界面层                                │
├──────────────────────────┬──────────────────────────────────────┤
│    PC 端 (Nuxt.js)       │      移动端 (UniApp)                   │
│  - /pc/components/DifyChat│   - /uniapp/src/components/DifyChat   │
├──────────────────────────┴──────────────────────────────────────┤
│                      状态管理 (Pinia)                             │
│                    - stores/dify.ts                             │
├─────────────────────────────────────────────────────────────────┤
│                       API 层                                     │
│                   - api/dify.ts                                 │
├─────────────────────────────────────────────────────────────────┤
│                     后端 API (PHP)                               │
│  - /app/api/logic/PcLogic.php                                    │
│  - /app/api/logic/IndexLogic.php                                 │
│  - /app/adminapi/logic/decorate/DecorateDataLogic.php            │
├─────────────────────────────────────────────────────────────────┤
│                  数据存储 (MySQL)                                │
│         decorate_page 表 (meta 字段 - JSON)                     │
├─────────────────────────────────────────────────────────────────┤
│                   Dify 服务端                                    │
│              - Dify API Server                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 后端实现

### 1. 数据库设计

#### 表结构：`decorate_page`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 页面 ID（PC 端为 4） |
| type | int | 页面类型 |
| name | varchar | 页面名称 |
| data | text | 页面装修数据 |
| **meta** | text | **Dify 配置存储（JSON 格式）** |
| update_time | timestamp | 更新时间 |

#### meta 字段 JSON 结构

```json
{
  "dify_config": {
    "enabled": true,
    "token": "app-xxxxxxxxxxxxx",
    "baseUrl": "https://api.dify.ai",
    "buttonColor": "#1C64F2",
    "windowWidth": "24",
    "windowHeight": "40",
    "welcomeEnabled": true,
    "welcomeText": "您好！我是智能助手，有什么可以帮助您的吗？",
    "suggestionsEnabled": true,
    "suggestions": [
      "如何使用这个系统？",
      "支持哪些功能？",
      "联系客服"
    ]
  },
  "theme_config": {
    "mode": "preset",
    "presetId": 1,
    "primaryColor": "#4153ff",
    "minorColor": "#7583ff",
    ...
  }
}
```

### 2. 核心代码文件

#### 2.1 配置读取

**文件：** `/server/app/api/logic/PcLogic.php`

```php
/**
 * @notes 获取 Dify 聊天机器人配置
 * @return array
 * @author raeazL
 * @date 2026/04/04
 */
private static function getDifyConfig(): array
{
    $defaultConfig = [
        'enabled' => false,
        'token' => '',
        'baseUrl' => 'http://localhost',
        'buttonColor' => '#1C64F2',
        'windowWidth' => '24',
        'windowHeight' => '40',
    ];

    try {
        // 获取 PC 页面装修数据
        $pcPage = \app\common\model\decorate\DecoratePage::findOrEmpty(4);

        if ($pcPage->isEmpty() || empty($pcPage->meta)) {
            return $defaultConfig;
        }

        $meta = json_decode($pcPage->meta, true);
        if (isset($meta['dify_config']) && is_array($meta['dify_config'])) {
            $config = array_merge($defaultConfig, $meta['dify_config']);
            // 确保 enabled 是布尔值
            $config['enabled'] = isset($meta['dify_config']['enabled']) &&
                                 ($meta['dify_config']['enabled'] === true ||
                                  $meta['dify_config']['enabled'] === 'true' ||
                                  $meta['dify_config']['enabled'] === '1' ||
                                  $meta['dify_config']['enabled'] === 1);
            return $config;
        }

        return $defaultConfig;
    } catch (\Exception $e) {
        // 出错时返回默认配置
        return $defaultConfig;
    }
}
```

**在 getConfigData() 中使用：**

```php
public static function getConfigData()
{
    // ... 其他配置 ...

    return [
        // ... 其他配置 ...
        'dify' => self::getDifyConfig(),
        'theme_config' => self::getThemeConfig(),
        'page_schema_version' => self::getPageSchemaVersion(),
    ];
}
```

#### 2.2 配置保存

**文件：** `/server/app/adminapi/logic/decorate/DecorateDataLogic.php`

```php
/**
 * @notes 保存配置（Dify配置 + 主题配置）
 * @param $params
 * @return bool
 * @author raeazL
 * @date 2026/04/04
 */
public static function saveDifyConfig($params): bool
{
    $pcPage = DecoratePage::findOrEmpty(4);
    if ($pcPage->isEmpty()) {
        self::$error = 'PC端装修配置不存在';
        return false;
    }

    // 获取现有的 meta 配置
    $meta = [];
    if (!empty($pcPage->meta)) {
        $meta = json_decode($pcPage->meta, true);
    }

    // 保存 Dify 配置
    if (isset($params['dify_config'])) {
        $difyParams = $params['dify_config'];
        $difyConfig = [
            'enabled' => isset($difyParams['enabled']) && ($difyParams['enabled'] === true || $difyParams['enabled'] === 'true' || $difyParams['enabled'] === 1 || $difyParams['enabled'] === '1'),
            'token' => $difyParams['token'] ?? '',
            'baseUrl' => $difyParams['baseUrl'] ?? 'http://localhost',
            'buttonColor' => $difyParams['buttonColor'] ?? '#1C64F2',
            'windowWidth' => $difyParams['windowWidth'] ?? '24',
            'windowHeight' => $difyParams['windowHeight'] ?? '40',
            'welcomeEnabled' => isset($difyParams['welcomeEnabled']) && ($difyParams['welcomeEnabled'] === true || $difyParams['welcomeEnabled'] === 'true' || $difyParams['welcomeEnabled'] === 1 || $difyParams['welcomeEnabled'] === '1'),
            'welcomeText' => $difyParams['welcomeText'] ?? '',
            'suggestionsEnabled' => isset($difyParams['suggestionsEnabled']) && ($difyParams['suggestionsEnabled'] === true || $difyParams['suggestionsEnabled'] === 'true' || $difyParams['suggestionsEnabled'] === 1 || $difyParams['suggestionsEnabled'] === '1'),
            'suggestions' => $difyParams['suggestions'] ?? [],
        ];

        // 验证建议提问
        if (!is_array($difyConfig['suggestions'])) {
            self::$error = '推荐提问必须是数组';
            return false;
        }

        // 确保建议提问数量在 3-5 个
        if (count($difyConfig['suggestions']) < 3) {
            self::$error = '推荐提问至少需要 3 个';
            return false;
        }

        if (count($difyConfig['suggestions']) > 5) {
            self::$error = '推荐提问最多只能有 5 个';
            return false;
        }

        // 验证每个建议提问的长度
        foreach ($difyConfig['suggestions'] as $suggestion) {
            if (mb_strlen($suggestion) > 50) {
                self::$error = '每个推荐提问最多 50 个字符';
                return false;
            }
        }

        // 过滤空建议提问
        $difyConfig['suggestions'] = array_values(array_filter($difyConfig['suggestions'], function($item) {
            return trim($item) !== '';
        }));

        // 重新确保至少有3个
        while (count($difyConfig['suggestions']) < 3) {
            $difyConfig['suggestions'][] = '';
        }

        $meta['dify_config'] = $difyConfig;
    }

    // 保存主题配置
    if (isset($params['theme_config'])) {
        $themeParams = $params['theme_config'];
        $meta['theme_config'] = [
            'mode' => $themeParams['mode'] ?? 'preset',
            'presetId' => $themeParams['presetId'] ?? 1,
            'primaryColor' => $themeParams['primaryColor'] ?? '#4153ff',
            'minorColor' => $themeParams['minorColor'] ?? '#7583ff',
            'pageBgColor' => $themeParams['pageBgColor'] ?? '#f7f7f7',
            'headerBgColor' => $themeParams['headerBgColor'] ?? '#4153ff',
            'headerTextColor' => $themeParams['headerTextColor'] ?? 'white',
            'borderRadius' => $themeParams['borderRadius'] ?? 8,
            'footerStyle' => $themeParams['footerStyle'] ?? 'gray',
        ];
    }

    // 保存到数据库
    $pcPage->meta = json_encode($meta, JSON_UNESCAPED_UNICODE);
    $pcPage->save();

    return true;
}
```

#### 2.3 API 控制器

**文件：** `/server/app/adminapi/controller/decorate/DataController.php`

```php
/**
 * @notes 保存 Dify 配置
 * @return Json
 * @author raeazL
 * @date 2026/04/04
 */
public function saveDifyConfig(): Json
{
    $params = $this->request->post();
    $result = DecorateDataLogic::saveDifyConfig($params);
    if (false === $result) {
        return $this->fail(DecorateDataLogic::getError());
    }
    return $this->success('保存成功', [], 1, 1);
}
```

### 3. API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/pc/config` | 获取 PC 端配置（包含 Dify 配置） |
| GET | `/api/index/config` | 获取移动端配置（包含 Dify 配置） |
| POST | `/adminapi/decorate/data/saveDifyConfig` | 保存 Dify 配置 |

---

## 前端实现（PC端）

### 1. 组件结构

**主组件：** `/pc/components/DifyChat/index.vue`

```
DifyChat/
├── index.vue (1729 行)
│   ├── template (聊天界面)
│   ├── script (业务逻辑)
│   └── style (样式)
```

### 2. 核心功能实现

#### 2.1 状态管理 (Pinia)

**文件：** `/pc/stores/dify.ts`

```typescript
import { defineStore } from 'pinia'
import type { DifyConfig, DifyMessage } from '@/types/dify'

interface DifyState {
  config: DifyConfig
  currentConversationId: string | null
  messages: DifyMessage[]
  isTyping: boolean
  error: string | null
  currentTaskId: string | null
  uploadedFiles: Map<string, any>
  ttsAudioChunks: string[]
  ttsIsPlaying: boolean
  workflowNodes: Map<string, any>
  currentWorkflowRunId: string | null
}

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
    // ... 其他状态
  }),

  getters: {
    isConfigured: (state) => state.config.enabled && !!state.config.token,
    canChat: (state) => state.isConfigured && !state.isTyping
  },

  actions: {
    async initConfig() { /* ... */ },
    async sendMessage(query: string, files?: any[]) { /* ... */ },
    async feedback(messageId: string, rating: 'like' | 'dislike' | null) { /* ... */ },
    newConversation() { /* ... */ },
    async stopCurrentResponse() { /* ... */ }
  }
})
```

#### 2.2 API 调用

**文件：** `/pc/api/dify.ts`

```typescript
// 发送消息（流式）
export function sendMessage(params: SendMessageParams) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')

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
  }).then(response => response.body)
}

// 解析流式响应
export async function* parseStream(body: any): AsyncGenerator<any> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim()
        if (jsonStr && jsonStr !== '[DONE]') {
          try {
            yield JSON.parse(jsonStr)
          } catch (e) {
            console.error('[Stream] Parse error:', e)
          }
        }
      }
    }
  }
}

// 上传文件
export function uploadFile(file: File) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', getUserId())

  return fetch(`${difyApiUrl}/v1/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.token}`
    },
    body: formData
  }).then(response => response.json())
}

// 语音转文字
export async function audioToText(audioBlob: Blob, extension = 'webm'): Promise<string> {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')

  const fileName = `recording.${extension}`
  const formData = new FormData()
  formData.append('file', audioBlob, fileName)
  formData.append('user', getUserId())

  const response = await fetch(`${difyApiUrl}/v1/audio-to-text`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${config.token}`
    }
  })

  const result = await response.json()
  return result.text
}
```

#### 2.3 用户标识

**文件：** `/pc/composables/useDifyUser.ts`

```typescript
import { ref } from 'vue'

export function useDifyUser() {
  const storageKey = 'dify_user_id'
  const userId = ref<string>('')

  const getUserId = (): string => {
    if (!userId.value) {
      let id = sessionStorage.getItem(storageKey)
      if (!id) {
        id = generateUserId()
        sessionStorage.setItem(storageKey, id)
      }
      userId.value = id
    }
    return userId.value
  }

  const generateUserId = (): string => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  return {
    getUserId,
    userId
  }
}
```

#### 2.4 类型定义

**文件：** `/pc/types/dify.ts`

```typescript
/**
 * Dify 配置接口
 */
export interface DifyConfig {
  enabled: boolean
  token: string
  baseUrl: string
  buttonColor: string
  windowWidth: string
  windowHeight: string
  welcomeEnabled?: boolean
  welcomeText?: string
  suggestionsEnabled?: boolean
  suggestions?: string[]
}

/**
 * 聊天消息接口
 */
export interface DifyMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  status?: 'sending' | 'sent' | 'error'
  nodeOutputs?: {
    [nodeId: string]: {
      title: string
      node_type: string
      status: string
      outputs?: any
      inputs?: any
      elapsedTime?: number
    }
  }
}

/**
 * 流式响应事件类型
 */
export type StreamEventType =
  | 'message'
  | 'message_end'
  | 'message_file'
  | 'message_replace'
  | 'tts_message'
  | 'tts_message_end'
  | 'error'
  | 'workflow_started'
  | 'workflow_finished'
  | 'node_started'
  | 'node_finished'
  | 'ping'

/**
 * 流式响应事件接口
 */
export interface StreamEvent {
  event: StreamEventType
  answer?: string
  conversation_id?: string
  message_id?: string
  task_id?: string
  message?: string
  // ... 其他字段
}
```

### 3. 组件功能详解

#### 3.1 聊天界面

**主要元素：**

1. **聊天气泡按钮** - 固定在右下角，可自定义颜色
2. **聊天窗口** - 可自定义尺寸（宽 x 高）
3. **消息列表** - 支持滚动、自动滚动到底部
4. **输入区域** - 支持文本、文件、语音输入
5. **消息操作** - 点赞、点踩、复制、重新生成

#### 3.2 消息类型

1. **用户消息**
   - 文本内容
   - 文件附件（图片/文档）

2. **助手消息**
   - Markdown 富文本
   - 思考过程（Workflow 节点）
   - 消息操作按钮

3. **系统消息**
   - 欢迎语
   - 推荐提问

#### 3.3 特色功能

##### 3.3.1 Markdown 渲染

使用 `marked` 库解析 Markdown：

```typescript
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

const parseMarkdown = (content: string) => {
  if (!content) return ''

  // 移除 ```markdown 包装
  let processedContent = content
  const markdownCodeBlockRegex = /```markdown\s*\n?([\s\S]*?)\n?```/i
  const match = content.match(markdownCodeBlockRegex)

  if (match && match[1]) {
    processedContent = match[1].trim()
  }

  return marked.parse(processedContent)
}
```

##### 3.3.2 思考过程展示

展示 Workflow 节点输出：

```vue
<div v-if="msg.nodeOutputs && Object.keys(msg.nodeOutputs).length > 0"
     class="thinking-process">
  <div class="thinking-header" @click="toggleThinking(msg)">
    <span class="thinking-icon">🤔</span>
    <span class="thinking-title">思考过程</span>
    <span class="thinking-count">
      ({{ Object.keys(msg.nodeOutputs).length }}个节点)
    </span>
  </div>
  <div v-if="msg.thinkingExpanded" class="thinking-content">
    <div v-for="(output, nodeId) in msg.nodeOutputs"
         :key="nodeId"
         class="node-output-item">
      <div class="node-output-header">
        <span class="node-output-status" :class="output.status">
          {{ output.status === 'succeeded' ? '✅' : '❌' }}
          {{ output.elapsedTime ? `${output.elapsedTime.toFixed(2)}s` : '' }}
        </span>
      </div>
      <div v-if="output.outputs" class="node-output-body">
        <pre>{{ formatNodeOutput(output.outputs) }}</pre>
      </div>
    </div>
  </div>
</div>
```

##### 3.3.3 语音输入

使用 Web Audio API 录制音频：

```typescript
const startRecording = async () => {
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    let mimeType = 'audio/webm'
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus'
    }

    mediaRecorder = new MediaRecorder(recordingStream, { mimeType })
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      const webmBlob = new Blob(audioChunks, { type: mimeType })
      const wavBlob = await convertToWav(webmBlob)

      const { audioToText } = await import('@/api/dify')
      const text = await audioToText(wavBlob, 'wav')

      if (text) {
        inputQuery.value += (inputQuery.value ? ' ' : '') + text
      }
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (error) {
    ElMessage.error(`无法访问麦克风: ${error.message}`)
  }
}
```

##### 3.3.4 文件上传

支持图片和文档上传：

```typescript
const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const { uploadFile } = await import('@/api/dify')
    const result = await uploadFile(file)

    const fileType = file.type.startsWith('image/') ? 'image' : 'document'

    uploadedFile.value = {
      id: result.id,
      type: fileType,
      url: result.fullUrl || result.source_url,
      name: file.name
    }
  } catch (error: any) {
    ElMessage.error(`上传失败: ${error.message}`)
  }
}
```

---

## 前端实现（移动端）

### 组件结构

**主组件：** `/uniapp/src/components/DifyChat/index.vue`

移动端实现与 PC 端基本一致，主要区别：

1. **UI 适配** - 使用 UniApp 组件（view、text 等）
2. **响应式单位** - 使用 rpx（responsive pixel）
3. **全屏模式** - 聊天窗口占满整个屏幕
4. **安全区域** - 适配刘海屏和底部指示器

### 核心代码片段

```vue
<template>
  <view class="dify-chat-wrapper">
    <!-- 聊天按钮 -->
    <view
      v-if="difyStore.config.enabled"
      class="chat-bubble-btn"
      :style="{ backgroundColor: difyStore.config.buttonColor }"
      @click="toggleChat"
    >
      <svg>...</svg>
    </view>

    <!-- 聊天窗口 -->
    <view class="chat-window" v-if="isOpen">
      <scroll-view class="chat-messages" scroll-y>
        <!-- 消息列表 -->
      </scroll-view>

      <view class="chat-input-area">
        <textarea v-model="inputQuery" />
        <view @click="sendMessage">发送</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useDifyStore } from '@/stores/dify'
import { marked } from 'marked'

const difyStore = useDifyStore()

// 功能与 PC 端一致
// ...
</script>

<style lang="scss" scoped>
// 使用 rpx 单位适配移动端
.chat-bubble-btn {
  width: 100rpx;
  height: 100rpx;
  // ...
}
</style>
```

---

## 管理后台

### 配置界面

**文件：** `/admin/src/views/decoration/pc.vue`

管理后台提供可视化的 Dify 配置界面，包括：

#### 1. 基础配置

```vue
<el-form-item label="启用状态">
  <el-switch v-model="difyConfig.enabled" />
</el-form-item>

<el-form-item label="API Token">
  <el-input v-model="difyConfig.token" placeholder="请输入 Dify API Token" />
</el-form-item>

<el-form-item label="API 地址">
  <el-input v-model="difyConfig.baseUrl" placeholder="https://api.dify.ai" />
</el-form-item>
```

#### 2. UI 配置

```vue
<el-form-item label="按钮颜色">
  <el-color-picker v-model="difyConfig.buttonColor" />
</el-form-item>

<el-form-item label="窗口宽度">
  <el-input-number v-model="difyConfig.windowWidth" :min="20" :max="40" />
  <span class="ml-2">rem</span>
</el-form-item>

<el-form-item label="窗口高度">
  <el-input-number v-model="difyConfig.windowHeight" :min="30" :max="60" />
  <span class="ml-2">rem</span>
</el-form-item>
```

#### 3. 欢迎语配置

```vue
<el-form-item label="启用欢迎语">
  <el-switch v-model="difyConfig.welcomeEnabled" />
</el-form-item>

<el-form-item label="欢迎内容" v-if="difyConfig.welcomeEnabled">
  <el-input
    v-model="difyConfig.welcomeText"
    type="textarea"
    :rows="3"
    placeholder="请输入欢迎语内容"
  />
</el-form-item>
```

#### 4. 推荐提问配置

```vue
<el-form-item label="启用推荐提问">
  <el-switch v-model="difyConfig.suggestionsEnabled" />
</el-form-item>

<el-form-item label="推荐提问" v-if="difyConfig.suggestionsEnabled">
  <div v-for="(item, index) in difyConfig.suggestions" :key="index" class="mb-2">
    <el-input
      v-model="difyConfig.suggestions[index]"
      :placeholder="`推荐提问 ${index + 1}`"
      :maxlength="50"
      show-word-limit
    />
  </div>
  <el-alert type="info" :closable="false">
    请输入 3-5 个推荐提问，每个不超过 50 个字符
  </el-alert>
</el-form-item>
```

---

## 配置说明

### 完整配置示例

```json
{
  "dify_config": {
    "enabled": true,
    "token": "app-xxxxxxxxxxxxxxxxxxxxxxxx",
    "baseUrl": "https://api.dify.ai",
    "buttonColor": "#1C64F2",
    "windowWidth": "24",
    "windowHeight": "40",
    "welcomeEnabled": true,
    "welcomeText": "您好！我是智能助手，有什么可以帮助您的吗？",
    "suggestionsEnabled": true,
    "suggestions": [
      "如何使用这个系统？",
      "支持哪些功能？",
      "联系客服",
      "产品介绍",
      "价格咨询"
    ]
  }
}
```

### 配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| enabled | boolean | false | 是否启用聊天功能 |
| token | string | "" | Dify API Token（从 Dify 控制台获取） |
| baseUrl | string | "http://localhost" | Dify API 地址 |
| buttonColor | string | "#1C64F2" | 聊天按钮颜色（十六进制） |
| windowWidth | string | "24" | 聊天窗口宽度（rem单位，范围 20-40） |
| windowHeight | string | "40" | 聊天窗口高度（rem单位，范围 30-60） |
| welcomeEnabled | boolean | false | 是否启用欢迎语 |
| welcomeText | string | "" | 欢迎语内容 |
| suggestionsEnabled | boolean | false | 是否启用推荐提问 |
| suggestions | string[] | [] | 推荐提问列表（3-5个，每个≤50字符） |

---

## 功能特性

### 1. 核心功能

#### 1.1 实时对话

- 基于 Server-Sent Events (SSE) 的流式响应
- 支持打字效果（逐字显示）
- 可随时停止生成

#### 1.2 多模态输入

- **文本输入** - 基础对话方式
- **文件上传** - 支持图片和文档
- **语音输入** - 语音转文字（Web Audio API）

#### 1.3 消息操作

- **点赞/点踩** - 反馈 AI 回复质量
- **复制内容** - 一键复制消息
- **重新生成** - 重新生成上一条回复
- **新建对话** - 清空历史开始新对话

### 2. 高级功能

#### 2.1 Markdown 渲染

支持完整的 Markdown 语法：

- 标题、段落、列表
- 代码块（语法高亮）
- 引用块
- 表格
- 链接、图片
- 水平线

#### 2.2 思考过程展示

展示 Workflow 节点输出：

- 节点状态（成功/失败）
- 执行时间
- 输入/输出数据
- 可折叠展开

#### 2.3 历史记录

- 自动保存对话历史
- 页面刷新后恢复
- 基于 sessionStorage

#### 2.4 文件处理

- 图片上传和预览
- 文档上传和下载
- 支持多种格式（图片、PDF、Office、文本）

### 3. UI/UX 特性

#### 3.1 响应式设计

- PC 端：固定位置浮动窗口
- 移动端：全屏底部抽屉

#### 3.2 自定义样式

- 按钮颜色
- 窗口尺寸
- 主题适配

#### 3.3 交互细节

- 平滑动画
- 加载状态
- 错误提示
- 成功反馈

---

## API 接口

### Dify API 端点

前端直接调用 Dify API（不经过后端）：

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/v1/chat-messages` | 发送消息（流式） |
| POST | `/v1/chat-messages/{task_id}/stop` | 停止生成 |
| POST | `/v1/messages/{id}/feedbacks` | 消息反馈 |
| GET | `/v1/conversations` | 获取对话列表 |
| GET | `/v1/messages` | 获取消息历史 |
| POST | `/v1/files/upload` | 上传文件 |
| GET | `/v1/files/{id}/preview` | 预览文件 |
| POST | `/v1/audio-to-text` | 语音转文字 |

### 请求示例

#### 发送消息

```typescript
POST /v1/chat-messages
Authorization: Bearer app-xxxxxxxxxxxxx
Content-Type: application/json

{
  "query": "你好",
  "response_mode": "streaming",
  "user": "user_1234567890_abc123",
  "conversation_id": "uuid-xxxx-xxxx-xxxx",
  "inputs": {},
  "files": [
    {
      "type": "image",
      "transfer_method": "local_file",
      "upload_file_id": "file-xxxx-xxxx"
    }
  ]
}
```

#### 流式响应

```
data: {"event": "message", "answer": "你好"}
data: {"event": "message", "answer": "！"}
data: {"event": "message_end", "conversation_id": "uuid-xxxx", "message_id": "msg-xxxx"}
data: [DONE]
```

---

## 数据流

### 1. 初始化流程

```
用户访问页面
    ↓
调用 /api/pc/config
    ↓
获取 Dify 配置
    ↓
初始化 Pinia Store
    ↓
加载历史对话（可选）
    ↓
渲染聊天组件
```

### 2. 发送消息流程

```
用户输入消息
    ↓
调用 sendMessage()
    ↓
POST /v1/chat-messages
    ↓
解析流式响应 (parseStream)
    ↓
更新消息列表
    ↓
自动滚动到底部
```

### 3. 文件上传流程

```
用户选择文件
    ↓
调用 uploadFile()
    ↓
POST /v1/files/upload
    ↓
获取 file_id
    ↓
附加到消息中发送
```

### 4. 语音输入流程

```
用户点击录音
    ↓
调用 MediaRecorder
    ↓
录制音频
    ↓
转换为 WAV 格式
    ↓
调用 audioToText()
    ↓
POST /v1/audio-to-text
    ↓
获取识别文本
    ↓
填充到输入框
```

---

## 部署指南

### 1. Dify 服务端部署

#### 1.1 使用 Docker Compose（推荐）

```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
docker compose up -d
```

#### 1.2 获取 API Token

1. 登录 Dify 控制台
2. 创建应用
3. 进入"访问 API"页面
4. 复制 API Token

### 2. 本项目配置

#### 2.1 后端配置

通过管理后台配置：

1. 登录管理后台
2. 进入"PC端页面装修"
3. 配置 Dify 参数
4. 保存配置

或直接修改数据库：

```sql
UPDATE decorate_page
SET meta = JSON_SET(
  meta,
  '$.dify_config',
  JSON_OBJECT(
    'enabled', true,
    'token', 'app-xxxxxxxxxxxxx',
    'baseUrl', 'https://api.dify.ai',
    'buttonColor', '#1C64F2',
    'windowWidth', '24',
    'windowHeight', '40',
    'welcomeEnabled', true,
    'welcomeText', '您好！',
    'suggestionsEnabled', true,
    'suggestions', JSON_ARRAY('问题1', '问题2', '问题3')
  )
)
WHERE id = 4;
```

#### 2.2 前端配置

前端会自动从后端获取配置，无需额外配置。

### 3. 环境变量

可选：在 `.env` 文件中配置：

```env
# Dify 配置（可选，优先级低于数据库配置）
VITE_DIFY_ENABLED=true
VITE_DIFY_TOKEN=app-xxxxxxxxxxxxx
VITE_DIFY_BASE_URL=https://api.dify.ai
```

### 4. 注意事项

1. **CORS 配置** - 确保 Dify API 允许跨域请求
2. **HTTPS** - 生产环境建议使用 HTTPS
3. **Token 安全** - 不要在前端硬编码 Token
4. **用户标识** - 确保每个用户有唯一的 user_id

---

## 常见问题

### Q1: 聊天窗口不显示？

**A:** 检查以下几点：

1. 配置中 `enabled` 是否为 `true`
2. `token` 和 `baseUrl` 是否正确
3. 浏览器控制台是否有错误

### Q2: 消息发送失败？

**A:** 检查：

1. Dify 服务是否正常运行
2. API Token 是否有效
3. 网络连接是否正常
4. CORS 是否配置正确

### Q3: 文件上传失败？

**A:** 检查：

1. 文件大小是否超限
2. 文件格式是否支持
3. Dify 服务端是否启用了文件上传功能

### Q4: 语音输入不工作？

**A:** 检查：

1. 浏览器是否支持 Web Audio API
2. 是否授予了麦克风权限
3. HTTPS 环境下才能使用（本地 localhost 除外）

### Q5: 移动端样式错乱？

**A:** 检查：

1. 是否使用了正确的单位（rpx）
2. 是否适配了安全区域
3. 是否测试了不同设备

---

## 技术栈

### 后端

- **语言**: PHP 8.0+
- **框架**: ThinkPHP 8.0
- **数据库**: MySQL 5.7+

### PC 前端

- **框架**: Nuxt.js 3
- **语言**: TypeScript 5
- **状态管理**: Pinia
- **Markdown**: marked
- **构建工具**: Vite 5

### 移动端

- **框架**: UniApp
- **语言**: TypeScript
- **状态管理**: Pinia
- **Markdown**: marked

### 管理后台

- **框架**: Vue 3
- **语言**: TypeScript
- **UI 组件**: Element Plus
- **构建工具**: Vite 5

---

## 参考资料

### Dify 官方文档

- [Dify 官网](https://dify.ai)
- [Dify GitHub](https://github.com/langgenius/dify)
- [Dify API 文档](https://docs.dify.ai/guides/application-publishing/publish-app)

### 相关技术文档

- [Nuxt.js 文档](https://nuxt.com)
- [UniApp 文档](https://uniapp.dcloud.net.cn)
- [ThinkPHP 文档](https://www.thinkphp.cn)
- [Pinia 文档](https://pinia.vuejs.org)

---

## 更新日志

### v1.0.0 (2026-04-04)

- ✅ 初始版本
- ✅ PC 端和移动端集成
- ✅ 支持流式对话
- ✅ 支持文件上传
- ✅ 支持语音输入
- ✅ 支持思考过程展示
- ✅ 支持历史记录
- ✅ 支持自定义配置

---

## 维护者

- **raeazL** - 核心开发

## 许可证

本项目遵循 MIT 许可证。

---

**文档生成时间**: 2026-04-04
**文档版本**: v1.0.0
