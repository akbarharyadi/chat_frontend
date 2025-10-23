import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { http, HttpError } from '@services/httpClient'

vi.mock('@lib/env', () => ({
  env: {
    chatApiUrl: 'https://api.example.test',
    chatWsUrl: 'wss://ws.example.test',
  },
}))

const fetchMock = vi.fn()

describe('httpClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns parsed JSON payload for successful responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ message: 'ok' }),
    })

    const result = await http<{ message: string }>('/ping')

    expect(result).toEqual({ message: 'ok' })
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, options] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(url).toBeInstanceOf(URL)
    expect(url.href).toBe('https://api.example.test/ping')
    expect(options).toMatchObject({ method: 'GET' })
  })

  it('throws HttpError when the response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server error',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ message: 'Boom' }),
    })

    await expect(http('/boom')).rejects.toBeInstanceOf(HttpError)
  })
})
