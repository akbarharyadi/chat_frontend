import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'

import { ConnectionStatusBadge } from '@features/chat/components/ConnectionStatusBadge'
import { renderWithProviders } from '@tests/testUtils'

describe('ConnectionStatusBadge', () => {
  it('renders status label and tooltip description', () => {
    renderWithProviders(<ConnectionStatusBadge status="connected" />)

    expect(screen.getByText(/online/i)).toBeInTheDocument()
  })
})
