import { Group, Text, ThemeIcon, Title } from '@mantine/core'
import { IconMessageCircle } from '@tabler/icons-react'

/**
 * Decorative hero header displayed above the chat workspace.
 */
export const ChatHeader = () => (
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
        <Text size="sm" c="dimmed">
          Powered by React with Mantine and Ruby on Rails Action Cable.
        </Text>
      </div>
    </Group>
  </Group>
)
