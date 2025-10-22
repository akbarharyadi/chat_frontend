export type MessageStatus = 'sent' | 'sending' | 'failed'

export interface Chatroom {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  chatroomId: number
  body: string
  userName: string
  userUid: string
  createdAt: string
  updatedAt: string
  status: MessageStatus
  isLocal?: boolean
  isSystem?: boolean
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export interface SendMessageInput {
  body: string
  userName: string
  userUid: string
}
