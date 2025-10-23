import { Button, Divider, Paper, Select, Stack, Text, TextInput } from '@mantine/core'
import { IconPlus, IconUser } from '@tabler/icons-react'

export interface ChatSidebarOption {
  value: string
  label: string
}

export interface ChatSidebarPanelProps {
  chatroomOptions: ChatSidebarOption[]
  activeChatroomId: number | null
  onSelectChatroom: (chatroomId: number | null) => void
  isLoadingChatrooms: boolean
  onCreateChatroom: () => void
  displayName: string
  onDisplayNameChange: (value: string) => void
  chatroomCount: number
}

/**
 * Sidebar panel controlling chatroom selection and profile metadata. Consumers supply
 * callbacks for room selection, creation and display name updates. The component is
 * intentionally presentation-focused to keep the parent container slim.
 *
 * @param props.chatroomOptions - Options displayed in the chatroom selector dropdown.
 * @param props.activeChatroomId - Currently selected chatroom identifier.
 * @param props.onSelectChatroom - Handler invoked when the user picks a different room.
 * @param props.isLoadingChatrooms - Flag used to render a loading state in the selector.
 * @param props.onCreateChatroom - Callback fired when the user presses the create button.
 * @param props.displayName - Current user-facing name that appears to other participants.
 * @param props.onDisplayNameChange - Handler fired when the display name input changes.
 * @param props.chatroomCount - Total rooms available, surfaced in the status footer.
 * @returns Sidebar layout containing chatroom controls.
 */
export const ChatSidebarPanel = ({
  chatroomOptions,
  activeChatroomId,
  onSelectChatroom,
  isLoadingChatrooms,
  onCreateChatroom,
  displayName,
  onDisplayNameChange,
  chatroomCount,
}: ChatSidebarPanelProps) => (
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
          onChange={(value) => onSelectChatroom(value ? Number(value) : null)}
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
          onClick={onCreateChatroom}
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
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.currentTarget.value)}
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
          Rooms available: {chatroomCount ?? 0}
        </Text>
      </Stack>
    </Stack>
  </Paper>
)
