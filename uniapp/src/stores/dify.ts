import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import type { DifyConfig, DifyMessage } from '@/types/dify'
import { sendMessage, parseStream, getMessages, getConversations, loadConversationHistory, stopResponse, feedbackMessage, getAppFeedbacks } from '@/api/dify'
import { getConfig } from '@/api/app'

function generateUUID(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
import { toast } from '@/utils/message'

interface DifyState {
  config: DifyConfig
  currentConversationId: string | null
  messages: DifyMessage[]
  isTyping: boolean
  error: string | null
  currentTaskId: string | null
  uploadedFiles: Map<string, { id: string, type: string, url: string, name: string }>
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
    uploadedFiles: new Map()
  }),

  getters: {
    isConfigured: (state) => state.config.enabled && !!state.config.token,
    canChat: (state) => state.isConfigured && !state.isTyping
  },

  actions: {
    /**
     * 从后端 API 获取配置并初始化
     */
    async initConfig() {
      try {
        const appConfig = await getConfig()
        this.setDifyConfig(appConfig.dify || {})
      } catch (error) {
        console.error('[Dify Store] Failed to init config:', error)
        this.error = 'Failed to initialize Dify config'
      }
    },

    /**
     * 从后端配置设置 Dify 配置（统一使用PC端配置）
     */
    setDifyConfig(config: Partial<DifyConfig>) {
      if (config.enabled !== undefined) this.config.enabled = config.enabled
      if (config.token !== undefined) this.config.token = config.token
      if (config.baseUrl !== undefined) this.config.baseUrl = config.baseUrl
      if (config.buttonColor !== undefined) this.config.buttonColor = config.buttonColor
      if (config.windowWidth !== undefined) this.config.windowWidth = config.windowWidth
      if (config.windowHeight !== undefined) this.config.windowHeight = config.windowHeight
      if (config.welcomeEnabled !== undefined) this.config.welcomeEnabled = config.welcomeEnabled
      if (config.welcomeText !== undefined) this.config.welcomeText = config.welcomeText
      if (config.suggestionsEnabled !== undefined) this.config.suggestionsEnabled = config.suggestionsEnabled
      if (config.suggestions !== undefined) this.config.suggestions = config.suggestions

      // 加载历史记录
      if (this.isConfigured) {
        this.loadHistoryFromDify()
      }
    },

    /**
     * 从 Dify 加载历史记录
     */
    async loadHistoryFromDify() {
      try {
        const history = await loadConversationHistory()
        if (history && history.messages.length > 0) {
          this.currentConversationId = history.conversationId

          // Dify API 返回的消息默认是按创建时间从旧到新的，不需要 reverse
          const rawMessages = history.messages

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
      } catch (error) {
        console.error('[Dify Store] Failed to load history:', error)
      }
    },

    async sendMessage(query: string, files?: Array<{id: string, type: string, url: string, name: string}>) {
      if (!query.trim()) return

      if (files && files.length > 0) {
        files.forEach(f => this.uploadedFiles.set(f.id, f))
      }

      const userMessage: DifyMessage = {
        id: `user_${generateUUID()}`,
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
        id: `assistant_${generateUUID()}`,
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
              if (chunk.file) {
                const savedFile = this.uploadedFiles.get(chunk.file.id)
                (lastMsg as any).files = [{
                  id: chunk.file.id,
                  type: chunk.file.type,
                  url: chunk.file.url,
                  name: savedFile?.name || chunk.file.name || '文件'
                }]
              } else if (files && files.length > 0 && !(lastMsg as any).files) {
                (lastMsg as any).files = files.map(f => ({ ...f }))
              }
            }
            nextTick(() => {
              window.dispatchEvent(new Event('dify-stream-update'))
            })
          } else if (chunk.event === 'message_end') {
            this.currentConversationId = chunk.conversation_id
            this.currentTaskId = null
          } else if (chunk.event === 'error') {
            throw new Error(chunk.message || 'Unknown error')
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
        // Dify API 返回的消息默认是按创建时间从旧到新的，不需要 reverse
        this.messages = (data.data || [])
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
    }
  }
})
