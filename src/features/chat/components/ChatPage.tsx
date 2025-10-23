import { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Stack, Grid } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'

import { ChatCreateModal } from '@features/chat/components/ChatCreateModal'
import { ChatHeader } from '@features/chat/components/ChatHeader'
import { ChatMessagesPanel } from '@features/chat/components/ChatMessagesPanel'
import { ChatMobileSettingsDrawer } from '@features/chat/components/ChatMobileSettingsDrawer'
import { ChatSidebarPanel } from '@features/chat/components/ChatSidebarPanel'
import { useChatRoom } from '@features/chat/hooks/useChatRoom'
import { useChatrooms } from '@features/chat/hooks/useChatrooms'
import { useIncomingMessageFeedback } from '@features/chat/hooks/useIncomingMessageFeedback'
import type { ChatMessage, Chatroom } from '@features/chat/types'
import { getStoredIdentity, setStoredIdentity } from '@lib/userIdentity'

/**
 * Transform a chatroom model into the { value, label } shape required by Mantine's
 * select component.
 *
 * @param chatroom - Chatroom entity sourced from the chatrooms hook.
 * @returns Select option containing stringified id and label.
 */
const mapChatroomOption = (chatroom: Chatroom) => ({
  value: String(chatroom.id),
  label: chatroom.name,
})

/**
 * Feature page orchestrating chatroom discovery, realtime messaging and profile
 * management. UI responsibilities are delegated to smaller presentation components
 * while this container manages state and side-effects.
 *
 * @returns Fully composed chat experience with providers already in place.
 */
export const ChatPage = () => {
  const {
    chatrooms,
    isLoading: isLoadingChatrooms,
    createChatroom,
    isCreating,
  } = useChatrooms()
  const [activeChatroomId, setActiveChatroomId] = useState<number | null>(null)
  const [identity, setIdentity] = useState(() => getStoredIdentity())
  const [isCreateModalOpen, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false)
  const [newChatroomName, setNewChatroomName] = useState('')
  const isMobile = useMediaQuery('(max-width: 48em)') ?? false
  const [isSettingsDrawerOpen, { open: openSettingsDrawer, close: closeSettingsDrawer }] =
    useDisclosure(false)

  useEffect(() => {
    if (chatrooms.length === 0) {
      setActiveChatroomId(null)
      return
    }

    setActiveChatroomId((current) => current ?? chatrooms[0]?.id ?? null)
  }, [chatrooms])

  const chatroomOptions = useMemo(() => chatrooms.map(mapChatroomOption), [chatrooms])

  const {
    messages,
    isLoading: isLoadingMessages,
    sendMessageAsync,
    retryMessage,
    connectionStatus,
    latestError,
    isSending,
  } = useChatRoom(activeChatroomId)

  useEffect(() => {
    if (!latestError) {
      return
    }
    notifications.show({
      color: 'red',
      title: 'Chat error',
      message: latestError,
    })
  }, [latestError])

  const handleSendMessage = useCallback(
    async (body: string) => {
      const senderName = identity.userName.trim() || 'Guest'
      await sendMessageAsync({
        body,
        userName: senderName,
        userUid: identity.userUid,
      })
    },
    [identity, sendMessageAsync],
  )

  const handleRetry = useCallback(
    (message: ChatMessage) => {
      retryMessage(message)
    },
    [retryMessage],
  )

  const handleIdentityNameChange = useCallback((value: string) => {
    setIdentity((current) => {
      const nextName = value.slice(0, 36)
      const persistedName = nextName.trim() || current.userName
      const updated = { ...current, userName: nextName }
      setStoredIdentity({ ...updated, userName: persistedName })
      return updated
    })
  }, [])

  const handleSelectChatroom = useCallback(
    (roomId: number | null) => {
      setActiveChatroomId(roomId)
      if (isMobile) {
        closeSettingsDrawer()
      }
    },
    [closeSettingsDrawer, isMobile],
  )

  const handleOpenCreateChatroom = useCallback(() => {
    if (isMobile) {
      closeSettingsDrawer()
    }
    openCreateModal()
  }, [closeSettingsDrawer, isMobile, openCreateModal])

  const handleChatroomNameChange = useCallback((value: string) => {
    setNewChatroomName(value)
  }, [])

  const handleCloseCreateModal = useCallback(() => {
    setNewChatroomName('')
    closeCreateModal()
  }, [closeCreateModal])

  const handleCreateChatroom = useCallback(async () => {
    const trimmed = newChatroomName.trim()
    if (!trimmed) {
      notifications.show({
        color: 'yellow',
        title: 'Name required',
        message: 'Please provide a chatroom name.',
      })
      return
    }

    try {
      const result = await createChatroom(trimmed)
      setActiveChatroomId(result.id)
      handleCloseCreateModal()
      notifications.show({
        color: 'teal',
        title: 'Chatroom created',
        message: `Joined ${result.name}`,
      })
    } catch (error) {
      notifications.show({
        color: 'red',
        title: 'Unable to create chatroom',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [createChatroom, handleCloseCreateModal, newChatroomName])

  useEffect(() => {
    if (!isMobile && isSettingsDrawerOpen) {
      closeSettingsDrawer()
    }
  }, [closeSettingsDrawer, isMobile, isSettingsDrawerOpen])

  // Surface feedback for messages authored by other participants.
  useIncomingMessageFeedback({
    messages,
    activeChatroomId,
    currentUserUid: identity.userUid,
  })

  return (
    <Box
      className="app-shell"
      bg="transparent"
      miw="100vw"
      mih="100vh"
      pt={{ base: 'lg', md: 48 }}
      pb={isMobile ? 'sm' : 48}
      px={{ base: 'md', md: '5vw' }}
    >
      <Stack gap="md">
        <ChatHeader />

        <Grid gutter={{ base: 'md', md: 'xl' }}>
          {!isMobile && (
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <ChatSidebarPanel
                chatroomOptions={chatroomOptions}
                activeChatroomId={activeChatroomId}
                onSelectChatroom={handleSelectChatroom}
                isLoadingChatrooms={isLoadingChatrooms}
                onCreateChatroom={handleOpenCreateChatroom}
                displayName={identity.userName}
                onDisplayNameChange={handleIdentityNameChange}
                chatroomCount={chatrooms.length}
              />
            </Grid.Col>
          )}

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <ChatMessagesPanel
              isMobile={isMobile}
              isLoadingChatrooms={isLoadingChatrooms}
              hasActiveChatroom={Boolean(activeChatroomId)}
              activeChatroomName={
                chatrooms.find((room) => room.id === activeChatroomId)?.name ?? 'Chat'
              }
              connectionStatus={connectionStatus}
              messages={messages}
              currentUserUid={identity.userUid}
              onRetry={handleRetry}
              isLoadingMessages={isLoadingMessages}
              onSendMessage={handleSendMessage}
              isSending={isSending}
              isDisconnected={connectionStatus === 'disconnected'}
              onCreateChatroom={handleOpenCreateChatroom}
            />
          </Grid.Col>
        </Grid>

        {isMobile && (
          <ChatMobileSettingsDrawer
            opened={isSettingsDrawerOpen}
            onOpen={openSettingsDrawer}
            onClose={closeSettingsDrawer}
            chatroomOptions={chatroomOptions}
            activeChatroomId={activeChatroomId}
            isLoadingChatrooms={isLoadingChatrooms}
            onSelectChatroom={handleSelectChatroom}
            onCreateChatroom={handleOpenCreateChatroom}
            displayName={identity.userName}
            onDisplayNameChange={handleIdentityNameChange}
            chatroomCount={chatrooms.length}
          />
        )}
      </Stack>

      <ChatCreateModal
        opened={isCreateModalOpen}
        chatroomName={newChatroomName}
        isSubmitting={isCreating}
        onNameChange={handleChatroomNameChange}
        onSubmit={() => void handleCreateChatroom()}
        onClose={handleCloseCreateModal}
      />
    </Box>
  )
}
