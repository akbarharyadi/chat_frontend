import { ActionIcon, Affix, Drawer } from '@mantine/core'
import { IconSettings } from '@tabler/icons-react'

import { ChatSidebarPanel } from '@features/chat/components/ChatSidebarPanel'
import type { ChatSidebarOption } from '@features/chat/components/ChatSidebarPanel'

export interface ChatMobileSettingsDrawerProps {
  opened: boolean
  chatroomOptions: ChatSidebarOption[]
  activeChatroomId: number | null
  isLoadingChatrooms: boolean
  displayName: string
  chatroomCount: number
  onOpen: () => void
  onClose: () => void
  onSelectChatroom: (id: number | null) => void
  onCreateChatroom: () => void
  onDisplayNameChange: (value: string) => void
}

/**
 * Mobile-only drawer that exposes chatroom selection and profile settings.
 *
 * @param props.opened - Whether the drawer is currently open.
 * @param props.onOpen - Handler to open the drawer via the floating button.
 * @param props.onClose - Handler used to close the drawer.
 * @param props.chatroomOptions - Select options for available chatrooms.
 * @param props.activeChatroomId - Currently active chatroom identifier.
 * @param props.isLoadingChatrooms - Loading state for the chatroom selector.
 * @param props.displayName - Current user-facing display name.
 * @param props.onDisplayNameChange - Callback fired when display name input changes.
 * @param props.chatroomCount - Count of available chatrooms.
 * @param props.onSelectChatroom - Handler executed when selecting a chatroom.
 * @param props.onCreateChatroom - Trigger for launching the create chatroom workflow.
 * @returns Floating settings button alongside the configured drawer content.
 */
export const ChatMobileSettingsDrawer = ({
  opened,
  chatroomOptions,
  activeChatroomId,
  isLoadingChatrooms,
  displayName,
  chatroomCount,
  onOpen,
  onClose,
  onSelectChatroom,
  onCreateChatroom,
  onDisplayNameChange,
}: ChatMobileSettingsDrawerProps) => (
  <>
    <Affix position={{ top: 16, right: 16 }}>
      <ActionIcon
        size="xl"
        radius="xl"
        variant="gradient"
        gradient={{ from: 'violet', to: 'cyan' }}
        className="chat-settings-fab"
        onClick={onOpen}
        aria-label="Open chat settings"
      >
        <IconSettings size={22} />
      </ActionIcon>
    </Affix>

    <Drawer
      opened={opened}
      onClose={onClose}
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
      <ChatSidebarPanel
        chatroomOptions={chatroomOptions}
        activeChatroomId={activeChatroomId}
        onSelectChatroom={onSelectChatroom}
        isLoadingChatrooms={isLoadingChatrooms}
        onCreateChatroom={onCreateChatroom}
        displayName={displayName}
        onDisplayNameChange={onDisplayNameChange}
        chatroomCount={chatroomCount}
      />
    </Drawer>
  </>
)
