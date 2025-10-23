import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatMobileSettingsDrawer } from '@features/chat/components/ChatMobileSettingsDrawer'
import type { ChatSidebarOption } from '@features/chat/components/ChatSidebarPanel'
import { renderWithProviders } from '@tests/testUtils'

const options: ChatSidebarOption[] = [
  { value: '1', label: 'General' },
  { value: '2', label: 'Random' },
]

describe('ChatMobileSettingsDrawer', () => {
  it('triggers open and close handlers and forwards interactions', async () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()
    const onSelectChatroom = vi.fn()
    const onCreateChatroom = vi.fn()
    const onDisplayNameChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ChatMobileSettingsDrawer
        opened
        chatroomOptions={options}
        activeChatroomId={1}
        isLoadingChatrooms={false}
        displayName="Calm Hawk"
        chatroomCount={2}
        onOpen={onOpen}
        onClose={onClose}
        onSelectChatroom={onSelectChatroom}
        onCreateChatroom={onCreateChatroom}
        onDisplayNameChange={onDisplayNameChange}
      />,
    )

    // Floating button invokes onOpen
    await user.click(screen.getByRole('button', { name: /open chat settings/i }))
    expect(onOpen).toHaveBeenCalledTimes(1)

    // Update display name through text input
    const nameInput = screen.getByPlaceholderText(/how should we call you/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'New Name')
    expect(onDisplayNameChange).toHaveBeenCalled()

    // Select a different chatroom
    await user.click(screen.getByPlaceholderText(/choose a chatroom/i))
    await user.click(await screen.findByText('Random'))
    expect(onSelectChatroom).toHaveBeenCalledWith(2)

    await user.click(screen.getByRole('button', { name: /new chatroom/i }))
    expect(onCreateChatroom).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
