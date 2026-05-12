<template>
  <view class="dify-chat-wrapper">
    <!-- 聊天按钮 -->
    <view
      v-if="difyStore.config.enabled"
      class="chat-bubble-btn"
      :style="{ backgroundColor: difyStore.config.buttonColor || '#3b82f6' }"
      :class="{ 'is-open': isOpen }"
      @click="toggleChat"
    >
      <!-- 关闭状态：聊天气泡图标 -->
      <view v-if="!isOpen" class="bubble-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
          <path d="M7 9H17V11H7V9Z" fill="white"/>
          <path d="M7 12H14V14H7V12Z" fill="white"/>
        </svg>
      </view>
      <!-- 打开状态：关闭图标 -->
      <view v-else class="bubble-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </view>
    </view>

    <!-- 聊天窗口 -->
    <view class="chat-window" :class="{ 'is-open': isOpen }" v-if="isOpen">
      <!-- 标题栏 -->
      <view class="chat-header">
        <text class="header-title">智能助手</text>
        <view class="header-actions">
          <view
            v-if="difyStore.messages.length > 0"
            class="header-btn new-chat-btn"
            @click="newConversation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <text class="btn-label">新对话</text>
          </view>
          <view
            v-if="difyStore.isTyping"
            class="header-btn stop-btn"
            @click="stopResponse"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
            <text class="btn-label">停止</text>
          </view>
          <view class="header-btn close-btn" @click="toggleChat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <scroll-view
        class="chat-messages"
        scroll-y
        :scroll-into-view="scrollToView"
        :scroll-with-animation="true"
        :enhanced="true"
        :show-scrollbar="false"
      >
        <!-- 对话开场白 -->
        <view v-if="difyStore.config.welcomeEnabled && difyStore.config.welcomeText" class="chat-welcome">
          <view class="welcome-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3b82f6"/>
              <circle cx="9" cy="10" r="1.5" fill="#3b82f6"/>
              <circle cx="15" cy="10" r="1.5" fill="#3b82f6"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
            </svg>
          </view>
          <view class="welcome-content">{{ difyStore.config.welcomeText }}</view>
        </view>

        <!-- 推荐提问 -->
        <view v-if="difyStore.config.suggestionsEnabled && difyStore.config.suggestions && difyStore.config.suggestions.length > 0" class="chat-suggestions">
          <view
            v-for="(suggestion, index) in difyStore.config.suggestions"
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </view>
        </view>

        <!-- 消息列表 -->
        <view
          v-for="(msg, index) in difyStore.messages"
          :key="msg.id"
          :id="`msg-${index}`"
          class="message"
          :class="msg.role"
        >
          <!-- 头像 -->
          <view class="message-avatar">
            <view v-if="msg.role === 'assistant'" class="avatar bot">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3b82f6"/>
                <circle cx="9" cy="10" r="1.5" fill="#3b82f6"/>
                <circle cx="15" cy="10" r="1.5" fill="#3b82f6"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
              </svg>
            </view>
            <view v-else class="avatar user">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#374151"/>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="#374151"/>
              </svg>
            </view>
          </view>

          <!-- 消息体 -->
          <view class="message-body">
            <!-- 文件附件 -->
            <view v-if="(msg as any).files && (msg as any).files.length" class="message-files">
              <view
                v-for="file in (msg as any).files"
                :key="file.id"
                class="file-attachment"
              >
                <view v-if="file.type === 'image'" class="file-image">
                  <image
                    v-if="!(file as any).needsAuth"
                    :src="file.url"
                    mode="aspectFill"
                    class="file-image-preview"
                  />
                  <view v-else class="file-icon-placeholder">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <path d="M17 8l-5-5-5 5"/>
                      <circle cx="12" cy="3" r="1"/>
                    </svg>
                  </view>
                </view>
                <view v-else class="file-document">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                  <text class="file-name">{{ file.name || '文档' }}</text>
                </view>
              </view>
            </view>

            <!-- 消息内容 - 支持 Markdown 渲染 -->
            <view v-if="msg.content" class="message-content markdown-body">
              <rich-text :nodes="parseMarkdown(msg.content)"></rich-text>
            </view>

            <!-- 内容替换标识 -->
            <view v-if="(msg as any).isReplaced" class="content-replaced-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <text class="badge-text">内容已替换</text>
              <view
                class="view-original-btn"
                :class="{ active: (msg as any).showOriginal }"
                @click="toggleOriginalContent(msg)"
              >
                {{ (msg as any).showOriginal ? '隐藏' : '查看原始' }}
              </view>
            </view>

            <!-- 原始内容 -->
            <view v-if="(msg as any).isReplaced && (msg as any).showOriginal && (msg as any).originalContent" class="original-content">
              <text class="original-content-header">原始内容（已被替换）：</text>
              <text class="original-content-text">{{ (msg as any).originalContent }}</text>
            </view>

            <!-- 消息操作 -->
            <view v-if="msg.role === 'assistant' && msg.content" class="message-actions">
              <view
                v-if="difyStore.ttsIsPlaying"
                class="action-btn tts-indicator"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </view>
              <view
                class="action-btn"
                :class="{ active: (msg as any).rating === 'like' }"
                @click="feedback(msg, 'like')"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
              </view>
              <view
                class="action-btn"
                :class="{ active: (msg as any).rating === 'dislike' }"
                @click="feedback(msg, 'dislike')"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                </svg>
              </view>
              <view class="action-btn" @click="copyMessage(msg.content)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </view>
              <view class="action-btn" @click="regenerate(msg)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </view>
            </view>
          </view>
        </view>

        <!-- 打字中指示器 -->
        <view v-if="difyStore.isTyping" class="message assistant typing">
          <view class="message-avatar">
            <view class="avatar bot">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3b82f6"/>
                <circle cx="9" cy="10" r="1.5" fill="#3b82f6"/>
                <circle cx="15" cy="10" r="1.5" fill="#3b82f6"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
              </svg>
            </view>
          </view>
          <view class="message-body">
            <view class="typing-indicator">
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
              <view class="typing-dot"></view>
            </view>
          </view>
        </view>

        <!-- 底部留白 -->
        <view class="messages-bottom-spacer"></view>
      </scroll-view>

      <!-- 输入区域 -->
      <view class="chat-input-area">
        <!-- 上传的文件显示 -->
        <view v-if="uploadedFile" class="uploaded-file">
          <view class="file-preview-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
          </view>
          <text class="uploaded-file-name">{{ uploadedFile.name || '文件已选择' }}</text>
          <view class="remove-file-btn" @click="removeFile">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </view>
        </view>

        <!-- 输入行 -->
        <view class="input-row">
          <view class="input-wrapper">
            <textarea
              v-model="inputQuery"
              class="chat-textarea"
              placeholder="输入消息..."
              :disabled="difyStore.isTyping"
              @confirm="sendMessage"
              :auto-height="true"
              :maxlength="-1"
            />
            <view class="input-actions">
              <!-- #ifdef H5 -->
              <input
                ref="fileInputRef"
                type="file"
                v-show="false"
                @change="handleFileUpload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <view
                v-if="!difyStore.isTyping && !isRecording && !isTranscribing && !uploadedFile"
                class="input-icon-btn"
                @click="triggerFileUpload"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </view>
              <view
                v-if="!difyStore.isTyping"
                class="input-icon-btn"
                :class="{ recording: isRecording || isTranscribing }"
                @click="toggleRecording"
              >
                <svg v-if="!isRecording && !isTranscribing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <view v-else class="recording-stop-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </view>
              </view>
              <view v-if="isTranscribing" class="transcribing-hint">
                <view class="transcribing-dot"></view>
                <text class="transcribing-text">识别中</text>
              </view>
              <!-- #endif -->
            </view>
          </view>
          <!-- 发送按钮 -->
          <view
            class="send-btn"
            :class="{ disabled: !canSend }"
            @click="sendMessage"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </view>
        </view>
      </view>

      <!-- 错误信息 -->
      <view v-if="difyStore.error" class="error-message">
        {{ difyStore.error }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// #ifdef H5
import { ref, computed, onMounted, nextTick } from 'vue'
import { useDifyStore } from '@/stores/dify'
import { useDifyUser } from '@/composables/useDifyUser'
import type { DifyMessage } from '@/types/dify'
import { marked } from 'marked'

const props = defineProps({
  content: {
    type: Object,
    required: true
  }
})

const difyStore = useDifyStore()
const { getUserId } = useDifyUser()

// 配置现在统一从 /index/config 接口加载，不再从装修数据读取
// 兼容性提示：如果装修数据中有配置，会在 app store 中自动同步

const isOpen = ref(false)
const inputQuery = ref('')
const scrollToView = ref('')
const isRecording = ref(false)
const isTranscribing = ref(false)
const uploadedFile = ref<{ id: string, type: string, url: string, name: string } | null>(null)
const fileInputRef = ref<HTMLInputElement>()

const canSend = computed(() => {
  return (inputQuery.value.trim() || uploadedFile.value) && !difyStore.isTyping && !isTranscribing.value
})

// 配置 marked 选项
marked.setOptions({
  breaks: true, // 支持 GFM 换行
  gfm: true, // 启用 GitHub Flavored Markdown
  headerIds: false,
  mangle: false
})

// 解析 markdown 内容为 HTML
const parseMarkdown = (content: string) => {
  if (!content) return ''

  try {
    // 移除可能的markdown代码块包装（```markdown ... ```）
    let processedContent = content
    const markdownCodeBlockRegex = /```markdown\s*\n?([\s\S]*?)\n?```/i
    const match = content.match(markdownCodeBlockRegex)

    if (match && match[1]) {
      // 提取代码块内的实际内容
      processedContent = match[1].trim()
      console.log('[Dify Mobile] Removed markdown code block wrapper')
    }

    return marked.parse(processedContent)
  } catch (error) {
    console.error('[Dify Mobile] Markdown parse error:', error)
    return content // 降级为纯文本
  }
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

const sendMessage = async () => {
  if (!canSend.value) return

  const query = inputQuery.value.trim()
  const files = uploadedFile.value ? [uploadedFile.value] : undefined
  
  inputQuery.value = ''
  uploadedFile.value = null

  await difyStore.sendMessage(query, files)

  scrollToBottom()
}

const newConversation = () => {
  difyStore.newConversation()
}

const stopResponse = async () => {
  await difyStore.stopCurrentResponse()
}

const feedback = async (msg: DifyMessage, rating: 'like' | 'dislike') => {
  if ((msg as any).rating === rating) {
    await difyStore.feedback(msg.id, null)
  } else {
    await difyStore.feedback(msg.id, rating)
  }
}

const toggleOriginalContent = (msg: any) => {
  ;(msg as any).showOriginal = !(msg as any).showOriginal
}

const copyMessage = (content: string) => {
  uni.setClipboardData({
    data: content,
    showToast: true
  })
}

const selectSuggestion = (suggestion: string) => {
  inputQuery.value = suggestion
}

const regenerate = (msg: any) => {
  const msgIndex = difyStore.messages.indexOf(msg)
  if (msgIndex <= 0) return

  let userMsgIndex = -1
  for (let i = msgIndex - 1; i >= 0; i--) {
    if (difyStore.messages[i].role === 'user') {
      userMsgIndex = i
      break
    }
  }

  if (userMsgIndex < 0) return

  const userMsg = difyStore.messages[userMsgIndex]
  const files = (userMsg as any).files

  difyStore.messages = difyStore.messages.slice(0, userMsgIndex)
  difyStore.sendMessage(userMsg.content, files)
}

const scrollToBottom = () => {
  setTimeout(() => {
    scrollToView.value = ''
    nextTick(() => {
      scrollToView.value = `msg-${difyStore.messages.length - 1}`
    })
  }, 100)
}

// 辅助函数：将十六进制颜色转换为rgba
const convertToRgba = (hex: string, alpha: number = 0.85): string => {
  // 如果已经是rgba或rgb，直接返回
  if (hex.startsWith('rgb')) {
    return hex.replace(')', `, ${alpha})`).replace('rgb', 'rgba')
  }
  
  // 移除#号
  const cleanHex = hex.replace('#', '')
  
  // 处理简写形式（如 #fff）
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex
  
  // 转换为rgb
  const r = parseInt(fullHex.substr(0, 2), 16)
  const g = parseInt(fullHex.substr(2, 2), 16)
  const b = parseInt(fullHex.substr(4, 2), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 文件上传相关
const triggerFileUpload = () => {
  const input = fileInputRef.value as any
  if (input && input.click) {
    input.click()
  } else {
    // 备用方案：直接创建临时 input
    const tempInput = document.createElement('input')
    tempInput.type = 'file'
    tempInput.accept = 'image/*,.pdf,.doc,.docx,.txt'
    tempInput.onchange = (e: any) => {
      handleFileUpload(e, tempInput)  // 传递 tempInput
    }
    tempInput.click()
  }
}

const handleFileUpload = async (event: any, tempInput?: HTMLInputElement) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    uni.showLoading({ title: '上传中...' })
    
    const { uploadFile } = await import('@/api/dify')
    const result = await uploadFile(file)
    
    uploadedFile.value = {
      id: result.id,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      url: result.fullUrl || result.url,
      name: file.name
    }
    
    uni.hideLoading()
  } catch (error: any) {
    uni.hideLoading()
    uni.$u.toast(`上传失败: ${error.message}`)
  }
  
  // 清空 input，允许重复上传同一文件
  if (tempInput) {
    try {
      tempInput.value = ''
      tempInput.remove()
    } catch (e) {
      // 忽略错误
    }
  } else {
    nextTick(() => {
      const input = fileInputRef.value as any
      if (input && typeof input.value !== 'undefined') {
        try {
          input.value = ''
        } catch (e) {
          // 静默忽略
        }
      }
    })
  }
}

const removeFile = () => {
  uploadedFile.value = null
}

// 语音录制相关
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingStream: MediaStream | null = null

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

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
      isRecording.value = false
      const webmBlob = new Blob(audioChunks, { type: mimeType })

      if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop())
        recordingStream = null
      }

      if (webmBlob.size === 0) {
        uni.$u.toast('录音内容为空，请重新录制')
        return
      }

      try {
        isTranscribing.value = true
        const wavBlob = await convertToWav(webmBlob)
        const { audioToText } = await import('@/api/dify')
        const text = await audioToText(wavBlob, 'wav')

        if (text) {
          inputQuery.value += (inputQuery.value ? ' ' : '') + text
        } else {
          uni.$u.toast('未能识别出文字，请重试')
        }
      } catch (error: any) {
        console.error('[Dify] Transcription failed:', error)
        uni.$u.toast(`语音转文字失败: ${error.message}`)
      } finally {
        isTranscribing.value = false
      }
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (error: any) {
    uni.$u.toast(`无法访问麦克风: ${error.message}`)
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
  const audioContext = new AudioContext()
  try {
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    const wavBuffer = audioBufferToWav(audioBuffer)
    return new Blob([wavBuffer], { type: 'audio/wav' })
  } finally {
    audioContext.close()
  }
}

const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  const dataLength = buffer.length * blockAlign
  const bufferLength = 44 + dataLength

  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(36, 'data')
  view.setUint32(40, dataLength, true)

  const channels = []
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i]
      sample = Math.max(-1, Math.min(1, sample))
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset, sample, true)
      offset += 2
    }
  }

  return arrayBuffer
}

// 监听流式更新
const onStreamUpdate = () => {
  nextTick(() => scrollToBottom())
}

onMounted(async () => {
  window.addEventListener('dify-stream-update', onStreamUpdate)

  nextTick(() => {
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  })
})
// #endif
</script>

<style lang="scss" scoped>
// ============================================
// Design Tokens (matching PC design system)
// ============================================
$primary: #3b82f6;
$primary-dark: #1d4ed8;
$primary-light: #eff6ff;
$primary-border: #dbeafe;
$primary-hover: #2563eb;

$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-800: #1f2937;
$gray-900: #111827;

$warning-bg: #fef3c7;
$warning-text: #d97706;
$warning-border: rgba(217, 119, 6, 0.3);

$error-bg: #fef2f2;
$error-text: #dc2626;
$error-border: #fecaca;

$font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;

$radius-sm: 12rpx;
$radius-md: 16rpx;
$radius-lg: 24rpx;
$radius-xl: 32rpx;
$radius-pill: 100rpx;
$radius-round: 50%;

$shadow-sm: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
$shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
$shadow-lg: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);

$ease-out: cubic-bezier(0.16, 1, 0.3, 1);
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

// ============================================
// Chat Bubble Button
// ============================================
.chat-bubble-btn {
  position: fixed;
  top: 75%;
  right: 30rpx;
  transform: translateY(-50%);
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md, 0 8rpx 24rpx rgba(59, 130, 246, 0.25);
  transition: transform 0.25s $ease-spring, box-shadow 0.25s ease;
  z-index: 99998;
  
  // 半透明效果 - 让背景文字能透过来
  backdrop-filter: blur(20rpx) saturate(180%);
  -webkit-backdrop-filter: blur(20rpx) saturate(180%);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  
  // 测试模式：添加棋盘格背景来验证透明效果
  // &::before {
  //   content: '';
  //   position: absolute;
  //   top: -50%;
  //   left: -50%;
  //   width: 200%;
  //   height: 200%;
  //   background-image: 
  //     linear-gradient(45deg, #ccc 25%, transparent 25%),
  //     linear-gradient(-45deg, #ccc 25%, transparent 25%);
  //     linear-gradient(45deg, transparent 75%, #ccc 75%),
  //     linear-gradient(-45deg, transparent 75%, #ccc 75%);
  //   background-size: 20rpx 20rpx;
  //   background-position: 0 0, 0 10rpx, 10rpx -10rpx, -10rpx 0px;
  //   z-index: -1;
  //   border-radius: 50%;
  // }

  &:active {
    transform: translateY(-50%) scale(0.92);
  }

  &.is-open {
    box-shadow: $shadow-sm;
    background: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(20rpx);
  }

  .bubble-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// ============================================
// Chat Bubble Button
// ============================================
.chat-bubble-btn {
  position: fixed;
  top: 75%;
  right: 30rpx;
  transform: translateY(-50%);
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md, 0 8rpx 24rpx rgba(59, 130, 246, 0.25);
  transition: transform 0.25s $ease-spring, box-shadow 0.25s ease;
  
  // 半透明效果 - 让背景文字能透过来
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.5);

  &:active {
    transform: translateY(-50%) scale(0.92);
  }

  &.is-open {
    box-shadow: $shadow-sm;
    background: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(20rpx);
  }

  .bubble-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// ============================================
// Chat Window (full-screen bottom sheet)
// ============================================
.chat-window {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  height: 100dvh;
  z-index: 99999;
  background: white;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.35s $ease-out;

  &.is-open {
    // placeholder for potential state-based styles
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0.5;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

// ============================================
// Header
// ============================================
.chat-header {
  padding: 24rpx 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  // Safe area for notch
  padding-top: calc(24rpx + env(safe-area-inset-top, 0px));

  .header-title {
    font-size: 34rpx;
    font-weight: 600;
    color: white;
    letter-spacing: 0.5rpx;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .header-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
    height: 56rpx;
    padding: 0 20rpx;
    border-radius: $radius-sm;
    color: white;
    transition: background 0.2s;

    &:active {
      opacity: 0.8;
    }
  }

  .new-chat-btn {
    background: rgba(255, 255, 255, 0.15);

    .btn-label {
      font-size: 22rpx;
      white-space: nowrap;
    }
  }

  .stop-btn {
    background: rgba(255, 255, 255, 0.25);

    .btn-label {
      font-size: 22rpx;
      white-space: nowrap;
    }
  }

  .close-btn {
    width: 56rpx;
    padding: 0;
    background: rgba(255, 255, 255, 0.15);
  }
}

// ============================================
// Messages Area
// ============================================
.chat-messages {
  flex: 1;
  padding: 24rpx 24rpx 0;
  overflow-y: auto;
  background: #f8fafc;
}

// ============================================
// Welcome Message
// ============================================
.chat-welcome {
  display: flex;
  gap: 20rpx;
  padding: 28rpx;
  background: white;
  border-radius: $radius-lg;
  border: 1rpx solid #e2e8f0;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
  animation: welcome-glow 3s ease-in-out infinite;
}

.welcome-avatar {
  flex-shrink: 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-round;
  background: $primary-light;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  flex: 1;
  padding: 14rpx 20rpx;
  background: #f8fafc;
  border-radius: $radius-md;
  font-size: 26rpx;
  line-height: 1.6;
  color: $gray-600;
}

// ============================================
// Suggestion Pills
// ============================================
.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-bottom: 24rpx;
}

.suggestion-item {
  padding: 16rpx 24rpx;
  background: white;
  border: 1rpx solid $primary-border;
  border-radius: $radius-pill;
  font-size: 24rpx;
  color: #0369a1;
  box-shadow: $shadow-sm;
  transition: all 0.2s;

  &:active {
    background: $primary-border;
    transform: scale(0.97);
  }
}

// ============================================
// Message Bubbles
// ============================================
.message {
  display: flex;
  gap: 16rpx;
  margin-bottom: 28rpx;
  animation: messageIn 0.3s $ease-out;

  &.user {
    flex-direction: row-reverse;

    .message-body {
      align-items: flex-end;
    }

    .message-content {
      background: $primary;
      color: white;
      border-radius: $radius-lg $radius-lg 4rpx $radius-lg;
    }
  }

  &.assistant {
    .message-content {
      background: white;
      color: $gray-800;
      border-radius: $radius-lg $radius-lg $radius-lg 4rpx;
      box-shadow: $shadow-sm;
    }
  }

  &.typing {
    .typing-indicator {
      display: flex;
      gap: 8rpx;
      padding: 20rpx 28rpx;
      background: white;
      border-radius: $radius-lg $radius-lg $radius-lg 4rpx;
      box-shadow: $shadow-sm;

      .typing-dot {
        width: 14rpx;
        height: 14rpx;
        background: $primary;
        border-radius: $radius-round;
        animation: bounce 1.4s infinite ease-in-out;

        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
  }
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ============================================
// Message Avatars
// ============================================
.message-avatar {
  flex-shrink: 0;

  .avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-round;
    display: flex;
    align-items: center;
    justify-content: center;

    &.bot {
      background: $primary-light;
    }

    &.user {
      background: $gray-100;
    }
  }
}

// ============================================
// Message Body
// ============================================
.message-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  max-width: 78%;
}

.message-content {
  padding: 20rpx 28rpx;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 28rpx;
}

// ============================================
// File Attachments
// ============================================
.message-files {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.file-attachment {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 20rpx;
  background: $gray-50;
  border-radius: $radius-md;
  font-size: 24rpx;
}

.file-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-sm;
  overflow: hidden;
  background: $gray-200;
  display: flex;
  align-items: center;
  justify-content: center;

  .file-image-preview {
    width: 100%;
    height: 100%;
  }

  .file-icon-placeholder {
    color: $gray-400;
  }
}

.file-document {
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: $gray-700;

  .file-name {
    font-size: 24rpx;
    max-width: 300rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// ============================================
// Content Replaced Badge
// ============================================
.content-replaced-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: $warning-bg;
  border-radius: $radius-pill;
  font-size: 20rpx;
  color: $warning-text;

  .badge-text {
    font-weight: 500;
  }

  .view-original-btn {
    padding: 4rpx 14rpx;
    margin-left: 4rpx;
    background: rgba(217, 119, 6, 0.1);
    border: 1rpx solid $warning-border;
    border-radius: $radius-sm;
    font-size: 20rpx;
    color: $warning-text;
    transition: all 0.2s;

    &:active {
      background: rgba(217, 119, 6, 0.2);
    }

    &.active {
      background: $warning-text;
      color: white;
      border-color: $warning-text;
    }
  }
}

.original-content {
  padding: 20rpx;
  background: $error-bg;
  border: 1rpx solid $error-border;
  border-radius: $radius-md;
  font-size: 24rpx;

  .original-content-header {
    font-size: 20rpx;
    font-weight: 600;
    color: $error-text;
    margin-bottom: 8rpx;
  }

  .original-content-text {
    color: #991b1b;
    line-height: 1.5;
    white-space: pre-wrap;
  }
}

// ============================================
// Message Actions
// ============================================
.message-actions {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-sm;
  background: white;
  border: 1rpx solid $gray-200;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $gray-500;
  transition: all 0.2s;

  &:active {
    background: $gray-50;
    color: $primary;
    border-color: $primary;
  }

  &.active {
    background: $primary-light;
    color: $primary;
    border-color: $primary;
  }

  &.tts-indicator {
    background: $warning-bg;
    color: $warning-text;
    border-color: #f59e0b;
    animation: pulse-gold 1.5s infinite;
  }
}

// ============================================
// Input Area
// ============================================
.chat-input-area {
  flex-shrink: 0;
  padding: 16rpx 24rpx;
  // Safe area for home indicator
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom, 0px));
  border-top: 1rpx solid $gray-200;
  background: white;
}

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 20rpx;
  background: $primary-light;
  border: 1rpx solid $primary-border;
  border-radius: $radius-md;
  margin-bottom: 14rpx;
  overflow: hidden;

  .file-preview-icon {
    flex-shrink: 0;
    color: $primary-dark;
  }

  .uploaded-file-name {
    flex: 1;
    font-size: 24rpx;
    color: $primary-dark;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-file-btn {
    flex-shrink: 0;
    width: 40rpx;
    height: 40rpx;
    border-radius: $radius-round;
    background: rgba(29, 78, 216, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: $primary-dark;

    &:active {
      background: rgba(29, 78, 216, 0.2);
    }
  }
}

.input-row {
  display: flex;
  gap: 16rpx;
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  background: $gray-50;
  border: 1rpx solid $gray-200;
  border-radius: $radius-lg;
  padding: 12rpx 16rpx;
  min-height: 80rpx;
  transition: border-color 0.2s;
  min-width: 0;

  &:focus-within {
    border-color: $primary;
  }
}

.chat-textarea {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 28rpx;
  resize: none;
  outline: none;
  max-height: 200rpx;
  line-height: 1.5;
  font-family: $font-body;
  color: $gray-900;

  &:disabled {
    opacity: 0.5;
  }
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
  margin-left: 8rpx;
}

.input-icon-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: $radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $gray-500;
  background: transparent;
  transition: all 0.2s;

  &:active {
    background: $gray-100;
    color: $primary;
  }

  &.recording {
    background: #fee2e2;
    color: $error-text;
    animation: pulse 1s infinite;

    .recording-stop-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.transcribing-hint {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: $gray-100;
  border-radius: $radius-sm;

  .transcribing-dot {
    width: 10rpx;
    height: 10rpx;
    background: $primary;
    border-radius: $radius-round;
    animation: transcribing-pulse 1s infinite;
  }

  .transcribing-text {
    font-size: 22rpx;
    color: $gray-500;
    white-space: nowrap;
  }
}

.send-btn {
  flex-shrink: 0;
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-lg;
  background: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.2s, transform 0.15s;

  &:active:not(.disabled) {
    transform: scale(0.92);
    background: $primary-hover;
  }

  &.disabled {
    background: $gray-300;
    opacity: 0.6;
  }
}

// ============================================
// Error Message
// ============================================
.error-message {
  padding: 16rpx 24rpx;
  background: $error-bg;
  color: $error-text;
  font-size: 24rpx;
  border-top: 1rpx solid $error-border;
}

// ============================================
// Chat Bubble Button
// ============================================
.chat-bubble-btn {
  position: fixed;
  top: 75%;
  right: 30rpx;
  transform: translateY(-50%);
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md, 0 8rpx 24rpx rgba(59, 130, 246, 0.25);
  transition: transform 0.25s $ease-spring, box-shadow 0.25s ease;

  &:active {
    transform: translateY(-50%) scale(0.92);
  }

  &.is-open {
    box-shadow: $shadow-sm;
  }

  .bubble-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// ============================================
// Animations
// ============================================
@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.7);
  }
  40% {
    transform: scale(1.2);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-gold {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10rpx rgba(245, 158, 11, 0);
  }
}

@keyframes transcribing-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.7);
  }
}

@keyframes welcome-glow {
  0%, 100% {
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
    border-color: #e2e8f0;
  }
  50% {
    box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.1);
    border-color: $primary-border;
  }
}

// ============================================
// Markdown 样式 (移动端)
// ============================================
.markdown-body {
  font-size: 28rpx;
  line-height: 1.6;
  word-wrap: break-word;

  // 标题
  ::v-deep h1,
  ::v-deep h2,
  ::v-deep h3,
  ::v-deep h4,
  ::v-deep h5,
  ::v-deep h6 {
    margin-top: 24rpx;
    margin-bottom: 16rpx;
    font-weight: 600;
    line-height: 1.25;
  }

  ::v-deep h1 { font-size: 1.5em; }
  ::v-deep h2 { font-size: 1.3em; }
  ::v-deep h3 { font-size: 1.15em; }
  ::v-deep h4 { font-size: 1.05em; }

  // 段落
  ::v-deep p {
    margin-top: 0;
    margin-bottom: 16rpx;
  }

  // 列表
  ::v-deep ul,
  ::v-deep ol {
    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 16rpx;
  }

  ::v-deep li {
    margin-bottom: 8rpx;
  }

  // 代码
  ::v-deep code {
    padding: 4rpx 12rpx;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 6rpx;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 0.9em;
  }

  ::v-deep pre {
    padding: 20rpx;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 12rpx;
    overflow-x: auto;
    margin: 16rpx 0;

    code {
      padding: 0;
      background: transparent;
    }
  }

  // 引用
  ::v-deep blockquote {
    padding: 12rpx 20rpx;
    margin: 16rpx 0;
    border-left: 8rpx solid $primary;
    background: rgba(59, 130, 246, 0.05);
    color: $gray-600;
  }

  // 表格
  ::v-deep table {
    border-collapse: collapse;
    width: 100%;
    margin: 16rpx 0;

    th,
    td {
      padding: 12rpx 20rpx;
      border: 2rpx solid $gray-200;
      text-align: left;
    }

    th {
      background: $gray-50;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: $gray-50;
    }
  }

  // 链接
  ::v-deep a {
    color: $primary;
    text-decoration: none;
  }

  // 图片
  ::v-deep img {
    max-width: 100%;
    border-radius: 12rpx;
    margin: 12rpx 0;
  }

  // 水平线
  ::v-deep hr {
    height: 2rpx;
    border: none;
    background: $gray-200;
    margin: 24rpx 0;
  }

  // 强调
  ::v-deep strong {
    font-weight: 600;
  }

  ::v-deep em {
    font-style: italic;
  }
}
</style>
