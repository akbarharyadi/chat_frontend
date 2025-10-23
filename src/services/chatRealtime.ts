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

/**
 * Cleanup callback returned to consumers for tearing down the subscription.
 */
type SubscriptionCleanup = () => void

let consumer: ReturnType<typeof createConsumer> | null = null

/**
 * Lazily instantiate a single Action Cable consumer tied to the configured URL.
 *
 * @returns Shared Action Cable consumer instance.
 */
const getConsumer = () => {
  consumer ??= createConsumer(env.chatWsUrl)
  return consumer
}

/**
 * Subscribe to the backend ChatroomChannel and relay messages through typed handlers.
 *
 * @param chatroomId - Server-side identifier for the chatroom subscription.
 * @param handlers - Callback map invoked as the Action Cable lifecycle progresses.
 * @returns Cleanup function that unsubscribes from the channel.
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
