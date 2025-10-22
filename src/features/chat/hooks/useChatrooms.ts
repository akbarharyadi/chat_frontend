import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryObserverResult } from '@tanstack/react-query'

import type { Chatroom } from '@features/chat/types'
import { mapChatroomDto } from '@features/chat/utils'
import { chatApi } from '@services/chatApi'
import type { ChatroomDto } from '@services/chatApi'
import type { HttpError } from '@services/httpClient'

interface UseChatroomsResult {
  chatrooms: Chatroom[]
  isLoading: boolean
  isError: boolean
  error: HttpError | null
  refetch: () => Promise<QueryObserverResult<Chatroom[], HttpError>>
  createChatroom: (name: string) => Promise<ChatroomDto>
  isCreating: boolean
  creationError: HttpError | null
}

// Shared query key for chatroom list operations.
const chatroomsQueryKey = ['chatrooms']

/**
 * Manages chatroom collection retrieval and creation flow using react-query.
 */
export const useChatrooms = (): UseChatroomsResult => {
  const queryClient = useQueryClient()

  // Load and cache chatroom metadata for room selector controls.
  const query = useQuery<Chatroom[], HttpError>({
    queryKey: chatroomsQueryKey,
    queryFn: async (): Promise<Chatroom[]> => {
      const chatrooms = await chatApi.listChatrooms()
      return chatrooms.map(mapChatroomDto)
    },
    staleTime: 1000 * 30,
  })

  // Mutation hook for creating chatrooms and updating the locally cached list.
  const mutation = useMutation<ChatroomDto, HttpError, string>({
    mutationFn: (name: string) =>
      chatApi.createChatroom({
        chatroom: { name },
      }),
    onSuccess: (dto) => {
      queryClient.setQueryData<Chatroom[]>(chatroomsQueryKey, (prev = []) => [
        ...prev,
        mapChatroomDto(dto),
      ])
    },
  })

  // Convenience wrapper returning the mutation promise for async/await callers.
  const createChatroom = (name: string) => mutation.mutateAsync(name)

  return {
    chatrooms: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => query.refetch(),
    createChatroom,
    isCreating: mutation.isPending,
    creationError: mutation.error ?? null,
  }
}
