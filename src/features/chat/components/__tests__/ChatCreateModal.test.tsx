import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ChatCreateModal } from '@features/chat/components/ChatCreateModal'
import { renderWithProviders } from '@tests/testUtils'

describe('ChatCreateModal', () => {
  it('handles name change, cancel, and submit actions', async () => {
    const onNameChange = vi.fn()
    const onClose = vi.fn()
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ChatCreateModal
        opened
        chatroomName="Support"
        isSubmitting={false}
        onNameChange={onNameChange}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    )

    const input = screen.getByLabelText(/chatroom name/i)
    await user.clear(input)
    await user.type(input, 'Support Plus')
    expect(onNameChange).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /create/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
