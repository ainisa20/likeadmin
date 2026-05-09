<template>
  <div class="dify-chat-container">
    <div
      class="dify-chat-bubble"
      :style="{ backgroundColor: difyStore.config.buttonColor }"
      @click="toggleWindow"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="white"/>
        <path d="M7 9H17V11H7V9Z" fill="white"/>
        <path d="M7 12H14V14H7V12Z" fill="white"/>
      </svg>
    </div>

    <Transition name="fade">
      <div v-if="isOpen" class="dify-chat-window" :style="windowStyle">
        <div class="chat-header">
          <span class="chat-title">智能助手</span>
          <div class="header-actions">
            <button class="header-btn" @click="newConversation" title="新建对话">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
            <button class="header-btn close" @click="toggleWindow" title="关闭">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="chat-messages" ref="messagesRef">
          <!-- 对话开场白 -->
          <div v-if="difyStore.config.welcomeEnabled && difyStore.config.welcomeText" class="chat-welcome">
            <div class="welcome-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3b82f6"/>
                <circle cx="9" cy="10" r="1.5" fill="#3b82f6"/>
                <circle cx="15" cy="10" r="1.5" fill="#3b82f6"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
              </svg>
            </div>
            <div class="welcome-content">{{ difyStore.config.welcomeText }}</div>
          </div>

          <!-- 推荐提问 -->
          <div v-if="difyStore.config.suggestionsEnabled && difyStore.config.suggestions && difyStore.config.suggestions.length > 0" class="chat-suggestions">
            <div 
              v-for="(suggestion, index) in difyStore.config.suggestions" 
              :key="index"
              class="suggestion-item"
              @click="selectSuggestion(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>

          <!-- OPC 创业分析入口卡片 -->
          <div v-if="difyStore.config.opcToken && !wizardActive" class="wizard-entry-card" @click="startWizard">
            <div class="entry-icon">🚀</div>
            <div class="entry-body">
              <div class="entry-title">OPC创业落地分析</div>
              <div class="entry-desc">一键生成你的专属创业分析报告</div>
            </div>
            <div class="entry-arrow">→</div>
          </div>

          <!-- 引导模式 -->
          <WizardMode v-if="wizardActive" @cancel="wizardActive = false" @complete="onReportComplete" />

          <!-- 正常聊天消息 -->
          <template v-if="!wizardActive">
          <div
            v-for="msg in difyStore.messages"
            :key="msg.id"
            :class="['message', msg.role]"
          >
            <div class="message-avatar">
              <div v-if="msg.role === 'assistant'" class="avatar bot">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3b82f6"/>
                  <circle cx="9" cy="10" r="1.5" fill="#3b82f6"/>
                  <circle cx="15" cy="10" r="1.5" fill="#3b82f6"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                </svg>
              </div>
              <div v-else class="avatar user">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#374151"/>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="#374151"/>
                </svg>
              </div>
            </div>
            <div class="message-body">
              <div v-if="(msg as any).files && (msg as any).files.length" class="message-files">
                <div 
                  v-for="file in (msg as any).files" 
                  :key="file.id" 
                  class="file-attachment"
                >
                  <div v-if="file.type === 'image'" class="file-image clickable" @click="previewImage(file)">
                    <img 
                      v-if="!(file as any).needsAuth"
                      :src="file.url" 
                      alt="上传的图片" 
                    />
                    <div v-else class="file-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <path d="M17 8l-5-5-5 5"/>
                        <circle cx="12" cy="3" r="1"/>
                      </svg>
                    </div>
                  </div>
                  <div v-else class="file-document clickable" @click="previewFile(file)">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                    <span>{{ file.name || '文档' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="msg.content" class="message-content markdown-body" v-html="parseMarkdown(msg.content)"></div>
              
              <!-- 思考过程：节点输出 -->
              <div v-if="msg.role === 'assistant' && msg.nodeOutputs && Object.keys(msg.nodeOutputs).length > 0" class="thinking-process">
                <div class="thinking-header" @click="toggleThinking(msg)">
                  <span class="thinking-icon">🤔</span>
                  <span class="thinking-title">思考过程</span>
                  <span class="thinking-count">({{ Object.keys(msg.nodeOutputs).length }}个节点)</span>
                  <span class="thinking-toggle">{{ (msg as any).thinkingExpanded ? '▼ 收起' : '▶ 展开' }}</span>
                </div>
                <div v-if="(msg as any).thinkingExpanded" class="thinking-content">
                  <div
                    v-for="(output, nodeId) in msg.nodeOutputs"
                    :key="nodeId"
                    class="node-output-item fade-in"
                  >
                    <div class="node-output-header">
                      <span class="node-output-status" :class="output.status">
                        {{ output.status === 'succeeded' ? '✅' : output.status === 'failed' ? '❌' : '⏹️' }}
                        {{ output.elapsedTime ? `${output.elapsedTime.toFixed(2)}s` : '' }}
                      </span>
                    </div>
                    <div v-if="output.outputs" class="node-output-body">
                      <pre>{{ formatNodeOutput(output.outputs) }}</pre>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="(msg as any).isReplaced" class="content-replaced-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>内容已替换</span>
                <button 
                  class="view-original-btn" 
                  @click="toggleOriginalContent(msg)"
                  :class="{ active: (msg as any).showOriginal }"
                  title="查看原始内容"
                >
                  {{ (msg as any).showOriginal ? '隐藏' : '查看原始' }}
                </button>
              </div>
              <div v-if="(msg as any).isReplaced && (msg as any).showOriginal && (msg as any).originalContent" class="original-content">
                <div class="original-content-header">原始内容（已被替换）：</div>
                <div class="original-content-text">{{ (msg as any).originalContent }}</div>
              </div>
              <div v-if="msg.role === 'assistant' && msg.content" class="message-actions">
                <button v-if="difyStore.ttsIsPlaying" class="action-btn tts-playing" title="正在播放语音" disabled>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
                <button class="action-btn" @click="feedback(msg, 'like')" :class="{ active: (msg as any).rating === 'like' }" title="点赞">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                  </svg>
                </button>
                <button class="action-btn" @click="feedback(msg, 'dislike')" :class="{ active: (msg as any).rating === 'dislike' }" title="点踩">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                  </svg>
                </button>
                <button class="action-btn" @click="copyMessage(msg.content)" title="复制">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
                <button class="action-btn" @click="regenerate(msg)" title="重新生成">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-if="difyStore.isTyping" class="message assistant typing">
            <div class="message-avatar">
              <div class="avatar bot">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3b82f6"/>
                  <circle cx="9" cy="10" r="1.5" fill="#3b82f6"/>
                  <circle cx="15" cy="10" r="1.5" fill="#3b82f6"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                </svg>
              </div>
            </div>
            <div class="message-body">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
          </template>

        </div>

        <div v-if="!wizardActive" class="chat-input">
          <div v-if="uploadedFile" class="uploaded-file">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            <span>{{ uploadedFile.name || '文件已选择' }}</span>
            <button class="remove-file" @click="uploadedFile = null">×</button>
          </div>
          <div class="input-row">
            <div class="input-wrapper">
              <textarea
                v-model="inputQuery"
                @keydown.enter.exact.prevent="send"
                placeholder="输入消息或点击麦克风语音输入..."
                rows="1"
                :disabled="difyStore.isTyping"
                ref="inputRef"
              />
              <div class="input-actions">
                <input type="file" ref="fileInputRef" @change="handleFileUpload" style="display: none">
                <button v-if="!difyStore.isTyping && !isRecording && !isTranscribing" class="input-btn" @click="triggerFileUpload" title="上传文件">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <button v-if="!difyStore.isTyping" class="input-btn" :class="{ recording: isRecording || isTranscribing }" @click="toggleRecording" :disabled="isTranscribing" title="语音输入">
                  <svg v-if="!isRecording && !isTranscribing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
                <span v-if="isTranscribing" class="transcribing-indicator">
                  <span class="transcribing-dot"></span>
                  识别中
                </span>
                <button v-if="difyStore.isTyping" class="input-btn stop" @click="stopResponse" title="停止生成">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
              </div>
            </div>
            <button
              @click="send"
              :disabled="(!inputQuery.trim() && !uploadedFile) || difyStore.isTyping"
              class="send-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="difyStore.error" class="error-message">
          {{ difyStore.error }}
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="previewFileData" class="file-preview-modal" @click="closePreview">
        <div class="preview-container" @click.stop>
          <div class="preview-header">
            <span>{{ previewFileData.name }}</span>
            <button class="close-btn" @click="closePreview">×</button>
          </div>
          <div class="preview-content">
            <img :src="previewFileData.url" :alt="previewFileData.name" />
          </div>
        </div>
      </div>
    </Transition>
  </div>

  <!-- 验证码对话框 -->
  <el-dialog
    v-model="showCaptchaDialog"
    title="安全验证"
    width="400px"
    :close-on-click-modal="false"
    append-to-body
  >
    <div class="captcha-tip">
      为了保护服务安全，请完成以下验证
    </div>
    <div class="captcha-display">{{ expectedCaptcha }}</div>
    <el-input
      v-model="captchaInput"
      placeholder="请输入4位验证码"
      maxlength="4"
      style="text-transform: uppercase; letter-spacing: 8px; margin: 16px 0"
      @keyup.enter="verifyCaptcha"
      autofocus
    />
    <div class="captcha-hint">验证码不区分大小写</div>
    <template #footer>
      <el-button
        type="primary"
        :disabled="captchaInput.length !== 4"
        @click="verifyCaptcha"
        style="width: 100%"
      >
        验证
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useDifyStore } from '@/stores/dify'
import { nextTick, onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { ElMessage, ElDialog, ElInput, ElButton, ElFormItem, ElForm } from 'element-plus'
import { marked } from 'marked'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import WizardMode from './WizardMode.vue'
import { useWizard } from '@/composables/useWizard'
import { useSecurity } from '@/composables/useSecurity'

const difyStore = useDifyStore()
const wizard = useWizard()
const security = useSecurity()
const wizardActive = ref(false)
const isOpen = ref(false)
const inputQuery = ref('')
const messagesRef = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()
const previewFileData = ref<{id: string, name: string, type: string, url: string} | null>(null)
const fileInputRef = ref<HTMLInputElement>()
const uploadedFile = ref<{id: string, type: string, url: string, name: string} | null>(null)

const isRecording = ref(false)
const isTranscribing = ref(false)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingStream: MediaStream | null = null
const isSending = ref(false)

const showCaptchaDialog = ref(false)
const captchaInput = ref('')
const expectedCaptcha = ref('')

const windowStyle = computed(() => ({
  width: `${difyStore.config.windowWidth}rem`,
  height: `${difyStore.config.windowHeight}rem`
}))

// 配置 marked 选项
try {
  marked.setOptions({
    breaks: true, // 支持 GFM 换行
    gfm: true, // 启用 GitHub Flavored Markdown
    headerIds: false,
    mangle: false
  })
  console.log('[Dify] Marked initialized successfully')
} catch (error) {
  console.error('[Dify] Failed to initialize marked:', error)
}

// 解析 markdown 内容
const parseMarkdown = (content: string) => {
  if (!content) return ''

  if (/<[^>]+>/.test(content) && !content.startsWith('#')) {
    return content
  }

  try {
    let processedContent = content
    const markdownCodeBlockRegex = /```markdown\s*\n?([\s\S]*?)\n?```/i
    const match = content.match(markdownCodeBlockRegex)

    if (match && match[1]) {
      processedContent = match[1].trim()
    }

    return marked.parse(processedContent)
  } catch (error) {
    console.error('[Dify] Markdown parse error:', error)
    return content
  }
}

const toggleThinking = (msg: any) => {
  msg.thinkingExpanded = !msg.thinkingExpanded
}

const formatNodeOutput = (outputs: any) => {
  if (!outputs) return ''
  if (typeof outputs === 'string') return outputs
  try {
    return JSON.stringify(outputs, null, 2)
  } catch {
    return String(outputs)
  }
}

const toggleWindow = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
      inputRef.value?.focus()
    })
  }
}

const startWizard = () => {
  wizard.startWizard()
  wizardActive.value = true
}

const onReportComplete = () => {
  // 保存 OPC 报告到 localStorage
  const opcMessages = difyStore.messages.filter(msg => 
    msg.id && msg.id.startsWith('opc_')
  )
  if (opcMessages.length > 0) {
    const existing = JSON.parse(localStorage.getItem('opc_reports') || '[]')
    const newReport = {
      id: `opc_report_${Date.now()}`,
      createdAt: new Date().toISOString(),
      messages: opcMessages
    }
    existing.unshift(newReport)
    // 只保留最近 10 份报告
    if (existing.length > 10) existing.pop()
    localStorage.setItem('opc_reports', JSON.stringify(existing))
  }
  
  wizardActive.value = false
  nextTick(() => scrollToBottom())
}

// 加载本地保存的 OPC 报告
function loadLocalOpcReports() {
  try {
    const reports = JSON.parse(localStorage.getItem('opc_reports') || '[]')
    if (reports.length > 0) {
      const latestReport = reports[0]
      if (latestReport.messages && latestReport.messages.length > 0) {
        // 添加到消息列表
        latestReport.messages.forEach((msg: any) => {
          if (!difyStore.messages.find(m => m.id === msg.id)) {
            difyStore.messages.push(msg)
          }
        })
      }
    }
  } catch (e) {
    console.error('[Dify] Load OPC reports failed:', e)
  }
}

const send = async () => {
  if (!inputQuery.value.trim() || difyStore.isTyping || isSending.value) return

  const query = inputQuery.value

  const validation = security.validateQuery(query)
  if (!validation.allowed) {
    if (validation.reason === 'need_verification') {
      showCaptchaDialog.value = true
      expectedCaptcha.value = security.generateCaptcha()
      captchaInput.value = ''
      return
    } else {
      ElMessage.warning(validation.reason || '发送失败，请稍后再试')
      return
    }
  }

  isSending.value = true
  inputQuery.value = ''
  
  const filesToSend = uploadedFile.value ? [{...uploadedFile.value}] : undefined

  try {
    await difyStore.sendMessage(query, filesToSend)
    uploadedFile.value = null
    nextTick(() => scrollToBottom())
  } catch (error: any) {
    console.error('[Dify] Send failed:', error)
    inputQuery.value = query
  } finally {
    isSending.value = false
  }
}

const verifyCaptcha = () => {
  if (security.verifyCaptcha(captchaInput.value, expectedCaptcha.value)) {
    security.markVerified()
    showCaptchaDialog.value = false
    ElMessage.success('验证通过')
  } else {
    ElMessage.error('验证码错误，请重试')
    captchaInput.value = ''
    expectedCaptcha.value = security.generateCaptcha()
  }
}

const stopResponse = async () => {
  await difyStore.stopCurrentResponse()
}

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
      
      // 音频为空检查
      if (webmBlob.size === 0) {
        ElMessage.warning('录音内容为空，请重新录制')
        return
      }
      
      try {
        isTranscribing.value = true
        
        const wavBlob = await convertToWav(webmBlob)
        
        const { audioToText } = await import('@/api/dify')
        const text = await audioToText(wavBlob, 'wav')
        
        if (text) {
          inputQuery.value += (inputQuery.value ? ' ' : '') + text
          nextTick(() => {
            inputRef.value?.focus()
            inputRef.value?.scrollIntoView()
          })
        } else {
          ElMessage.warning('未能识别出文字，请重试')
        }
      } catch (error: any) {
        console.error('[Dify] Transcription failed:', error)
        ElMessage.error(`语音转文字失败: ${error.message}`)
      } finally {
        isTranscribing.value = false
      }
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (error: any) {
    console.error('[Dify] Failed to start recording:', error)
    ElMessage.error(`无法访问麦克风: ${error.message}`)
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

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    isRecording.value = false
  }
}

const newConversation = () => {
  difyStore.newConversation()
}

const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content)
}

const feedback = async (msg: any, rating: 'like' | 'dislike') => {
  if ((msg as any).rating === rating) {
    await difyStore.feedback(msg.id, null)
  } else {
    await difyStore.feedback(msg.id, rating)
  }
}

const toggleOriginalContent = (msg: any) => {
  ;(msg as any).showOriginal = !(msg as any).showOriginal
}

const previewFile = async (file: any) => {
  try {
    const baseUrl = difyStore.config.baseUrl.replace(/\/$/, '')
    let downloadUrl = `${baseUrl}/v1/files/${file.id}/preview?as_attachment=true`
    
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${difyStore.config.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        ElMessage.warning('文件已过期，仅在当前对话中可用。刷新页面后将无法下载。')
        return
      }
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }
    
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    let fileName = file.name || '下载文件'
    const disposition = response.headers.get('Content-Disposition')
    if (disposition) {
      const match = disposition.match(/filename\*?=['"]?(?:UTF-8'')?([^;\n"']+)/i)
      if (match) {
        fileName = decodeURIComponent(match[1])
      }
    }
    
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 立即释放 blob URL
    URL.revokeObjectURL(blobUrl)
    
  } catch (error: any) {
    console.error('[Dify] Download failed:', error)
    ElMessage.error(`下载失败: ${error.message}`)
  }
}

const previewImage = async (file: any) => {
  previewFileData.value = {
    ...file,
    url: file.url
  }
}

const closePreview = () => {
  if (previewFileData.value && previewFileData.value.url.startsWith('blob:')) {
    URL.revokeObjectURL(previewFileData.value.url)
  }
  previewFileData.value = null
}

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const { uploadFile } = await import('@/api/dify')
    const result = await uploadFile(file) as any
    
    const fileType = file.type.startsWith('image/') ? 'image' : 'document'
    const fileName = result.name || file.name
    
    uploadedFile.value = {
      id: result.id,
      type: fileType,
      url: result.fullUrl || result.source_url || `${difyStore.config.baseUrl}/v1/files/${result.id}/preview`,
      name: fileName
    }
  } catch (error: any) {
    console.error('[Dify] Upload failed:', error)
    ElMessage.error(`上传失败: ${error.message}`)
  }
  
  target.value = ''
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
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 监听聊天窗口打开状态，打开时滚动到底部
watch(() => isOpen.value, (newVal) => {
  if (newVal) {
    nextTick(() => {
      scrollToBottom()
    })
  }
})

const onStreamUpdate = () => {
  nextTick(() => scrollToBottom())
}

const selectSuggestion = (suggestion: string) => {
  inputQuery.value = suggestion
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
}

onMounted(async () => {
  security.init()
  
  if (!difyStore.isConfigured) {
    await difyStore.initConfig()
  }

  // 加载本地保存的 OPC 报告
  loadLocalOpcReports()

  // 保存用户ID用于文件预览
  try {
    const { useDifyUser } = await import('@/composables/useDifyUser')
    const { getUserId } = useDifyUser()
    const userId = getUserId()
    ;(window as any).difyUserId = userId
  } catch (e) {
    console.error('[Dify] Failed to get user ID:', e)
    const storageKey = 'dify_user_id'
    const userId = sessionStorage.getItem(storageKey)
    if (userId) {
      ;(window as any).difyUserId = userId
    }
  }

  window.addEventListener('dify-stream-update', onStreamUpdate)

  // 初始化时滚动到底部（如果有历史消息）
  nextTick(() => {
    // 稍微延迟一下，确保 DOM 完全渲染
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  })
})

onUnmounted(() => {
  window.removeEventListener('dify-stream-update', onStreamUpdate)
  
  // 清理录音资源
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (recordingStream) {
    recordingStream.getTracks().forEach(track => track.stop())
    recordingStream = null
  }
  audioChunks = []
})
</script>

<style scoped lang="scss">
.dify-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dify-chat-bubble {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }
}

.dify-chat-window {
  position: absolute;
  bottom: 76px;
  right: 0;
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);

  .chat-title {
    font-size: 16px;
    font-weight: 600;
    color: white;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .header-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    &.close:hover {
      background: rgba(255, 255, 255, 0.35);
    }
  }
}

.chat-messages {
  padding: 20px;
  height: calc(100% - 80px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
}

.chat-welcome {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 8px;
  animation: welcome-glow 3s ease-in-out infinite;
}

.welcome-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  flex: 1;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #475569;
}

.chat-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestion-item {
  padding: 8px 14px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  font-size: 13px;
  color: #0369a1;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  white-space: nowrap;
  flex: 0 1 auto;
}

.suggestion-item:hover {
  background: #dbeafe;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.wizard-entry-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin: 4px 0 8px;
  background: linear-gradient(135deg, #eff6ff, #f0fdf4);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.wizard-entry-card:hover {
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59,130,246,0.15);
}

.entry-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.entry-body {
  flex: 1;
}

.entry-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
}

.entry-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.entry-arrow {
  font-size: 16px;
  color: #3b82f6;
  flex-shrink: 0;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 100%;

  &.user {
    flex-direction: row-reverse;

    .message-body {
      align-items: flex-end;
    }

    .message-content {
      background: #3b82f6;
      color: white;
      border-radius: 16px 16px 4px 16px;
    }
  }

  &.assistant {
    .message-content {
      background: white;
      color: #1f2937;
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
  }

  &.typing {
    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 16px 16px 16px 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

      span {
        width: 8px;
        height: 8px;
        background: #3b82f6;
        border-radius: 50%;
        animation: bounce 1.4s infinite ease-in-out;

        &:nth-child(1) { animation-delay: 0s; }
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
  }
}

.message-avatar {
  flex-shrink: 0;

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.bot {
      background: #eff6ff;
    }

    &.user {
      background: #f3f4f6;
    }
  }
}

.message-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 85%;
}

.message-content {
  padding: 12px 16px;
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 14px;
  white-space: pre-wrap;
}

.content-replaced-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  margin-top: 4px;
  background: #fef3c7;
  border-radius: 12px;
  font-size: 11px;
  color: #d97706;
  font-weight: 500;

  .view-original-btn {
    padding: 2px 8px;
    margin-left: 4px;
    background: rgba(217, 119, 6, 0.1);
    border: 1px solid rgba(217, 119, 6, 0.3);
    border-radius: 6px;
    font-size: 10px;
    color: #d97706;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(217, 119, 6, 0.2);
      border-color: rgba(217, 119, 6, 0.5);
    }

    &.active {
      background: #d97706;
      color: white;
      border-color: #d97706;
    }
  }
}

.original-content {
  margin-top: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 13px;

  .original-content-header {
    font-size: 11px;
    font-weight: 600;
    color: #dc2626;
    margin-bottom: 6px;
  }

  .original-content-text {
    color: #991b1b;
    line-height: 1.5;
    white-space: pre-wrap;
    font-style: italic;
  }
}

.message-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-attachment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 13px;

  .file-image {
    width: 60px;
    height: 60px;
    border-radius: 6px;
    overflow: hidden;
    background: #e5e7eb;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    &:hover {
      background: #dbeafe;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .file-icon {
      color: #9ca3af;
    }
  }

  .file-document {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #374151;
    
    &.clickable {
      cursor: pointer;
      padding: 4px 8px;
      margin: -4px -8px;
      border-radius: 4px;
      transition: background 0.2s;
      
      &:hover {
        background: #e5e7eb;
      }
    }
  }
}

.message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;

  .message:hover & {
    opacity: 1;
  }
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: white;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #3b82f6;
    border-color: #3b82f6;
  }

  &.active {
    background: #eff6ff;
    color: #3b82f6;
    border-color: #3b82f6;
  }

  &.tts-playing {
    background: #fef3c7;
    color: #d97706;
    border-color: #f59e0b;
    animation: pulse-gold 1.5s infinite;

    &:disabled {
      cursor: default;
    }
  }
}

.chat-input {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;

  .input-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 8px 12px;
    transition: border-color 0.2s;
    min-width: 0;

    &:focus-within {
      border-color: #3b82f6;
    }
  }

  textarea {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 14px;
    resize: none;
    outline: none;
    max-height: 100px;
    line-height: 1.5;

    &:disabled {
      cursor: not-allowed;
    }
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .transcribing-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6b7280;
    padding: 4px 8px;
    background: #f3f4f6;
    border-radius: 4px;
  }

  .transcribing-dot {
    width: 6px;
    height: 6px;
    background: #3b82f6;
    border-radius: 50%;
    animation: transcribing-pulse 1s infinite;
  }

  .input-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    background: transparent;
    transition: all 0.2s;

    &:hover {
      background: #f3f4f6;
      color: #3b82f6;
    }

    &.stop {
      background: #fee2e2;
      color: #dc2626;
    }

    &.recording {
      background: #fee2e2;
      color: #dc2626;
      animation: pulse 1s infinite;
    }
  }

  .send-btn {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #3b82f6;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: background 0.2s, transform 0.1s;

    &:hover:not(:disabled) {
      background: #2563eb;
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  }
}

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #1d4ed8;
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-file {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: #dbeafe;
    color: #1d4ed8;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #bfdbfe;
    }
  }
}

.error-message {
  padding: 10px 16px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 13px;
  border-top: 1px solid #fecaca;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
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
    opacity: 0.6;
  }
}

@keyframes pulse-gold {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
  }
}

@keyframes transcribing-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes welcome-glow {
  0%, 100% {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border-color: #e2e8f0;
    background: #f8fafc;
  }
  50% {
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
    border-color: #bfdbfe;
    background: #eff6ff;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.file-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;

  .preview-container {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 800px;
    height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .preview-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #111827;

      .close-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background: #f3f4f6;
        cursor: pointer;
        font-size: 20px;
        color: #6b7280;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #e5e7eb;
        }
      }
    }

    .preview-content {
      flex: 1;
      overflow: hidden;
      background: #f9fafb;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
}

// Markdown 样式
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;

  // 标题
  h1, h2, h3, h4, h5, h6 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.25;
  }

  h1 { font-size: 1.5em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.15em; }
  h4 { font-size: 1.05em; }

  // 段落
  p {
    margin-top: 0;
    margin-bottom: 10px;
  }

  // 列表
  ul, ol {
    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 10px;
  }

  li {
    margin-bottom: 4px;
  }

  // 代码块
  code {
    padding: 2px 6px;
  }

  pre {
    padding: 12px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 6px;
    overflow-x: auto;
    margin: 10px 0;

    code {
      padding: 0;
      background: transparent;
      font-size: 0.9em;
    }
  }

  // 引用块
  blockquote {
    padding: 8px 12px;
    margin: 10px 0;
    border-left: 4px solid #3b82f6;
    background: rgba(59, 130, 246, 0.05);
    color: #4b5563;
  }

  // 表格
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0;

    th, td {
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      text-align: left;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #f9fafb;
    }
  }

  // 链接
  a {
    color: #3b82f6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  // 图片
  img {
    max-width: 100%;
    border-radius: 6px;
    margin: 8px 0;
  }

  // 水平线
  hr {
    height: 1px;
    border: none;
    background: #e5e7eb;
    margin: 16px 0;
  }

  // 强调
  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }
}

// 思考过程样式
.thinking-process {
  margin-top: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}

.thinking-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  background: #f3f4f6;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }
}

.thinking-icon {
  margin-right: 8px;
  font-size: 14px;
}

.thinking-title {
  font-weight: 500;
  color: #374151;
  font-size: 13px;
}

.thinking-count {
  margin-left: 6px;
  color: #6b7280;
  font-size: 12px;
}

.thinking-toggle {
  margin-left: auto;
  color: #6b7280;
  font-size: 12px;
}

.thinking-content {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.node-output-item {
  margin-bottom: 12px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;

  &:last-child {
    margin-bottom: 0;
  }

  &.fade-in {
    animation: fade-in 0.3s ease-in;
  }
}

.node-output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.node-output-title {
  font-weight: 500;
  color: #1f2937;
  font-size: 13px;
}

.node-output-status {
  font-size: 11px;
  color: #6b7280;

  &.succeeded {
    color: #10b981;
  }

  &.failed {
    color: #ef4444;
  }
}

.node-output-body {
  pre {
    margin: 0;
    padding: 8px;
    background: #1f2937;
    color: #f9fafb;
    border-radius: 4px;
    font-size: 11px;
    overflow-x: auto;
    max-height: 200px;
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>

<style lang="scss">
.captcha-tip {
  text-align: center;
  padding: 12px 0;
  margin-bottom: 16px;
  font-size: 14px;
}

.captcha-display {
  text-align: center;
  padding: 16px 0;
  font-family: monospace;
  font-size: 24px;
  letter-spacing: 4px;
  margin-bottom: 16px;
  font-weight: bold;
  color: #3b82f6;
}

.captcha-hint {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>