import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatMessageItem } from '@features/chat/components/ChatMessageItem'
import type { ChatMessage } from '@features/chat/types'
import { renderWithProviders } from '@tests/testUtils'

const baseMessage: ChatMessage = {
  id: '1',
  chatroomId: 1,
  body: 'Hello from Alice',
  userName: 'Alice',
  userUid: 'alice-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'sent',
}

describe('ChatMessageItem', () => {
  it('renders other participant messages with avatar and timestamp', () => {
    renderWithProviders(
      <ChatMessageItem message={baseMessage} isOwnMessage={false} onRetry={vi.fn()} />,
    )

    expect(screen.getByText('Hello from Alice')).toBeInTheDocument()
    expect(screen.getByText('AL')).toBeInTheDocument()
    const authorLabel = screen.getAllByText(/alice/i, { selector: 'p' })[0]
    expect(authorLabel).toBeInTheDocument()
  })

  it('renders own messages aligned to the right', () => {
    renderWithProviders(
      <ChatMessageItem
        message={{ ...baseMessage, userName: 'You', userUid: 'me', body: 'My note' }}
        isOwnMessage
        onRetry={vi.fn()}
      />,
    )

    const row = screen.getByText('My note').closest('.chat-message-item')
    expect(row).not.toBeNull()
    expect((row as HTMLElement).dataset.own).toBe('true')
  })

  it('exposes retry control when a message fails', async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <ChatMessageItem
        message={{ ...baseMessage, status: 'failed' }}
        isOwnMessage={false}
        onRetry={onRetry}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /retry sending/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
