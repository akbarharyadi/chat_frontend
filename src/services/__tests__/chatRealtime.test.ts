import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { subscribeToChatroom } from '@services/chatRealtime'

vi.mock('@lib/env', () => ({
  env: {
    chatApiUrl: 'https://api.example.test',
    chatWsUrl: 'wss://ws.example.test',
  },
}))

interface SubscriptionHandlers {
  connected?: () => void
  disconnected?: () => void
  received?: (payload: unknown) => void
}

interface MockSubscription {
  unsubscribe: () => void
}
type SubscriptionCreate = (
  params: unknown,
  callbacks: SubscriptionHandlers,
) => MockSubscription
interface MockConsumer {
  subscriptions: {
    create: SubscriptionCreate
    remove: (subscription: unknown) => void
  }
}
type CreateConsumer = (...args: unknown[]) => MockConsumer

const { createConsumerMock } = vi.hoisted(() => ({
  createConsumerMock: vi.fn<CreateConsumer>(),
}))

vi.mock(
  '@rails/actioncable',
  () =>
    ({
      createConsumer: createConsumerMock,
    }) satisfies { createConsumer: CreateConsumer },
)

describe('subscribeToChatroom', () => {
  let unsubscribeSpy: ReturnType<typeof vi.fn>
  let removeSpy: ReturnType<typeof vi.fn>
  let callbacks: SubscriptionHandlers | undefined

  beforeEach(() => {
    unsubscribeSpy = vi.fn()
    removeSpy = vi.fn()
    callbacks = undefined
    createConsumerMock.mockReset()

    const subscriptions: MockConsumer['subscriptions'] = {
      create: (_params, cb) => {
        callbacks = cb
        return {
          unsubscribe: () => {
            unsubscribeSpy()
          },
        }
      },
      remove: () => {
        removeSpy()
      },
    }

    createConsumerMock.mockReturnValue({ subscriptions })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('proxies Action Cable events to provided handlers', () => {
    const handlers = {
      onConnected: vi.fn(),
      onDisconnected: vi.fn(),
      onMessage: vi.fn(),
      onError: vi.fn(),
    }

    const cleanup = subscribeToChatroom(1, handlers)

    expect(createConsumerMock).toHaveBeenCalled()
    callbacks?.connected?.()
    callbacks?.disconnected?.()
    callbacks?.received?.({ body: 'hi' })

    expect(handlers.onConnected).toHaveBeenCalled()
    expect(handlers.onDisconnected).toHaveBeenCalled()
    expect(handlers.onMessage).toHaveBeenCalledWith({ body: 'hi' })

    cleanup()
    expect(removeSpy).toHaveBeenCalled()
  })
})
