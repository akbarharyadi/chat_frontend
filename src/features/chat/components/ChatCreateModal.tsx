import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

export interface ChatCreateModalProps {
  opened: boolean
  chatroomName: string
  isSubmitting: boolean
  onNameChange: (value: string) => void
  onSubmit: () => void
  onClose: () => void
}

/**
 * Controlled modal used to create chatrooms.
 *
 * @param props.opened - Whether the modal is visible.
 * @param props.chatroomName - Current input value for the chatroom name.
 * @param props.isSubmitting - Loading state for the submit button.
 * @param props.onNameChange - Handler fired when the input value changes.
 * @param props.onSubmit - Callback executed when the user confirms creation.
 * @param props.onClose - Handler executed when the modal is closed or cancelled.
 * @returns Rendered Mantine modal with form controls.
 */
export const ChatCreateModal = ({
  opened,
  chatroomName,
  isSubmitting,
  onNameChange,
  onSubmit,
  onClose,
}: ChatCreateModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title="Create a new chatroom"
    centered
    radius="lg"
  >
    <Stack gap="md">
      <TextInput
        label="Chatroom name"
        placeholder="Customer Support"
        data-autofocus
        value={chatroomName}
        onChange={(event) => onNameChange(event.currentTarget.value)}
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onSubmit}
          loading={isSubmitting}
        >
          Create
        </Button>
      </Group>
    </Stack>
  </Modal>
)
