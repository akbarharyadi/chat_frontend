import { createConsumer } from '@rails/actioncable'

import { env } from '@lib/env'
import type { ChatMessageDto } from '@services/chatApi'

/**
 * Contract for lifecycle callbacks emitted by the Action Cable subscription.
 */
interface SubscriptionHandlers {
  onConnected?: () => void
  onDisconnected?: () => void
  onMessage: (message: ChatMessageDto) => void
  onError?: (error: unknown) => void
}

type SubscriptionCleanup = () => void

let consumer: ReturnType<typeof createConsumer> | null = null

// Lazily instantiate a single Action Cable consumer tied to the configured URL.
const getConsumer = () => {
  consumer ??= createConsumer(env.chatWsUrl)
  return consumer
}

/**
 * Subscribe to the backend ChatroomChannel and relay messages through typed handlers.
 */
export const subscribeToChatroom = (
  chatroomId: number,
  handlers: SubscriptionHandlers,
): SubscriptionCleanup => {
  const { onConnected, onDisconnected, onMessage, onError } = handlers
  const cable = getConsumer()
  let isActive = true

  const subscription = cable.subscriptions.create(
    { channel: 'ChatroomChannel', chatroom_id: chatroomId },
    {
      connected() {
        onConnected?.()
      },
      disconnected() {
        isActive = false
        onDisconnected?.()
      },
      received(data: unknown) {
        try {
          onMessage(data as ChatMessageDto)
        } catch (error) {
          onError?.(error)
        }
      },
      rejected() {
        isActive = false
        onError?.(new Error(`Subscription rejected for chatroom ${chatroomId}`))
      },
    },
  )

  return () => {
    if (isActive) {
      subscription.unsubscribe()
    }
    cable.subscriptions.remove(subscription)
  }
}
