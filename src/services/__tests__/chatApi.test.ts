import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chatApi } from '@services/chatApi'
import type { http as HttpFn } from '@services/httpClient'

const httpMock = vi.fn<HttpFn>()

vi.mock('@services/httpClient', () => ({
  http: httpMock,
}))

describe('chatApi', () => {
  beforeEach(() => {
    httpMock.mockReset()
  })

  it('fetches chatrooms', async () => {
    httpMock.mockResolvedValue([])
    await chatApi.listChatrooms()
    expect(httpMock).toHaveBeenCalledWith('/chatrooms')
  })

  it('creates chatrooms with payload', async () => {
    httpMock.mockResolvedValue({})
    await chatApi.createChatroom({ chatroom: { name: 'Support' } })
    expect(httpMock).toHaveBeenCalledWith('/chatrooms', {
      method: 'POST',
      body: { chatroom: { name: 'Support' } },
    })
  })

  it('retrieves messages for a chatroom', async () => {
    httpMock.mockResolvedValue([])
    await chatApi.listMessages(5)
    expect(httpMock).toHaveBeenCalledWith('/chatrooms/5/messages')
  })

  it('posts new chat messages', async () => {
    httpMock.mockResolvedValue({})
    await chatApi.createMessage(7, {
      message: { body: 'Hi', user_name: 'Alice', user_uid: 'alice' },
    })
    expect(httpMock).toHaveBeenCalledWith('/chatrooms/7/messages', {
      method: 'POST',
      body: { message: { body: 'Hi', user_name: 'Alice', user_uid: 'alice' } },
    })
  })
})
