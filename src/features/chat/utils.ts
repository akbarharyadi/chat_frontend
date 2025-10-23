import type { Chatroom, ChatMessage } from '@features/chat/types'
import type { ChatMessageDto, ChatroomDto } from '@services/chatApi'

/**
 * Convert an API message DTO into the UI-friendly ChatMessage model.
 *
 * @param dto - Message DTO received from the Rails backend.
 * @returns Normalised message ready for rendering in the UI.
 */
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

/**
 * Merge an incoming message into an existing sorted collection, replacing optimistic
 * entries when necessary and preserving chronological order.
 *
 * @param existing - Previously cached messages.
 * @param incoming - Newly received message to merge.
 * @returns Updated, chronologically sorted message array.
 */
export const mergeMessages = (existing: ChatMessage[], incoming: ChatMessage) => {
  const index = existing.findIndex((message) => message.id === incoming.id)
  if (index >= 0) {
    const copy = [...existing]
    copy[index] = { ...copy[index], ...incoming, status: 'sent', isLocal: false }
    return copy
  }
  return [...existing, incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/**
 * Convert an API chatroom DTO into the internal Chatroom model.
 *
 * @param dto - Raw chatroom data returned by the API.
 * @returns Normalised chatroom information for UI consumption.
 */
export const mapChatroomDto = (dto: ChatroomDto): Chatroom => ({
  id: dto.id,
  name: dto.name,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
})
