import type { SendMessageParams } from '@/types/dify'
import { useDifyUser } from '@/composables/useDifyUser'
import { useDifyStore } from '@/stores/dify'

function getDifyConfig() {
  const store = useDifyStore()
  return store.config
}

function getUserId(): string {
  const { getUserId: _getUserId } = useDifyUser()
  return _getUserId()
}

export function sendMessage(params: SendMessageParams) {
  const config = useDifyStore().config
  if (!config.token || !config.baseUrl) {
    throw new Error('Dify config not initialized')
  }

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
  }).then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`HTTP ${response.status}: ${text}`)
      })
    }
    return response.body
  })
}

export async function* parseStream(body: any): AsyncGenerator<any> {
  if (!body) return
  
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const MAX_BUFFER_SIZE = 10 * 1024 * 1024 // 10MB

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    
    // 防止缓冲区无限增长
    if (buffer.length > MAX_BUFFER_SIZE) {
      console.warn('[Stream] Buffer overflow, clearing...')
      buffer = buffer.slice(-MAX_BUFFER_SIZE / 2)
    }
    
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

export function getMessages(conversationId: string, limit = 20) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')
  
  const params = new URLSearchParams({
    conversation_id: conversationId,
    user: getUserId(),
    limit: limit.toString()
  })

  return fetch(`${difyApiUrl}/v1/messages?${params}`, {
    headers: {
      'Authorization': `Bearer ${config.token}`
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  })
}

export function getConversations(limit = 20) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')
  
  const params = new URLSearchParams({
    user: getUserId(),
    limit: limit.toString(),
    sort_by: '-updated_at'
  })

  return fetch(`${difyApiUrl}/v1/conversations?${params}`, {
    headers: {
      'Authorization': `Bearer ${config.token}`
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  })
}

export async function loadConversationHistory() {
  const config = useDifyStore().config
  if (!config.token || !config.baseUrl) return null

  const difyApiUrl = config.baseUrl.replace(/\/$/, '')
  const userId = getUserId()

  const convParams = new URLSearchParams({
    user: userId,
    limit: '1',
    sort_by: '-updated_at'
  })

  const convResponse = await fetch(`${difyApiUrl}/v1/conversations?${convParams}`, {
    headers: { 'Authorization': `Bearer ${config.token}` }
  })

  if (!convResponse.ok) return null

  const convData = await convResponse.json()
  const conversations = convData.data || []

  if (conversations.length === 0) return null

  const latestConv = conversations[0]

  const msgParams = new URLSearchParams({
    conversation_id: latestConv.id,
    user: userId,
    limit: '50'
  })

  const msgResponse = await fetch(`${difyApiUrl}/v1/messages?${msgParams}`, {
    headers: { 'Authorization': `Bearer ${config.token}` }
  })

  if (!msgResponse.ok) return null

  const msgData = await msgResponse.json()
  return {
    conversationId: latestConv.id,
    messages: msgData.data || []
  }
}

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
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }).then(result => {
    const baseUrl = config.baseUrl.replace(/\/$/, '')
    if (result.source_url) {
      return {
        ...result,
        fullUrl: `${baseUrl}${result.source_url}`
      }
    }
    return result
  })
}

export function stopResponse(taskId: string) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')

  return fetch(`${difyApiUrl}/v1/chat-messages/${taskId}/stop`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user: getUserId() })
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  })
}

export function feedbackMessage(messageId: string, rating: 'like' | 'dislike' | null, content?: string) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')

  return fetch(`${difyApiUrl}/v1/messages/${messageId}/feedbacks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rating,
      user: getUserId(),
      content: content || null
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  })
}

export function getFilePreviewUrl(fileId: string): string {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')
  return `${difyApiUrl}/v1/files/${fileId}/preview`
}

export function getAppFeedbacks(page = 1, limit = 100) {
  const config = useDifyStore().config
  const difyApiUrl = config.baseUrl.replace(/\/$/, '')
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  })

  return fetch(`${difyApiUrl}/v1/app/feedbacks?${params}`, {
    headers: {
      'Authorization': `Bearer ${config.token}`
    }
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  })
}

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

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }

  const result = await response.json()
  return result.text
}
