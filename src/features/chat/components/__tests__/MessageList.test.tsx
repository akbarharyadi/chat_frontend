import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'

import { MessageList } from '@features/chat/components/MessageList'
import type { ChatMessage } from '@features/chat/types'
import { renderWithProviders } from '@tests/testUtils'

const baseTime = new Date('2024-01-01T12:00:00Z')

const makeMessage = (overrides: Partial<ChatMessage>): ChatMessage => ({
  id: overrides.id ?? crypto.randomUUID(),
  chatroomId: 1,
  body: overrides.body ?? 'Message body',
  userName: overrides.userName ?? 'Alice',
  userUid: overrides.userUid ?? 'alice-1',
  createdAt: overrides.createdAt ?? baseTime.toISOString(),
  updatedAt: overrides.updatedAt ?? baseTime.toISOString(),
  status: overrides.status ?? 'sent',
})

describe('MessageList', () => {
  it('renders placeholder when there are no messages', () => {
    renderWithProviders(
      <MessageList
        messages={[]}
        currentUserUid="me"
        onRetry={vi.fn()}
        isLoading={false}
      />,
    )

    expect(screen.getByText(/start the conversation/i)).toBeInTheDocument()
  })

  it('sorts messages chronologically before rendering', () => {
    const messages = [
      makeMessage({ id: '2', body: 'Later', createdAt: '2024-01-01T12:05:00Z' }),
      makeMessage({ id: '1', body: 'Earlier', createdAt: '2024-01-01T12:01:00Z' }),
    ]

    renderWithProviders(
      <MessageList
        messages={messages}
        currentUserUid="alice-1"
        onRetry={vi.fn()}
        isLoading={false}
      />,
    )

    const items = screen.getAllByText(/earlier|later/i)
    expect(items[0]).toHaveTextContent('Earlier')
    expect(items[1]).toHaveTextContent('Later')
  })
})
