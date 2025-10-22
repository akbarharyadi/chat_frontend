import { useCallback, useEffect, useMemo, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ConnectionStatus,
  ChatMessage,
  SendMessageInput,
} from '@features/chat/types'
import { mapMessageDto, mergeMessages } from '@features/chat/utils'
import type { ChatMessageDto } from '@services/chatApi'
import { chatApi } from '@services/chatApi'
import { subscribeToChatroom } from '@services/chatRealtime'
import { HttpError } from '@services/httpClient'

interface UseChatRoomResult {
  messages: ChatMessage[]
  isLoading: boolean
  isFetching: boolean
  sendMessage: (payload: SendMessageInput) => void
  sendMessageAsync: (payload: SendMessageInput) => Promise<ChatMessageDto>
  retryMessage: (message: ChatMessage) => void
  connectionStatus: ConnectionStatus
  latestError?: string
  isSending: boolean
}

interface MessageMutationContext {
  optimisticId: string
}

// Generate a unique identifier for optimistic message placeholders.
const createOptimisticId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `optimistic-${crypto.randomUUID()}`
  }
  return `optimistic-${Math.random().toString(36).slice(2, 11)}`
}

// Compose the react-query key for message collections.
const messagesQueryKey = (chatroomId: number) =>
  ['chatrooms', chatroomId, 'messages'] as const

// Convert a server DTO to the UI-friendly message shape.
const toMessage = (dto: ChatMessageDto): ChatMessage => mapMessageDto(dto)

// Normalise any error object into a human-friendly string.
const extractErrorMessage = (error: unknown) => {
  if (error instanceof HttpError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return undefined
}

/**
 * Hook that streams chat messages for a room, handles optimistic sends,
 * and exposes connection status metadata.
 */
export const useChatRoom = (chatroomId: number | null): UseChatRoomResult => {
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')

  // Retrieve historical messages while caching results between room switches.
  const messagesQuery = useQuery<ChatMessage[], HttpError>({
    queryKey: messagesQueryKey(chatroomId ?? -1),
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!chatroomId) {
        return []
      }
      const dtos = await chatApi.listMessages(chatroomId)
      return dtos.map(toMessage)
    },
    enabled: Boolean(chatroomId),
    staleTime: 1000 * 15,
    refetchOnWindowFocus: true,
  })

  // Subscribe to Action Cable updates and merge incoming messages in realtime.
  useEffect(() => {
    if (!chatroomId) {
      setConnectionStatus('disconnected')
      return
    }

    setConnectionStatus('connecting')

    const unsubscribe = subscribeToChatroom(chatroomId, {
      onConnected: () => setConnectionStatus('connected'),
      onDisconnected: () => setConnectionStatus('disconnected'),
      onError: () => setConnectionStatus('disconnected'),
      onMessage: (dto: ChatMessageDto) => {
        const message = toMessage(dto)
        queryClient.setQueryData<ChatMessage[]>(
          messagesQueryKey(chatroomId),
          (prev = []) => {
            const withoutOptimistic = prev.filter(
              (existing) =>
                !(
                  existing.isLocal &&
                  existing.status !== 'sent' &&
                  existing.userUid === message.userUid &&
                  existing.body.trim() === message.body.trim()
                ),
            )
            return mergeMessages(withoutOptimistic, message)
          },
        )
      },
    })

    return () => {
      unsubscribe()
    }
  }, [chatroomId, queryClient])

  // Mutation pipeline used to post messages with optimistic UI updates.
  const mutation = useMutation<
    ChatMessageDto,
    HttpError,
    SendMessageInput,
    MessageMutationContext | undefined
  >({
    mutationFn: ({ body, userName, userUid }) => {
      if (!chatroomId) {
        throw new Error('Chatroom not selected')
      }
      return chatApi.createMessage(chatroomId, {
        message: {
          body,
          user_name: userName,
          user_uid: userUid,
        },
      })
    },
    onMutate: async (variables) => {
      if (!chatroomId) {
        return undefined
      }
      await queryClient.cancelQueries({ queryKey: messagesQueryKey(chatroomId) })
      const optimisticId = createOptimisticId()
      const optimisticMessage: ChatMessage = {
        id: optimisticId,
        chatroomId,
        body: variables.body,
        userName: variables.userName,
        userUid: variables.userUid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sending',
        isLocal: true,
      }
      queryClient.setQueryData<ChatMessage[]>(
        messagesQueryKey(chatroomId),
        (prev = []) => [...prev, optimisticMessage],
      )

      return { optimisticId }
    },
    onError: (_error, _variables, context) => {
      if (!chatroomId || !context?.optimisticId) {
        return
      }
      queryClient.setQueryData<ChatMessage[]>(messagesQueryKey(chatroomId), (prev = []) =>
        prev.map((message) =>
          message.id === context.optimisticId
            ? { ...message, status: 'failed' }
            : message,
        ),
      )
    },
    onSuccess: (dto, _variables, context) => {
      if (!chatroomId) {
        return
      }
      const message = toMessage(dto)
      mutation.reset()
      queryClient.setQueryData<ChatMessage[]>(
        messagesQueryKey(chatroomId),
        (prev = []) => {
          const withoutOptimistic = context?.optimisticId
            ? prev.filter((item) => item.id !== context.optimisticId)
            : prev
          return mergeMessages(withoutOptimistic, message)
        },
      )
    },
    onSettled: (_data, _error, _variables) => {
      if (!chatroomId) {
        return
      }
      void queryClient.invalidateQueries({ queryKey: messagesQueryKey(chatroomId) })
    },
  })

  // Fire-and-forget variant used by UI components.
  const sendMessage = useCallback(
    (payload: SendMessageInput) => mutation.mutate(payload),
    [mutation],
  )

  // Async variant that enables awaiting the mutation result.
  const sendMessageAsync = useCallback(
    (payload: SendMessageInput) => mutation.mutateAsync(payload),
    [mutation],
  )

  // Re-run the mutation with data from a failed message.
  const retryMessage = useCallback(
    (message: ChatMessage) => {
      sendMessage({
        body: message.body,
        userName: message.userName,
        userUid: message.userUid,
      })
    },
    [sendMessage],
  )

  // Derive latest error string from either the query or mutation pipelines.
  const latestError = useMemo(
    () => extractErrorMessage(mutation.error) ?? extractErrorMessage(messagesQuery.error),
    [messagesQuery.error, mutation.error],
  )

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    isFetching: messagesQuery.isFetching,
    sendMessage,
    sendMessageAsync,
    retryMessage,
    connectionStatus,
    latestError,
    isSending: mutation.isPending,
  }
}
