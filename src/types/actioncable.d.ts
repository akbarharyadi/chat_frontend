declare module '@rails/actioncable' {
  export interface ActionCableSubscription {
    unsubscribe(): void
  }

  export interface ActionCableSubscriptions {
    create(
      params: Record<string, unknown>,
      callbacks: Partial<{
        initialized(): void
        connected(): void
        disconnected(): void
        received(data: unknown): void
        rejected(): void
      }>,
    ): ActionCableSubscription
    remove(subscription: ActionCableSubscription): void
  }

  export interface ActionCableConsumer {
    subscriptions: ActionCableSubscriptions
  }

  export function createConsumer(url?: string): ActionCableConsumer
}
