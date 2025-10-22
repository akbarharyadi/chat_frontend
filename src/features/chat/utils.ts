import type { Chatroom, ChatMessage } from '@features/chat/types'
import type { ChatMessageDto, ChatroomDto } from '@services/chatApi'

export const mapMessageDto = (dto: ChatMessageDto): ChatMessage => ({
  id: String(dto.id),
  chatroomId: dto.chatroom_id,
  body: dto.body,
  userName: dto.user_name,
  userUid: dto.user_uid,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
  status: 'sent',
})

export const mergeMessages = (existing: ChatMessage[], incoming: ChatMessage) => {
  const index = existing.findIndex((message) => message.id === incoming.id)
  if (index >= 0) {
    const copy = [...existing]
    copy[index] = { ...copy[index], ...incoming, status: 'sent', isLocal: false }
    return copy
  }
  return [...existing, incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export const mapChatroomDto = (dto: ChatroomDto): Chatroom => ({
  id: dto.id,
  name: dto.name,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
})
