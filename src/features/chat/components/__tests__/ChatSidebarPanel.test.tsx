import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatSidebarPanel } from '@features/chat/components/ChatSidebarPanel'
import { renderWithProviders } from '@tests/testUtils'

describe('ChatSidebarPanel', () => {
  const baseProps = {
    chatroomOptions: [
      { value: '1', label: 'General' },
      { value: '2', label: 'Random' },
    ],
    activeChatroomId: 1,
    onSelectChatroom: vi.fn(),
    isLoadingChatrooms: false,
    onCreateChatroom: vi.fn(),
    displayName: 'Calm Hawk',
    onDisplayNameChange: vi.fn(),
    chatroomCount: 2,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders chatroom selector and dispatches selection events', async () => {
    renderWithProviders(<ChatSidebarPanel {...baseProps} />)
    const user = userEvent.setup()

    await user.click(screen.getByPlaceholderText(/choose a chatroom/i))
    await user.click(await screen.findByText('Random'))

    expect(baseProps.onSelectChatroom).toHaveBeenCalledWith(2)
  })

  it('allows editing the display name and creating chatrooms', async () => {
    renderWithProviders(<ChatSidebarPanel {...baseProps} />)
    const user = userEvent.setup()

    const input = screen.getByPlaceholderText(/how should we call you/i)
    fireEvent.change(input, { target: { value: 'New Name' } })
    expect(baseProps.onDisplayNameChange).toHaveBeenCalledWith('New Name')

    await user.click(screen.getByRole('button', { name: /new chatroom/i }))
    expect(baseProps.onCreateChatroom).toHaveBeenCalledTimes(1)
  })
})
