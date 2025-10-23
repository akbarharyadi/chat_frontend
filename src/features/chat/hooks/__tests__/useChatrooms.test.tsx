import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import type { PropsWithChildren, ReactElement } from 'react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useChatrooms } from '@features/chat/hooks/useChatrooms'
import { createTestQueryClient } from '@tests/testUtils'
import { chatApi } from '@services/chatApi'

vi.mock('@services/chatApi', () => {
  const listChatrooms = vi.fn()
  const createChatroom = vi.fn()
  return {
    chatApi: {
      listChatrooms,
      createChatroom,
    },
  }
})

const mockedChatApi = vi.mocked(chatApi)

/**
 * Provide Mantine + react-query context for the hooks under test.
 */
const buildWrapper = (queryClient = createTestQueryClient()) => {
  const Wrapper = ({ children }: PropsWithChildren): ReactElement => (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MantineProvider>
  )
  return { Wrapper, queryClient }
}

describe('useChatrooms', () => {
  beforeEach(() => {
    mockedChatApi.listChatrooms.mockResolvedValue([
      { id: 1, name: 'General', created_at: '2024-01-01', updated_at: '2024-01-01' },
      { id: 2, name: 'Support', created_at: '2024-01-02', updated_at: '2024-01-02' },
    ])
    mockedChatApi.createChatroom.mockRejectedValue(new Error('not stubbed'))
  })

  it('returns chatrooms from the API', async () => {
    const { Wrapper } = buildWrapper()
    const { result } = renderHook(() => useChatrooms(), { wrapper: Wrapper })

    await waitFor(() => {
      expect(result.current.chatrooms).toHaveLength(2)
    })
    expect(result.current.chatrooms[0]?.name).toBe('General')
  })

  it('appends newly created chatrooms to the cache', async () => {
    const { queryClient, Wrapper } = buildWrapper()

    mockedChatApi.createChatroom.mockResolvedValue({
      id: 3,
      name: 'Announcements',
      created_at: '2024-01-03',
      updated_at: '2024-01-03',
    })

    const { result } = renderHook(() => useChatrooms(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.chatrooms).toHaveLength(2))

    await act(async () => {
      await result.current.createChatroom('Announcements')
    })

    const cached = queryClient.getQueryData(['chatrooms'])
    expect(cached).toEqual([
      { id: 1, name: 'General', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: 2, name: 'Support', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
      { id: 3, name: 'Announcements', createdAt: '2024-01-03', updatedAt: '2024-01-03' },
    ])
  })
})
