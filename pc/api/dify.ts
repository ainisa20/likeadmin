import type {
  SendMessageParams,
  DifyMessage,
  DifyConversation,
  UploadFileResponse,
  MessagesResponse,
  ConversationsResponse
} from '@/types/dify'
import { useDifyUser } from '@/composables/useDifyUser'

const { getUserId } = useDifyUser()

export function sendMessage(params: SendMessageParams) {
  const config = useDifyStore().config
  if (!config.token || !config.baseUrl) {
    throw new Error('Dify config not initialized')
  }

  return $request.post({
    url: `${config.baseUrl}/v1/chat-messages`,
    headers: {
      Authorization: `Bearer ${config.token}`
    },
    body: {
      ...params,
      response_mode: 'streaming',
      user: getUserId()
    },
    responseType: 'stream',
    requestOptions: {
      isTransformResponse: false,
      isReturnDefaultResponse: true
    }
  })
}

export function getMessages(conversationId: string, limit = 20) {
  const config = useDifyStore().config
  return $request.get({
    url: `${config.baseUrl}/v1/messages`,
    params: {
      conversation_id: conversationId,
      user: getUserId(),
      limit
    },
    headers: {
      Authorization: `Bearer ${config.token}`
    }
  })
}

export function getConversations(limit = 20) {
  const config = useDifyStore().config
  return $request.get({
    url: `${config.baseUrl}/v1/conversations`,
    params: {
      user: getUserId(),
      limit
    },
    headers: {
      Authorization: `Bearer ${config.token}`
    }
  })
}

export function uploadFile(file: File) {
  const config = useDifyStore().config
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user', getUserId())

  return $request.uploadFile(
    {
      url: `${config.baseUrl}/v1/files/upload`,
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    },
    { file }
  )
}
