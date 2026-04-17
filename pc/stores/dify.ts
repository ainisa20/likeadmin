import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import type { DifyConfig, DifyMessage } from '@/types/dify'
import { getConfig } from '@/api/app'
import { sendMessage, parseStream, getMessages, getConversations, loadConversationHistory, stopResponse, feedbackMessage, getAppFeedbacks } from '@/api/dify'

interface DifyState {
  config: DifyConfig
  currentConversationId: string | null
  messages: DifyMessage[]
  isTyping: boolean
  error: string | null
  currentTaskId: string | null
  uploadedFiles: Map<string, { id: string, type: string, url: string, name: string }>
  ttsAudioChunks: string[]
  ttsIsPlaying: boolean
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
    currentConversationId: null,
    messages: [],
    isTyping: false,
    error: null,
    currentTaskId: null,
    uploadedFiles: new Map(),
    ttsAudioChunks: [],
    ttsIsPlaying: false
  }),

  getters: {
    isConfigured: (state) => state.config.enabled && !!state.config.token,
    canChat: (state) => state.isConfigured && !state.isTyping
  },

  actions: {
    async initConfig() {
      try {
        const appConfig = await getConfig()
        this.config = appConfig.dify || this.config

        if (this.isConfigured) {
          const history = await loadConversationHistory()
          if (history && history.messages.length > 0) {
            this.currentConversationId = history.conversationId
            
            const rawMessages = history.messages.reverse()
            
            this.messages = []
            
            for (const msg of rawMessages) {
              const userFiles = msg.message_files?.filter((f: any) => f.belongs_to === 'user') || []
              
              if (msg.query) {
                const userMsg: any = {
                  id: `user_${msg.id}`,
                  role: 'user',
                  content: msg.query,
                  createdAt: new Date(msg.created_at * 1000)
                }
                
                if (userFiles.length > 0) {
                  userMsg.files = userFiles.map((file: any) => {
                    const fileType = file.type === 'image' ? 'image' : 'document'
                    let fileUrl = file.url || ''
                    
                    if (fileUrl && fileUrl.startsWith('/files/')) {
                      fileUrl = this.config.baseUrl.replace(/\/$/, '') + fileUrl
                    }
                    
                    return {
                      id: file.id,
                      type: fileType,
                      url: fileUrl,
                      name: file.filename || file.name || '文件'
                    }
                  })
                }
                
                this.messages.push(userMsg)
              }
              
              if (msg.answer) {
                const assistantMsg: any = {
                  id: msg.id,
                  role: 'assistant',
                  content: msg.answer,
                  createdAt: new Date(msg.created_at * 1000)
                }
                
                if (msg.feedback?.rating) {
                  assistantMsg.rating = msg.feedback.rating
                }
                
                this.messages.push(assistantMsg)
              }
            }
          }
        }
      } catch (error) {
        console.error('[Dify Store] Failed to init config:', error)
        this.error = 'Failed to initialize Dify config'
      }
    },

    async sendMessage(query: string, files?: Array<{id: string, type: string, url: string, name: string}>) {
      if (!query.trim()) return

      if (files && files.length > 0) {
        files.forEach(f => this.uploadedFiles.set(f.id, f))
      }

      const userMessage: DifyMessage = {
        id: `user_${crypto.randomUUID()}`,
        role: 'user',
        content: query,
        createdAt: new Date()
      }
      
      if (files && files.length > 0) {
        (userMessage as any).files = files
      }
      
      this.messages.push(userMessage)

      this.isTyping = true
      this.error = null
      this.currentTaskId = null

      const assistantMessage: DifyMessage = {
        id: `assistant_${crypto.randomUUID()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date()
      }
      this.messages.push(assistantMessage)

      try {
        const response = await sendMessage({
          query,
          conversation_id: this.currentConversationId || undefined,
          files: files?.map(f => {
            const type = f.type === 'image' ? 'image' : 'document'
            return { 
              type,
              transfer_method: 'local_file', 
              upload_file_id: f.id
            }
          })
        })

        for await (const chunk of parseStream(response)) {
          if (chunk.task_id && !this.currentTaskId) {
            this.currentTaskId = chunk.task_id
          }

          if (chunk.event === 'message') {
            const lastMsg = this.messages[this.messages.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = (lastMsg.content || '') + (chunk.answer || '')
              lastMsg.id = chunk.message_id || lastMsg.id
            }
            nextTick(() => {
              window.dispatchEvent(new Event('dify-stream-update'))
            })
          } else if (chunk.event === 'message_file') {
            const lastMsg = this.messages[this.messages.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              const files = (lastMsg as any).files || []
              files.push({
                id: chunk.id,
                type: chunk.type,
                url: chunk.url,
                name: chunk.filename || '文件',
                belongs_to: chunk.belongs_to
              })
              (lastMsg as any).files = files
            }
            nextTick(() => {
              window.dispatchEvent(new Event('dify-stream-update'))
            })
          } else if (chunk.event === 'message_replace') {
            const lastMsg = this.messages[this.messages.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              const originalContent = lastMsg.content
              lastMsg.content = chunk.answer || '内容已被替换'
              ;(lastMsg as any).isReplaced = true
              ;(lastMsg as any).originalContent = originalContent
              
              console.warn('[Dify Content Moderation] Message replaced:', {
                original: originalContent,
                replaced: lastMsg.content,
                messageId: lastMsg.id
              })
            }
            nextTick(() => {
              window.dispatchEvent(new Event('dify-stream-update'))
            })
          } else if (chunk.event === 'message_end') {
            this.currentConversationId = chunk.conversation_id
            this.currentTaskId = null
          } else if (chunk.event === 'error') {
            throw new Error(chunk.message || 'Unknown error')
          } else if (chunk.event === 'tts_message') {
            if (chunk.audio) {
              this.ttsAudioChunks.push(chunk.audio)
              if (!this.ttsIsPlaying) {
                this.playTTSAudio(chunk.audio)
              }
            }
          } else if (chunk.event === 'tts_message_end') {
            console.log('[Dify TTS] Audio stream ended, total chunks:', this.ttsAudioChunks.length)
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Failed to send message'
        const lastMsg = this.messages[this.messages.length - 1]
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = '抱歉，发生了错误，请稍后重试。'
        }
      } finally {
        this.isTyping = false
        this.currentTaskId = null
      }
    },

    async stopCurrentResponse() {
      if (!this.currentTaskId) {
        return false
      }
      try {
        await stopResponse(this.currentTaskId)
        this.isTyping = false
        this.currentTaskId = null
        return true
      } catch (error) {
        return false
      }
    },

    async feedback(msgId: string, rating: 'like' | 'dislike' | null) {
      try {
        await feedbackMessage(msgId, rating)
        const msg = this.messages.find(m => m.id === msgId)
        if (msg) {
          (msg as any).rating = rating
        }
        return true
      } catch (error) {
        console.error('[Dify Store] Feedback failed:', error)
        return false
      }
    },

    async loadHistory(conversationId: string) {
      try {
        const response = await getMessages(conversationId)
        const data = await response
        this.messages = (data.data || []).reverse()
        this.currentConversationId = conversationId
      } catch (error) {
        console.error('[Dify Store] Load history failed:', error)
        this.error = 'Failed to load conversation history'
      }
    },

    newConversation() {
      this.currentConversationId = null
      this.messages = []
      this.error = null
      this.uploadedFiles.clear()
      this.ttsAudioChunks = []
      this.ttsIsPlaying = false
    },

    base64ToBlob(base64: string, mimeType: string): Blob {
      const byteCharacters = atob(base64)
      const byteArrays = []

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512)
        const byteNumbers = new Array(slice.length)

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }

      return new Blob(byteArrays, { type: mimeType })
    },

    async playTTSAudio(base64Audio: string) {
      try {
        const audioBlob = this.base64ToBlob(base64Audio, 'audio/mp3')
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          this.ttsIsPlaying = false
        }

        audio.onerror = () => {
          console.error('[Dify TTS] Failed to play audio')
          URL.revokeObjectURL(audioUrl)
          this.ttsIsPlaying = false
        }

        await audio.play()
        this.ttsIsPlaying = true
      } catch (error) {
        console.error('[Dify TTS] Play error:', error)
        this.ttsIsPlaying = false
      }
    },

    stopTTSAudio() {
      this.ttsIsPlaying = false
      this.ttsAudioChunks = []
    }
  }
})
