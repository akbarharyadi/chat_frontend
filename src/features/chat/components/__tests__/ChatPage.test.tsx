import { act, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@tests/testUtils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatMessagesPanelProps } from '@features/chat/components/ChatMessagesPanel'
import type { ChatSidebarPanelProps } from '@features/chat/components/ChatSidebarPanel'
import type { ChatCreateModalProps } from '@features/chat/components/ChatCreateModal'
import type { Chatroom, ChatMessage } from '@features/chat/types'

let latestMessagesPanelProps: ChatMessagesPanelProps | undefined
const chatMessagesPanelMock = vi.fn((props: ChatMessagesPanelProps) => {
  latestMessagesPanelProps = props
  return <div data-testid="chat-messages-panel" />
})

let latestSidebarPanelProps: ChatSidebarPanelProps | undefined
const chatSidebarPanelMock = vi.fn((props: ChatSidebarPanelProps) => {
  latestSidebarPanelProps = props
  return <div data-testid="chat-sidebar-panel" />
})

const chatMobileSettingsDrawerMock = vi.fn(() => (
  <div data-testid="chat-mobile-settings-drawer" />
))

let latestCreateModalProps: ChatCreateModalProps | undefined
const chatCreateModalMock = vi.fn((props: ChatCreateModalProps) => {
  latestCreateModalProps = props
  return <div data-testid="chat-create-modal" />
})

vi.mock('@features/chat/components/ChatMessagesPanel', () => ({
  ChatMessagesPanel: (props: ChatMessagesPanelProps) => chatMessagesPanelMock(props),
}))

vi.mock('@features/chat/components/ChatSidebarPanel', () => ({
  ChatSidebarPanel: (props: ChatSidebarPanelProps) => chatSidebarPanelMock(props),
}))

vi.mock('@features/chat/components/ChatMobileSettingsDrawer', () => ({
  ChatMobileSettingsDrawer: (props: ChatMobileSettingsDrawerProps) =>
    chatMobileSettingsDrawerMock(props),
}))

vi.mock('@features/chat/components/ChatCreateModal', () => ({
  ChatCreateModal: (props: ChatCreateModalProps) => chatCreateModalMock(props),
}))

vi.mock('@features/chat/hooks/useChatrooms', () => ({
  useChatrooms: vi.fn(),
}))

vi.mock('@features/chat/hooks/useChatRoom', () => ({
  useChatRoom: vi.fn(),
}))

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}))

vi.mock('@lib/userIdentity', () => ({
  getStoredIdentity: vi.fn(),
  setStoredIdentity: vi.fn(),
}))

vi.mock('@mantine/hooks', async () => {
  const actual = await vi.importActual<unknown>('@mantine/hooks')

  if (!actual || typeof actual !== 'object') {
    return {
      useMediaQuery: vi.fn(),
    }
  }

  const actualRecord = actual as Record<string, unknown>

  return {
    ...actualRecord,
    useMediaQuery: vi.fn(),
  }
})

import { notifications } from '@mantine/notifications'
import { useMediaQuery } from '@mantine/hooks'
import { useChatRoom } from '@features/chat/hooks/useChatRoom'
import { useChatrooms } from '@features/chat/hooks/useChatrooms'
import { getStoredIdentity } from '@lib/userIdentity'
import { ChatPage } from '../ChatPage'

const useChatroomsMock = vi.mocked(useChatrooms)
const useChatRoomMock = vi.mocked(useChatRoom)
const useMediaQueryMock = vi.mocked(useMediaQuery)
const getStoredIdentityMock = vi.mocked(getStoredIdentity)
const notificationsShowMock = vi.mocked(notifications.show)

const baseChatrooms: Chatroom[] = [
  {
    id: 1,
    name: 'General',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Random',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

const createChatroomMock = vi.fn<
  Promise<{ id: number; name: string; created_at?: string; updated_at?: string }>,
  [string]
>()
const sendMessageAsyncMock = vi.fn().mockResolvedValue(undefined)
const retryMessageMock = vi.fn()
const sendMessageMock = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  latestMessagesPanelProps = undefined
  latestSidebarPanelProps = undefined
  latestCreateModalProps = undefined

  useMediaQueryMock.mockReturnValue(false)

  getStoredIdentityMock.mockReturnValue({
    userUid: 'user-123',
    userName: 'Alice Example',
  })

  createChatroomMock.mockResolvedValue({
    id: 3,
    name: 'New room',
    created_at: '2024-01-03T00:00:00.000Z',
    updated_at: '2024-01-03T00:00:00.000Z',
  })

  useChatroomsMock.mockReturnValue({
    chatrooms: baseChatrooms.map((room) => ({ ...room })),
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    createChatroom: createChatroomMock,
    isCreating: false,
    creationError: null,
  })

  useChatRoomMock.mockImplementation(() => ({
    messages: [],
    isLoading: false,
    isFetching: false,
    sendMessage: sendMessageMock,
    sendMessageAsync: sendMessageAsyncMock,
    retryMessage: retryMessageMock,
    connectionStatus: 'connected',
    latestError: undefined,
    isSending: false,
  }))
})

describe('ChatPage', () => {
  it('preselects the first chatroom on desktop and updates selection via sidebar', async () => {
    renderWithProviders(<ChatPage />)

    await waitFor(() => {
      expect(chatMessagesPanelMock).toHaveBeenCalled()
    })

    expect(latestMessagesPanelProps?.activeChatroomName).toBe('General')
    expect(latestMessagesPanelProps?.hasActiveChatroom).toBe(true)
    expect(useChatRoomMock.mock.calls.at(-1)?.[0]).toBe(1)

    expect(chatSidebarPanelMock).toHaveBeenCalled()
    expect(latestSidebarPanelProps?.chatroomOptions).toEqual([
      { value: '1', label: 'General' },
      { value: '2', label: 'Random' },
    ])
    expect(latestSidebarPanelProps?.activeChatroomId).toBe(1)

    act(() => {
      latestSidebarPanelProps?.onSelectChatroom(2)
    })

    await waitFor(() => {
      const latestCall = chatMessagesPanelMock.mock.calls.at(-1)
      expect(latestCall).toBeDefined()
      const [latestProps] = latestCall!
      expect(latestProps.activeChatroomName).toBe('Random')
      expect(latestProps.hasActiveChatroom).toBe(true)
    })
    expect(useChatRoomMock.mock.calls.at(-1)?.[0]).toBe(2)
  })

  it('uses a trimmed identity name when sending messages', async () => {
    getStoredIdentityMock.mockReturnValue({
      userUid: 'sender-1',
      userName: '  Bob  ',
    })

    renderWithProviders(<ChatPage />)

    await waitFor(() => {
      expect(latestMessagesPanelProps?.onSendMessage).toBeDefined()
    })

    await act(async () => {
      await latestMessagesPanelProps?.onSendMessage('Hello there')
    })

    expect(sendMessageAsyncMock).toHaveBeenCalledWith({
      body: 'Hello there',
      userName: 'Bob',
      userUid: 'sender-1',
    })
  })

  it('falls back to a Guest name when identity is blank', async () => {
    getStoredIdentityMock.mockReturnValue({
      userUid: 'guest-1',
      userName: '   ',
    })

    renderWithProviders(<ChatPage />)

    await waitFor(() => {
      expect(latestMessagesPanelProps?.onSendMessage).toBeDefined()
    })

    await act(async () => {
      await latestMessagesPanelProps?.onSendMessage('Hello world')
    })

    expect(sendMessageAsyncMock).toHaveBeenCalledWith({
      body: 'Hello world',
      userName: 'Guest',
      userUid: 'guest-1',
    })
  })

  it('delegates retry handler from message panel to chat room hook', async () => {
    renderWithProviders(<ChatPage />)

    await waitFor(() => {
      expect(latestMessagesPanelProps?.onRetry).toBeDefined()
    })

    const failedMessage: ChatMessage = {
      id: 'msg-1',
      chatroomId: 1,
      body: 'Retry me',
      userName: 'Bob',
      userUid: 'sender-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      status: 'failed',
    }

    latestMessagesPanelProps?.onRetry(failedMessage)

    expect(retryMessageMock).toHaveBeenCalledWith(failedMessage)
  })

  it('shows a validation warning when creating a chatroom without a name', () => {
    renderWithProviders(<ChatPage />)

    act(() => {
      latestCreateModalProps?.onSubmit()
    })

    expect(notificationsShowMock).toHaveBeenCalledWith({
      color: 'yellow',
      title: 'Name required',
      message: 'Please provide a chatroom name.',
    })
  })

  it('creates a chatroom and switches context when submission succeeds', async () => {
    createChatroomMock.mockResolvedValue({
      id: 99,
      name: 'Support',
      created_at: '2024-01-05T00:00:00.000Z',
      updated_at: '2024-01-05T00:00:00.000Z',
    })

    renderWithProviders(<ChatPage />)

    act(() => {
      latestCreateModalProps?.onNameChange('  Support  ')
    })

    await act(async () => {
      latestCreateModalProps?.onSubmit()
      await Promise.resolve()
    })

    expect(createChatroomMock).toHaveBeenCalledWith('Support')

    await waitFor(() => {
      expect(notificationsShowMock).toHaveBeenCalledWith({
        color: 'teal',
        title: 'Chatroom created',
        message: 'Joined Support',
      })
    })

    await waitFor(() => {
      expect(useChatRoomMock.mock.calls.at(-1)?.[0]).toBe(99)
    })
  })

  it('surfaces latest chat errors as notifications', async () => {
    useChatRoomMock.mockImplementation(() => ({
      messages: [],
      isLoading: false,
      isFetching: false,
      sendMessage: sendMessageMock,
      sendMessageAsync: sendMessageAsyncMock,
      retryMessage: retryMessageMock,
      connectionStatus: 'disconnected',
      latestError: 'Something went wrong',
      isSending: false,
    }))

    renderWithProviders(<ChatPage />)

    await waitFor(() => {
      expect(notificationsShowMock).toHaveBeenCalledWith({
        color: 'red',
        title: 'Chat error',
        message: 'Something went wrong',
      })
    })
  })
})
