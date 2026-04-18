/**
 * Dify 聊天相关类型定义
 *
 * 用途: 为 Dify 自定义聊天功能提供完整的 TypeScript 类型支持
 */

/**
 * Dify 配置接口
 * 从后端 /api/pc/config 返回的 dify 配置对象
 */
export interface DifyConfig {
  /** 是否启用聊天功能 */
  enabled: boolean
  /** Dify API Token */
  token: string
  /** Dify API Base URL */
  baseUrl: string
  /** 聊天按钮颜色（十六进制） */
  buttonColor: string
  /** 聊天窗口宽度（rem单位） */
  windowWidth: string
  /** 聊天窗口高度（rem单位） */
  windowHeight: string
  /** 是否启用对话开场白 */
  welcomeEnabled?: boolean
  /** 对话开场白内容 */
  welcomeText?: string
  /** 是否启用推荐提问 */
  suggestionsEnabled?: boolean
  /** 推荐提问列表（3-5个） */
  suggestions?: string[]
}

/**
 * 聊天消息接口
 */
export interface DifyMessage {
  /** 消息唯一标识 */
  id: string
  /** 消息角色：用户或助手 */
  role: 'user' | 'assistant'
  /** 消息内容 */
  content: string
  /** 消息创建时间 */
  createdAt: Date
  /** 消息状态（可选） */
  status?: 'sending' | 'sent' | 'error'
  /** 节点输出（用于展示思考过程） */
  nodeOutputs?: {
    [nodeId: string]: {
      title: string
      node_type: string
      status: string
      outputs?: any
      inputs?: any
      elapsedTime?: number
    }
  }
}

/**
 * 对话/会话接口
 */
export interface DifyConversation {
  /** 会话唯一标识 */
  id: string
  /** 会话名称 */
  name: string
  /** 创建时间 */
  createdAt: Date
  /** 更新时间 */
  updatedAt: Date
}

/**
 * 发送消息参数
 */
export interface SendMessageParams {
  /** 用户输入的查询文本 */
  query: string
  /** 会话ID（可选，首次对话不传） */
  conversation_id?: string
  /** 文件列表（可选） */
  files?: Array<{type: string, transfer_method: string, url: string}>
}

/**
 * Dify 文件接口
 */
export interface DifyFile {
  /** 文件类型：image 或 document */
  type: 'image' | 'document'
  /** 传输方式：通常为 local_file */
  transfer_method: string
  /** 上传后的文件ID */
  upload_file_id: string
}

/**
 * 流式响应事件类型
 */
export type StreamEventType =
  | 'message'            // 消息片段
  | 'message_end'        // 消息结束
  | 'message_file'       // 文件事件
  | 'message_replace'    // 内容审查替换
  | 'tts_message'        // TTS 音频流
  | 'tts_message_end'    // TTS 音频流结束
  | 'error'              // 错误
  | 'workflow_started'   // 工作流开始
  | 'workflow_finished'  // 工作流结束
  | 'node_started'       // 节点开始
  | 'node_finished'      // 节点结束
  | 'ping'               // 连接保活

/**
 * 流式响应事件接口
 */
export interface StreamEvent {
  /** 事件类型 */
  event: StreamEventType
  /** 回复内容（message事件时存在） */
  answer?: string
  /** 会话ID（message_end事件时存在） */
  conversation_id?: string
  /** 消息ID（message_end事件时存在） */
  message_id?: string
  /** 任务ID（用于停止生成） */
  task_id?: string
  /** 错误信息（error事件时存在） */
  message?: string
  /** 文件ID（message_file事件） */
  id?: string
  /** 文件类型（message_file事件） */
  type?: 'image' | 'document'
  /** 文件URL（message_file事件） */
  url?: string
  /** 文件名（message_file事件） */
  filename?: string
  /** 文件归属（message_file事件） */
  belongs_to?: 'user' | 'assistant'
  /** 音频数据 base64（tts_message事件） */
  audio?: string
  /** 创建时间戳 */
  created_at?: number
}

/**
 * 文件上传响应
 */
export interface UploadFileResponse {
  /** 文件ID */
  id: string
  /** 文件名 */
  name: string
  /** 文件大小（字节） */
  size: number
  /** 文件MIME类型 */
  type: string
  /** 文件URL */
  url?: string
}

/**
 * 历史消息响应
 */
export interface MessagesResponse {
  /** 消息列表 */
  data: DifyMessage[]
  /** 分页限制 */
  limit: number
  /** 是否有更多 */
  has_more: boolean
}

/**
 * 会话列表响应
 */
export interface ConversationsResponse {
  /** 会话列表 */
  data: DifyConversation[]
  /** 分页限制 */
  limit: number
  /** 是否有更多 */
  has_more: boolean
}

/**
 * API 错误接口
 */
export interface DifyApiError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误详情 */
  details?: any
  /** 状态码 */
  status?: number
}

/**
 * 聊天窗口状态
 */
export interface ChatWindowState {
  /** 窗口是否打开 */
  isOpen: boolean
  /** 是否正在输入 */
  isTyping: boolean
  /** 当前错误信息 */
  error: string | null
  /** 当前会话ID */
  currentConversationId: string | null
  /** 消息列表 */
  messages: DifyMessage[]
}

/**
 * 用户配置接口
 */
export interface UserVariables {
  /** 用户昵称 */
  name?: string
  /** 用户头像URL */
  avatar_url?: string
}

/**
 * 系统变量接口
 */
export interface SystemVariables {
  /** 用户ID */
  user_id?: string
  /** 会话ID（必须是有效UUID） */
  conversation_id?: string
}
