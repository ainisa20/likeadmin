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
              <div v-if="msg.content" class="message-content">{{ msg.content }}</div>
              <div v-if="msg.role === 'assistant' && msg.content" class="message-actions">
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
        </div>

        <div class="chat-input">
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
                <button v-if="!difyStore.isTyping && !isRecording" class="input-btn" @click="triggerFileUpload" title="上传文件">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <button v-if="!difyStore.isTyping" class="input-btn" :class="{ recording: isRecording }" @click="toggleRecording" title="语音输入">
                  <svg v-if="!isRecording" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
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
</template>

<script setup lang="ts">
import { useDifyStore } from '@/stores/dify'
import { nextTick, onMounted, onUnmounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const difyStore = useDifyStore()
const isOpen = ref(false)
const inputQuery = ref('')
const messagesRef = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()
const previewFileData = ref<{id: string, name: string, type: string, url: string} | null>(null)
const fileInputRef = ref<HTMLInputElement>()
const uploadedFile = ref<{id: string, type: string, url: string, name: string} | null>(null)

const isRecording = ref(false)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let recordingStream: MediaStream | null = null
const isSending = ref(false)

const windowStyle = computed(() => ({
  width: `${difyStore.config.windowWidth}rem`,
  height: `${difyStore.config.windowHeight}rem`
}))

const toggleWindow = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom()
      inputRef.value?.focus()
    })
  }
}

const send = async () => {
  if (!inputQuery.value.trim() || difyStore.isTyping || isSending.value) return

  isSending.value = true
  const query = inputQuery.value
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
      const webmBlob = new Blob(audioChunks, { type: mimeType })
      if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop())
        recordingStream = null
      }
      
      try {
        const wavBlob = await convertToWav(webmBlob)
        
        const { audioToText } = await import('@/api/dify')
        const text = await audioToText(wavBlob, 'wav')
        
        if (text) {
          inputQuery.value += (inputQuery.value ? ' ' : '') + text
          nextTick(() => {
            inputRef.value?.focus()
            inputRef.value?.scrollIntoView()
          })
        }
      } catch (error: any) {
        console.error('[Dify] Transcription failed:', error)
        ElMessage.error(`语音转文字失败: ${error.message}`)
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

const onStreamUpdate = () => {
  nextTick(() => scrollToBottom())
}

onMounted(async () => {
  if (!difyStore.isConfigured) {
    await difyStore.initConfig()
  }
  
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
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8fafc;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
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
</style>