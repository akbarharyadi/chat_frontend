import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ActionIcon,
  Affix,
  Box,
  Button,
  Divider,
  Drawer,
  Flex,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Grid,
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { IconMessageCircle, IconPlus, IconSettings, IconUser } from '@tabler/icons-react'

import { MessageComposer } from '@features/chat/components/MessageComposer'
import { MessageList } from '@features/chat/components/MessageList'
import { ConnectionStatusBadge } from '@features/chat/components/ConnectionStatusBadge'
import { useChatRoom } from '@features/chat/hooks/useChatRoom'
import { useChatrooms } from '@features/chat/hooks/useChatrooms'
import type { ChatMessage, Chatroom } from '@features/chat/types'
import { getStoredIdentity, setStoredIdentity } from '@lib/userIdentity'

const mapChatroomOption = (chatroom: Chatroom) => ({
  value: String(chatroom.id),
  label: chatroom.name,
})

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
      setNewChatroomName('')
      closeCreateModal()
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
  }, [closeCreateModal, createChatroom, newChatroomName])

  useEffect(() => {
    if (!isMobile && isSettingsDrawerOpen) {
      closeSettingsDrawer()
    }
  }, [closeSettingsDrawer, isMobile, isSettingsDrawerOpen])
  const sidebarPanel = (
    <Paper
      className="chat-panel chat-panel--sidebar"
      radius="xl"
      shadow="xl"
      p={{ base: 'md', md: 'xl' }}
      withBorder
      style={{
        backdropFilter: 'blur(12px)',
        background: 'rgba(8, 15, 32, 0.82)',
        border: '1px solid rgba(148, 163, 184, 0.15)',
        width: '100%',
      }}
    >
      <Stack gap="lg">
        <Stack gap={4}>
          <Text
            size="xs"
            c="dimmed"
            fw={600}
            tt="uppercase"
            style={{ letterSpacing: '0.6px' }}
          >
            Chatroom
          </Text>
          <Select
            data={chatroomOptions}
            value={activeChatroomId ? String(activeChatroomId) : null}
            onChange={(value) => {
              setActiveChatroomId(value ? Number(value) : null)
              if (isMobile) {
                closeSettingsDrawer()
              }
            }}
            placeholder="Choose a chatroom"
            searchable
            nothingFoundMessage={isLoadingChatrooms ? 'Loading...' : 'No chatrooms yet'}
            size="md"
          />
          <Button
            fullWidth
            leftSection={<IconPlus size={16} />}
            variant="gradient"
            gradient={{ from: 'violet', to: 'cyan' }}
            onClick={openCreateModal}
          >
            New chatroom
          </Button>
        </Stack>
        <Divider label="Profile" labelPosition="center" />
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Display name
          </Text>
          <TextInput
            value={identity.userName}
            onChange={(event) => handleIdentityNameChange(event.currentTarget.value)}
            leftSection={<IconUser size={16} />}
            aria-label="Display name"
            size="md"
            placeholder="How should we call you?"
          />
          <Text size="xs" c="dimmed">
            Your name is shared with other participants in this chatroom.
          </Text>
        </Stack>
        <Divider label="Status" labelPosition="center" />
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Messages will appear instantly when connected.
          </Text>
          <Text size="xs" c="dimmed">
            Rooms available: {chatrooms.length ?? 0}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  )

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
        <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
          <Group gap={12} align="flex-start">
            <ThemeIcon
              radius="lg"
              size={46}
              variant="gradient"
              gradient={{ from: 'violet', to: 'cyan' }}
            >
              <IconMessageCircle size={26} />
            </ThemeIcon>
            <div>
              <Title order={2}>Free Chat</Title>
              <Text size="sm" c="dimmed">
                Beautiful realtime messaging.
              </Text>
            </div>
          </Group>
        </Group>

        <Grid gutter={{ base: 'md', md: 'xl' }}>
          {!isMobile && <Grid.Col span={{ base: 12, lg: 4 }}>{sidebarPanel}</Grid.Col>}

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper
              className="chat-panel chat-panel--messages"
              radius="xl"
              shadow="xl"
              withBorder
              p={{ base: 'sm', md: 'lg' }}
              bg="rgba(8, 15, 32, 0.55)"
              style={{
                minHeight: isMobile ? 'calc(90vh - 120px)' : '65vh',
                height: isMobile ? 'calc(100vh - 140px)' : '70vh',
                maxHeight: isMobile ? 'calc(100vh - 80px)' : '75vh',
                backdropFilter: 'blur(18px)',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(148, 163, 184, 0.15)',
              }}
            >
              {isLoadingChatrooms ? (
                <Flex align="center" justify="center" style={{ height: '100%' }}>
                  <Loader />
                </Flex>
              ) : !activeChatroomId ? (
                <Flex
                  align="center"
                  justify="center"
                  direction="column"
                  gap="sm"
                  style={{ height: '100%' }}
                >
                  <Title order={3}>Create your first chatroom</Title>
                  <Text c="dimmed" ta="center" maw={320}>
                    Organize conversations by topic or team. You can always rename or
                    archive them later.
                  </Text>
                  <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
                    New chatroom
                  </Button>
                </Flex>
              ) : (
                <>
                  <div className="message-area__header">
                    <div>
                      <Text
                        size="xs"
                        c="dimmed"
                        fw={500}
                        tt="uppercase"
                        style={{ letterSpacing: 0.6 }}
                      >
                        Current chatroom
                      </Text>
                      <Title order={3} mt="xs">
                        {chatrooms.find((room) => room.id === activeChatroomId)?.name ??
                          'Chat'}
                      </Title>
                    </div>
                    <ConnectionStatusBadge status={connectionStatus} />
                  </div>
                  <div className="message-area__body">
                    <MessageList
                      messages={messages}
                      currentUserUid={identity.userUid}
                      onRetry={handleRetry}
                      isLoading={isLoadingMessages}
                    />
                  </div>
                  <div className="message-area__composer">
                    <Box px={{ base: 'xs', md: 'md' }} pb={{ base: 'xs', md: 'sm' }}>
                      <MessageComposer
                        onSend={handleSendMessage}
                        isSending={isSending}
                        disabled={connectionStatus === 'disconnected'}
                      />
                    </Box>
                  </div>
                </>
              )}
            </Paper>
          </Grid.Col>
        </Grid>

        {isMobile && (
          <>
            <Affix position={{ top: 16, right: 16 }}>
              <ActionIcon
                size="xl"
                radius="xl"
                variant="gradient"
                gradient={{ from: 'violet', to: 'cyan' }}
                className="chat-settings-fab"
                onClick={openSettingsDrawer}
                aria-label="Open chat settings"
              >
                <IconSettings size={22} />
              </ActionIcon>
            </Affix>

            <Drawer
              opened={isSettingsDrawerOpen}
              onClose={closeSettingsDrawer}
              title="Chat settings"
              position="bottom"
              size="auto"
              padding="lg"
              radius="xl"
              overlayProps={{ opacity: 0.55, blur: 8 }}
              classNames={{
                content: 'chat-settings-drawer',
                body: 'chat-settings-drawer__body',
                header: 'chat-settings-drawer__header',
              }}
            >
              <Stack gap="lg">{sidebarPanel}</Stack>
            </Drawer>
          </>
        )}
      </Stack>

      <Modal
        opened={isCreateModalOpen}
        onClose={() => {
          setNewChatroomName('')
          closeCreateModal()
        }}
        title="Create a new chatroom"
        centered
        radius="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Chatroom name"
            placeholder="Customer Support"
            data-autofocus
            value={newChatroomName}
            onChange={(event) => setNewChatroomName(event.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => void handleCreateChatroom()}
              loading={isCreating}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}
