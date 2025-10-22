import { http } from '@services/httpClient'

export interface ChatroomDto {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface CreateChatroomRequest {
  chatroom: {
    name: string
  }
}

export interface ChatMessageDto {
  id: number
  body: string
  user_name: string
  user_uid: string
  chatroom_id: number
  created_at: string
  updated_at: string
}

export interface CreateMessageRequest {
  message: {
    body: string
    user_name: string
    user_uid: string
  }
}

/**
 * Thin API client for interacting with chatroom and message endpoints.
 */
export const chatApi = {
  // Fetch all available chatrooms.
  listChatrooms: () => http<ChatroomDto[]>('/chatrooms'),

  // Create a new chatroom with the provided payload.
  createChatroom: (payload: CreateChatroomRequest) =>
    http<ChatroomDto>('/chatrooms', {
      method: 'POST',
      body: payload,
    }),

  // Retrieve message history for the requested chatroom.
  listMessages: (chatroomId: number) =>
    http<ChatMessageDto[]>(`/chatrooms/${chatroomId}/messages`),

  // Post a chat message to the backend for realtime distribution.
  createMessage: (chatroomId: number, payload: CreateMessageRequest) =>
    http<ChatMessageDto>(`/chatrooms/${chatroomId}/messages`, {
      method: 'POST',
      body: payload,
    }),
} satisfies {
  listChatrooms: () => Promise<ChatroomDto[]>
  createChatroom: (payload: CreateChatroomRequest) => Promise<ChatroomDto>
  listMessages: (chatroomId: number) => Promise<ChatMessageDto[]>
  createMessage: (
    chatroomId: number,
    payload: CreateMessageRequest,
  ) => Promise<ChatMessageDto>
}
