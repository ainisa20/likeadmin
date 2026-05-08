import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import type { DifyConfig, DifyMessage } from '@/types/dify'
import { getConfig } from '@/api/app'
import { sendMessage, parseStream, getMessages, getConversations, loadConversationHistory, stopResponse, feedbackMessage, getAppFeedbacks } from '@/api/dify'
import { generateUUID } from '@/utils/util'

const VISIBLE_NODE_IDS = ['1776435950853', '1776436014252', 'llm']

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
  workflowNodes: Map<string, {
    node_id: string
    node_type: string
    title: string
    index: number
    status: 'running' | 'succeeded' | 'failed' | 'stopped'
    inputs?: any
    outputs?: any
    error?: string
    elapsedTime?: number
    startedAt: number
    finishedAt?: number
  }>
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
    currentConversationId: null,
    messages: [],
    isTyping: false,
    error: null,
    currentTaskId: null,
    uploadedFiles: new Map(),
    ttsAudioChunks: [],
    ttsIsPlaying: false,
    workflowNodes: new Map(),
    currentWorkflowRunId: null
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

          if (chunk.event === 'node_started') {
            const nodeData = chunk.data
            this.workflowNodes.set(nodeData.node_id, {
              node_id: nodeData.node_id,
              node_type: nodeData.node_type,
              title: nodeData.title,
              index: nodeData.index,
              status: 'running',
              inputs: nodeData.inputs,
              startedAt: nodeData.created_at * 1000
            })

            // 目标节点：node_started到达时立即显示
            if (VISIBLE_NODE_IDS.includes(nodeData.node_id)) {
              let lastMsg = this.messages[this.messages.length - 1]
              if (!lastMsg || lastMsg.role !== 'assistant') {
                lastMsg = {
                  id: `temp_${Date.now()}`,
                  role: 'assistant',
                  content: '',
                  createdAt: new Date(),
                  nodeOutputs: {}
                } as any
                this.messages.push(lastMsg)
              }

              lastMsg.nodeOutputs = {}
              lastMsg.nodeOutputs[nodeData.node_id] = {
                title: nodeData.title,
                node_type: nodeData.node_type,
                status: 'running',
                outputs: { status: '正在执行...' },
                inputs: nodeData.inputs,
                elapsedTime: undefined
              }

              nextTick(() => {
                window.dispatchEvent(new Event('dify-stream-update'))
              })
            }
          }
          else if (chunk.event === 'node_finished') {
            const nodeData = chunk.data

            const node = this.workflowNodes.get(nodeData.node_id)
            if (node) {
              node.status = nodeData.status
              node.outputs = nodeData.outputs
              node.inputs = nodeData.inputs
              node.error = nodeData.error
              node.elapsedTime = nodeData.elapsed_time
              node.finishedAt = Date.now()
            }

            // 只更新配置的目标节点到消息（用于UI显示）
            if (VISIBLE_NODE_IDS.includes(nodeData.node_id)) {
              const lastMsg = this.messages[this.messages.length - 1]
              if (lastMsg && lastMsg.role === 'assistant') {
                if (!lastMsg.nodeOutputs) {
                  lastMsg.nodeOutputs = {}
                }

                lastMsg.nodeOutputs[nodeData.node_id] = {
                  title: nodeData.title,
                  node_type: nodeData.node_type,
                  status: nodeData.status,
                  outputs: nodeData.outputs,
                  inputs: nodeData.inputs,
                  elapsedTime: nodeData.elapsed_time
                }

                if (nodeData.node_type === 'llm' && nodeData.outputs) {
                  const outputs = nodeData.outputs
                  if (outputs.text) {
                    lastMsg.content = outputs.text?.text || ''
                  } else if (outputs.markdown) {
                    lastMsg.content = outputs.markdown
                  } else if (typeof outputs === 'string') {
                    lastMsg.content = outputs
                  }
                }
              }
            }
          }
          else if (chunk.event === 'workflow_started') {
            this.currentWorkflowRunId = chunk.data.id
            this.workflowNodes.clear()
          }
          else if (chunk.event === 'workflow_finished') {
            // 工作流完成，静默处理
          }
          else if (chunk.event === 'message') {
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
