import { describe, expect, it } from 'vitest'

import type { ChatMessage } from '@features/chat/types'
import { mapChatroomDto, mapMessageDto, mergeMessages } from '@features/chat/utils'

describe('chat utils', () => {
  it('maps message DTO into ChatMessage', () => {
    const dto = {
      id: 5,
      chatroom_id: 2,
      body: 'Hi',
      user_name: 'Alice',
      user_uid: 'alice-1',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    }

    const message = mapMessageDto(dto)
    expect(message).toMatchObject({
      id: '5',
      chatroomId: 2,
      status: 'sent',
    })
  })

  it('merges messages by replacing optimistic entry', () => {
    const existing: ChatMessage[] = [
      {
        id: 'optimistic-1',
        chatroomId: 1,
        body: 'Draft',
        userName: 'Alice',
        userUid: 'alice',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        status: 'sending',
        isLocal: true,
      },
    ]

    const merged = mergeMessages(existing, {
      id: 'optimistic-1',
      chatroomId: 1,
      body: 'Draft',
      userName: 'Alice',
      userUid: 'alice',
      createdAt: '2024-01-01T00:00:01.000Z',
      updatedAt: '2024-01-01T00:00:01.000Z',
      status: 'sent',
      isLocal: false,
    })

    expect(merged[0]).toMatchObject({
      id: 'optimistic-1',
      status: 'sent',
      isLocal: false,
    })
  })

  it('maps chatroom DTO into Chatroom', () => {
    const chatroom = mapChatroomDto({
      id: 1,
      name: 'General',
      created_at: 'now',
      updated_at: 'now',
    })

    expect(chatroom).toEqual({
      id: 1,
      name: 'General',
      createdAt: 'now',
      updatedAt: 'now',
    })
  })
})
