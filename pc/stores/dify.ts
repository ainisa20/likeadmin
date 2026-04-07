import { defineStore } from 'pinia'
import type { DifyConfig, DifyMessage } from '@/types/dify'
import { getConfig } from '@/api/app'
import { sendMessage, getMessages, getConversations } from '@/api/dify'

interface DifyState {
  config: DifyConfig
  currentConversationId: string | null
  messages: DifyMessage[]
  isTyping: boolean
  error: string | null
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
    error: null
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
        console.log('[Dify Store] Config initialized:', this.config)
      } catch (error) {
        console.error('[Dify Store] Failed to init config:', error)
        this.error = 'Failed to initialize Dify config'
      }
    },

    async sendMessage(query: string) {
      if (!query.trim()) return

      const userMessage: DifyMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: query,
        createdAt: new Date()
      }
      this.messages.push(userMessage)

      this.isTyping = true
      this.error = null

      const assistantMessage: DifyMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date()
      }
      this.messages.push(assistantMessage)

      try {
        const stream = await sendMessage({
          query,
          conversation_id: this.currentConversationId || undefined
        })

        for await (const chunk of stream) {
          if (chunk.event === 'message') {
            assistantMessage.content += chunk.answer || ''
          } else if (chunk.event === 'message_end') {
            this.currentConversationId = chunk.conversation_id
          } else if (chunk.event === 'error') {
            throw new Error(chunk.message || 'Unknown error')
          }
        }
      } catch (error: any) {
        console.error('[Dify Store] Send message failed:', error)
        this.error = error.message || 'Failed to send message'
        assistantMessage.content = '抱歉，发生了错误，请稍后重试。'
      } finally {
        this.isTyping = false
      }
    },

    async loadHistory(conversationId: string) {
      try {
        const messages = await getMessages(conversationId)
        this.messages = messages.reverse()
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
    }
  }
})
