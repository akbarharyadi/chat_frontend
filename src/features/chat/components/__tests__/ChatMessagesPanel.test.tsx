import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatMessagesPanel } from '@features/chat/components/ChatMessagesPanel'
import type { ChatMessage } from '@features/chat/types'
import { renderWithProviders } from '@tests/testUtils'

const noopMessage: ChatMessage = {
  id: '1',
  chatroomId: 1,
  body: 'Hello world',
  userName: 'Alice',
  userUid: 'alice-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'sent',
}

describe('ChatMessagesPanel', () => {
  it('shows loader while chatrooms are loading', () => {
    renderWithProviders(
      <ChatMessagesPanel
        isMobile={false}
        isLoadingChatrooms
        hasActiveChatroom={false}
        activeChatroomName="General"
        connectionStatus="connecting"
        messages={[]}
        currentUserUid="user-1"
        onRetry={vi.fn()}
        isLoadingMessages={false}
        onSendMessage={vi.fn()}
        isSending={false}
        isDisconnected={false}
        onCreateChatroom={vi.fn()}
      />,
    )

    expect(screen.getByText(/loading chatrooms/i)).toBeInTheDocument()
  })

  it('renders empty state when no chatroom is selected', async () => {
    const onCreateChatroom = vi.fn()
    renderWithProviders(
      <ChatMessagesPanel
        isMobile={false}
        isLoadingChatrooms={false}
        hasActiveChatroom={false}
        activeChatroomName="General"
        connectionStatus="disconnected"
        messages={[]}
        currentUserUid="user-1"
        onRetry={vi.fn()}
        isLoadingMessages={false}
        onSendMessage={vi.fn()}
        isSending={false}
        isDisconnected={false}
        onCreateChatroom={onCreateChatroom}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /new chatroom/i }))
    expect(onCreateChatroom).toHaveBeenCalledTimes(1)
  })

  it('renders active chatroom content and forwards composer submits', async () => {
    const onSendMessage = vi.fn().mockResolvedValue(undefined)
    renderWithProviders(
      <ChatMessagesPanel
        isMobile={false}
        isLoadingChatrooms={false}
        hasActiveChatroom
        activeChatroomName="General"
        connectionStatus="connected"
        messages={[noopMessage]}
        currentUserUid="alice-1"
        onRetry={vi.fn()}
        isLoadingMessages={false}
        onSendMessage={onSendMessage}
        isSending={false}
        isDisconnected={false}
        onCreateChatroom={vi.fn()}
      />,
    )

    expect(screen.getByText(/current chatroom/i)).toBeInTheDocument()
    expect(screen.getByText(noopMessage.body)).toBeInTheDocument()

    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/message body/i), 'Test message')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(onSendMessage).toHaveBeenCalledWith('Test message')
  })
})
