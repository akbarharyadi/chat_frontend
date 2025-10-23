import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'

import { MessageComposer } from '@features/chat/components/MessageComposer'
import { renderWithProviders } from '@tests/testUtils'

/**
 * Unit tests for the message composer interactions.
 */
describe('MessageComposer', () => {
  it('submits a message on enter and clears the input', async () => {
    const handleSend = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByLabelText('Message body')
    await user.type(textarea, 'Hello world{enter}')

    expect(handleSend).toHaveBeenCalledTimes(1)
    expect(handleSend).toHaveBeenCalledWith('Hello world')
    expect(textarea).toHaveValue('')
  })

  it('allows multiline drafts with shift+enter and only sends when submitted', async () => {
    const handleSend = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByLabelText('Message body')
    await user.type(textarea, 'Line A{Shift>}{Enter}{/Shift}Line B')
    expect(handleSend).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(handleSend).toHaveBeenCalledTimes(1)
    expect(handleSend).toHaveBeenCalledWith('Line A\nLine B')
  })

  it('restores the draft if sending fails', async () => {
    const handleSend = vi.fn().mockRejectedValue(new Error('boom'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const user = userEvent.setup()

    renderWithProviders(<MessageComposer onSend={handleSend} />)

    const textarea = screen.getByLabelText('Message body')
    await user.type(textarea, 'retry me')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(handleSend).toHaveBeenCalledWith('retry me')
    expect(textarea).toHaveValue('retry me')

    consoleErrorSpy.mockRestore()
  })

  it('inserts emojis into the draft when selected from the picker', async () => {
    const handleSend = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithProviders(<MessageComposer onSend={handleSend} />)

    await user.click(screen.getByRole('button', { name: /open emoji picker/i }))
    const emojiButton = await screen.findByRole('button', { name: 'Insert emoji 😀' })
    await user.click(emojiButton)

    expect(screen.getByLabelText('Message body')).toHaveValue('😀')
  })
})
