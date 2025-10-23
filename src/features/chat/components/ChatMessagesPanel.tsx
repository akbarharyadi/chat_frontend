import { Button, Flex, Loader, Paper, Stack, Text, Title, Box } from '@mantine/core'

import { ConnectionStatusBadge } from '@features/chat/components/ConnectionStatusBadge'
import { MessageComposer } from '@features/chat/components/MessageComposer'
import { MessageList } from '@features/chat/components/MessageList'
import type { ChatMessage } from '@features/chat/types'
import type { ConnectionStatus } from '@features/chat/types'

export interface ChatMessagesPanelProps {
  isMobile: boolean
  isLoadingChatrooms: boolean
  hasActiveChatroom: boolean
  activeChatroomName: string
  connectionStatus: ConnectionStatus
  messages: ChatMessage[]
  currentUserUid: string
  onRetry: (message: ChatMessage) => void
  isLoadingMessages: boolean
  onSendMessage: (message: string) => Promise<void>
  isSending: boolean
  isDisconnected: boolean
  onCreateChatroom: () => void
}

/**
 * Main conversation surface that renders current room metadata, message history,
 * and the composer. It encapsulates all presentation logic so the parent page
 * only has to supply data and callbacks.
 *
 * @param props.isMobile - Whether the panel is rendered on a mobile viewport.
 * @param props.isLoadingChatrooms - Indicates chatrooms are still being fetched.
 * @param props.hasActiveChatroom - Toggles empty-state messaging when no room is selected.
 * @param props.activeChatroomName - Display name for the current chatroom.
 * @param props.connectionStatus - Current realtime connection state.
 * @param props.messages - Ordered list of chat messages to render.
 * @param props.currentUserUid - Identifier of the logged in user, used for styling.
 * @param props.onRetry - Handler fired when retrying a failed message.
 * @param props.isLoadingMessages - When true, MessageList shows a loading indicator.
 * @param props.onSendMessage - Submission handler for the message composer.
 * @param props.isSending - Whether a message send mutation is currently pending.
 * @param props.isDisconnected - Disables the composer when realtime connection is lost.
 * @param props.onCreateChatroom - Callback to trigger the create chatroom workflow.
 * @returns A fully composed chat panel ready for display.
 */
export const ChatMessagesPanel = ({
  isMobile,
  isLoadingChatrooms,
  hasActiveChatroom,
  activeChatroomName,
  connectionStatus,
  messages,
  currentUserUid,
  onRetry,
  isLoadingMessages,
  onSendMessage,
  isSending,
  isDisconnected,
  onCreateChatroom,
}: ChatMessagesPanelProps) => (
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
        <Stack align="center" gap="sm">
          <Loader />
          <Text size="sm" c="dimmed">
            Loading chatrooms...
          </Text>
        </Stack>
      </Flex>
    ) : !hasActiveChatroom ? (
      <Flex
        align="center"
        justify="center"
        direction="column"
        gap="sm"
        style={{ height: '100%' }}
      >
        <Title order={3}>Create your first chatroom</Title>
        <Text c="dimmed" ta="center" maw={320}>
          Organize conversations by topic or team. You can always rename or archive them
          later.
        </Text>
        <Button onClick={onCreateChatroom}>New chatroom</Button>
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
              {activeChatroomName}
            </Title>
          </div>
          <ConnectionStatusBadge status={connectionStatus} />
        </div>

        <div className="message-area__body">
          <MessageList
            messages={messages}
            currentUserUid={currentUserUid}
            onRetry={onRetry}
            isLoading={isLoadingMessages}
          />
        </div>

        <div className="message-area__composer">
          <Box px={{ base: 'xs', md: 'md' }} pb={{ base: 'xs', md: 'sm' }}>
            <MessageComposer
              onSend={onSendMessage}
              isSending={isSending}
              disabled={isDisconnected}
            />
          </Box>
        </div>
      </>
    )}
  </Paper>
)
