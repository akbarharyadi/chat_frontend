import { env } from '@lib/env'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpRequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface HttpErrorPayload {
  errors?: string[] | Record<string, unknown>
  message?: string
}

/**
 * Error wrapper for failed API responses with HTTP status and payload.
 */
export class HttpError extends Error {
  status: number
  payload?: HttpErrorPayload

  constructor(status: number, message: string, payload?: HttpErrorPayload) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.payload = payload
  }
}

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

// Runtime check to guard against non-JSON error payloads.
const isHttpErrorPayload = (value: unknown): value is HttpErrorPayload =>
  typeof value === 'object' && value !== null

/**
 * Minimal fetch wrapper that prefixes the chat base URL and normalises errors.
 */
export async function http<TResponse, TBody = unknown>(
  path: string,
  options: HttpRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers = {}, signal } = options
  const url = new URL(path, env.chatApiUrl)

  const response = await fetch(url, {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  const isJson =
    response.headers.get('content-type')?.includes('application/json') ?? false
  const payload: unknown = isJson ? await response.json() : undefined

  if (!response.ok) {
    const errorPayload = isHttpErrorPayload(payload) ? payload : undefined
    const message = errorPayload?.message ?? response.statusText ?? 'Unexpected API error'
    throw new HttpError(response.status, message, errorPayload)
  }

  return payload as TResponse
}
