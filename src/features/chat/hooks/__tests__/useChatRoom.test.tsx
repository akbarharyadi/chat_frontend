import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'

import { useChatRoom } from '@features/chat/hooks/useChatRoom'
import type { ChatMessage } from '@features/chat/types'
import type { ChatMessageDto } from '@services/chatApi'
import { createTestQueryClient } from '@tests/testUtils'
import type { chatApi as ChatApi } from '@services/chatApi'
import type { subscribeToChatroom as SubscribeToChatroomFn } from '@services/chatRealtime'
import type { ReactNode } from 'react'

type ListMessagesFn = ChatApi['listMessages']
type CreateMessageFn = ChatApi['createMessage']
type SubscribeToChatroomMock = SubscribeToChatroomFn

const { listMessagesMock, createMessageMock, subscribeToChatroomMock } = vi.hoisted(
  () => ({
    listMessagesMock: vi.fn<ListMessagesFn>(),
    createMessageMock: vi.fn<CreateMessageFn>(),
    subscribeToChatroomMock: vi.fn<SubscribeToChatroomMock>(),
  }),
)
let subscriptionHandlers:
  | {
      onMessage?: (dto: ChatMessageDto) => void
    }
  | undefined

vi.mock(
  '@services/chatApi',
  () =>
    ({
      chatApi: {
        listMessages: listMessagesMock,
        createMessage: createMessageMock,
      },
    }) satisfies {
      chatApi: { listMessages: ListMessagesFn; createMessage: CreateMessageFn }
    },
)

vi.mock(
  '@services/chatRealtime',
  () =>
    ({
      subscribeToChatroom: subscribeToChatroomMock,
    }) satisfies { subscribeToChatroom: SubscribeToChatroomFn },
)

const renderUseChatRoom = (chatroomId: number | null) => {
  const queryClient = createTestQueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return renderHook(() => useChatRoom(chatroomId), { wrapper })
}

describe('useChatRoom', () => {
  const baseMessageDto: ChatMessageDto = {
    id: 1,
    body: 'Initial',
    user_name: 'Alice',
    user_uid: 'alice-1',
    chatroom_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    listMessagesMock.mockResolvedValue([baseMessageDto])
    createMessageMock.mockResolvedValue({
      ...baseMessageDto,
      id: 2,
      body: 'Server ack',
    })
    subscriptionHandlers = undefined
    subscribeToChatroomMock.mockImplementation((_chatroomId, handlers) => {
      subscriptionHandlers = handlers
      return () => {
        // cleanup stub
      }
    })
  })

  it('loads initial messages and reacts to realtime updates', async () => {
    const { result } = renderUseChatRoom(1)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].body).toBe('Initial')

    await waitFor(() => expect(subscriptionHandlers).toBeDefined())

    const newMessage: ChatMessageDto = {
      ...baseMessageDto,
      id: 3,
      body: 'Realtime message',
      created_at: new Date().toISOString(),
    }

    act(() => {
      subscriptionHandlers?.onMessage?.(newMessage)
    })

    await waitFor(() =>
      expect(result.current.messages.map((m) => m.body)).toContain('Realtime message'),
    )
  })

  it('sends messages via mutation helpers', async () => {
    const { result } = renderUseChatRoom(1)
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.sendMessageAsync({
        body: 'Hello world',
        userName: 'Tester',
        userUid: 'user-1',
      })
    })

    expect(createMessageMock).toHaveBeenCalledWith(1, {
      message: {
        body: 'Hello world',
        user_name: 'Tester',
        user_uid: 'user-1',
      },
    })

    const failedMessage: ChatMessage = {
      id: 'optimistic',
      chatroomId: 1,
      body: 'Hello world',
      userName: 'Tester',
      userUid: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'failed',
    }

    act(() => {
      result.current.retryMessage(failedMessage)
    })

    await waitFor(() => expect(createMessageMock).toHaveBeenCalledTimes(2))
  })
})
