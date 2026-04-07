<template>
  <view class="dify-chat-wrapper">
    <!-- 聊天按钮 -->
    <view
      v-if="difyStore.config.enabled"
      class="chat-bubble-btn"
      :style="{ backgroundColor: difyStore.config.buttonColor }"
      @click="toggleChat"
    >
      <text class="bubble-icon">💬</text>
    </view>

    <!-- 聊天窗口 -->
    <view class="chat-window" v-if="isOpen">
      <!-- 标题栏 -->
      <view class="chat-header">
        <text class="header-title">智能客服</text>
        <view class="header-actions">
          <view
            v-if="difyStore.messages.length > 0"
            class="action-btn-text"
            @click="newConversation"
          >
            新对话
          </view>
          <view
            v-if="difyStore.isTyping"
            class="stop-btn"
            @click="stopResponse"
          >
            停止
          </view>
          <view class="close-btn" @click="toggleChat">✕</view>
        </view>
      </view>

      <!-- 消息列表 -->
      <scroll-view
        class="chat-messages"
        scroll-y
        :scroll-into-view="scrollToView"
        :scroll-with-animation="true"
      >
        <view
          v-for="(msg, index) in difyStore.messages"
          :key="msg.id"
          :id="`msg-${index}`"
          class="message-wrapper"
          :class="msg.role"
        >
          <!-- 用户消息 -->
          <view v-if="msg.role === 'user'" class="message user-message">
            <view class="message-content">{{ msg.content }}</view>
            <view class="message-avatar">我</view>
          </view>

          <!-- 助手消息 -->
          <view v-else class="message assistant-message">
            <view class="message-avatar">AI</view>
            <view class="message-content">
              {{ msg.content }}
              <view v-if="difyStore.isTyping && index === difyStore.messages.length - 1" class="typing-indicator">
                <text class="dot"></text>
                <text class="dot"></text>
                <text class="dot"></text>
              </view>
            </view>
            <view class="message-actions">
              <view
                class="action-btn"
                :class="{ active: (msg as any).rating === 'like' }"
                @click="feedback(msg, 'like')"
              >
                👍
              </view>
              <view
                class="action-btn"
                :class="{ active: (msg as any).rating === 'dislike' }"
                @click="feedback(msg, 'dislike')"
              >
                👎
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

       <!-- 输入区域 -->
      <view class="chat-input-area">
        <!-- 上传的文件显示 -->
        <view v-if="uploadedFile" class="uploaded-file">
          <view class="file-info">
            <text class="file-name">{{ uploadedFile.name }}</text>
            <view class="file-remove" @click="removeFile">✕</view>
          </view>
        </view>

        <textarea
          v-model="inputQuery"
          class="chat-input"
          placeholder="输入消息..."
          :disabled="difyStore.isTyping"
          @confirm="sendMessage"
        />
        <view class="input-actions">
          <!-- #ifdef H5 -->
          <view
            v-if="!difyStore.isTyping && !isTranscribing && !uploadedFile"
            class="action-btn"
            @click="triggerFileUpload"
          >
            📎
          </view>
          <!-- 使用 v-show 而不是 style="display: none" -->
          <input
            ref="fileInputRef"
            type="file"
            v-show="false"
            @change="handleFileUpload"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <view
            v-if="!difyStore.isTyping && !isTranscribing"
            class="action-btn"
            @click="toggleRecording"
          >
            <text v-if="!isRecording">🎤</text>
            <text v-else class="recording">🔴</text>
          </view>
          <view v-if="isTranscribing" class="transcribing-hint">
            <text class="dot"></text>
            识别中
          </view>
          <!-- #endif -->
          <view
            class="send-btn"
            :class="{ disabled: !canSend }"
            @click="sendMessage"
          >
            发送
          </view>
        </view>
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

const props = defineProps({
  content: {
    type: Object,
    required: true
  }
})

const difyStore = useDifyStore()
const { getUserId } = useDifyUser()

// 从装修数据初始化配置
onMounted(() => {
  difyStore.setConfig({
    dify_url: props.content.dify_url || '',
    dify_token: props.content.dify_token || ''
  })
})

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

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const sendMessage = async () => {
  if (!canSend.value) return

  const query = inputQuery.value.trim()
  const files = uploadedFile.value ? [uploadedFile.value] : undefined
  
  inputQuery.value = ''
  uploadedFile.value = null

  await difyStore.sendMessage(query, files)

  // 滚动到底部
  setTimeout(() => {
    scrollToView.value = `msg-${difyStore.messages.length - 1}`
  }, 100)
}

const newConversation = () => {
  difyStore.newConversation()
}

const stopResponse = async () => {
  await difyStore.stopCurrentResponse()
}

const feedback = async (msg: DifyMessage, rating: 'like' | 'dislike') => {
  await difyStore.feedback(msg.id, rating)
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
  // 优先清空临时 input（如果有的话）
  if (tempInput) {
    try {
      tempInput.value = ''
      tempInput.remove()
    } catch (e) {
      // 忽略错误，不影响功能
    }
  } else {
    // 尝试清空模板中的 input（可能失败，但没关系）
    nextTick(() => {
      const input = fileInputRef.value as any
      if (input && typeof input.value !== 'undefined') {
        try {
          input.value = ''
        } catch (e) {
          // 静默忽略，不影响功能
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

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = 'audio/webm;codecs=opus'

    mediaRecorder = new MediaRecorder(stream, { mimeType })
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      isRecording.value = false
      const webmBlob = new Blob(audioChunks, { type: mimeType })

      if (webmBlob.size === 0) {
        uni.$u.toast('录音内容为空')
        return
      }

      try {
        isTranscribing.value = true

        // 转换为 WAV 格式（Dify 不支持 webm）
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

/**
 * 将 WebM 格式转换为 WAV 格式
 * Dify 不支持 WebM，需要转换
 */
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

/**
 * 将 AudioBuffer 转换为 WAV 格式的 ArrayBuffer
 */
const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  const dataLength = buffer.length * blockAlign
  const bufferLength = 44 + dataLength

  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  // 写入 WAV 文件头
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

  // 写入音频数据
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
// #endif
</script>

<style lang="scss" scoped>
.dify-chat-wrapper {
  position: fixed;
  z-index: 9999;
}

.chat-bubble-btn {
  position: fixed;
  bottom: 100rpx;
  right: 30rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  cursor: pointer;

  .bubble-icon {
    font-size: 40rpx;
  }
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
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .header-title {
    font-size: 32rpx;
    font-weight: bold;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 20rpx;
  }

  .action-btn-text {
    padding: 8rpx 16rpx;
    background: #f0f0f0;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #666;
    cursor: pointer;

    &:active {
      opacity: 0.7;
    }
  }

  .stop-btn {
    padding: 8rpx 20rpx;
    background: #ff4d4f;
    color: white;
    border-radius: 8rpx;
    font-size: 24rpx;
  }

  .close-btn {
    font-size: 40rpx;
    color: #999;
    cursor: pointer;
  }
}

.chat-messages {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;

  .message-wrapper {
    margin-bottom: 30rpx;
  }

  .message {
    display: flex;
    gap: 20rpx;
    max-width: 80%;
  }

  .user-message {
    margin-left: auto;
    flex-direction: row-reverse;

    .message-content {
      background: #1C64F2;
      color: white;
      border-radius: 20rpx 20rpx 0 20rpx;
    }
  }

  .assistant-message {
    flex-direction: row;

    .message-content {
      background: #f5f5f5;
      color: #333;
      border-radius: 20rpx 20rpx 20rpx 0;
    }
  }

  .message-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    flex-shrink: 0;
  }

  .message-content {
    padding: 20rpx 24rpx;
    font-size: 28rpx;
    line-height: 1.5;
    word-wrap: break-word;
  }

  .message-actions {
    display: flex;
    gap: 10rpx;
    margin-top: 10rpx;

    .action-btn {
      padding: 6rpx 10rpx;
      min-width: 48rpx;
      height: 48rpx;
      background: #f0f0f0;
      border-radius: 8rpx;
      font-size: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      &.active {
        background: #e6f7ff;
        color: #1C64F2;
      }
    }
  }
}

.typing-indicator {
  display: flex;
  gap: 8rpx;
  padding: 10rpx 0;

  .dot {
    width: 8rpx;
    height: 8rpx;
    background: #999;
    border-radius: 50%;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10rpx);
  }
}

.uploaded-file {
  padding: 16rpx 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  margin-bottom: 16rpx;

  .file-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .file-name {
      flex: 1;
      font-size: 24rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-remove {
      margin-left: 20rpx;
      padding: 4rpx 8rpx;
      color: #ff4d4f;
      font-size: 28rpx;
      cursor: pointer;
    }
  }
}

.chat-input-area {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;

  .chat-input {
    width: 100%;
    min-height: 80rpx;
    padding: 16rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    font-size: 28rpx;
    margin-bottom: 20rpx;
  }

  .input-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;

    .action-btn {
      font-size: 40rpx;
      padding: 10rpx;
    }

    .recording {
      animation: recording-pulse 1s infinite;
    }

    .transcribing-hint {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 24rpx;
      color: #666;
      padding: 8rpx 16rpx;
      background: #f0f0f0;
      border-radius: 8rpx;

      .dot {
        width: 8rpx;
        height: 8rpx;
        background: #1C64F2;
        border-radius: 50%;
        animation: transcribing-pulse 1s infinite;
      }
    }

    .send-btn {
      padding: 16rpx 40rpx;
      background: #1C64F2;
      color: white;
      border-radius: 12rpx;
      font-size: 28rpx;
      cursor: pointer;

      &.disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    }
  }
}

@keyframes recording-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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
</style>
