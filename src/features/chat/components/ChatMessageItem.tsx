import { memo, useMemo } from 'react'

import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import { useMantineTheme } from '@mantine/core'
import { IconAlertTriangle, IconRotateClockwise } from '@tabler/icons-react'

import type { ChatMessage } from '@features/chat/types'

export interface ChatMessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  onRetry?: (message: ChatMessage) => void
}

// Human readable labels for message delivery state.
const statusLabel: Record<ChatMessage['status'], string> = {
  sent: 'Sent',
  sending: 'Sending...',
  failed: 'Failed to send',
}

// Adjust bubble corners to visually differentiate own messages from others.
const bubbleRadius = {
  own: { topLeft: 'lg', topRight: 'xs', bottomLeft: 'lg', bottomRight: 'lg' } as const,
  other: { topLeft: 'xs', topRight: 'lg', bottomLeft: 'lg', bottomRight: 'lg' } as const,
}

/**
 * Renders an individual chat message with author info, status, and retry affordances.
 */

export const ChatMessageItem = memo(
  ({ message, isOwnMessage, onRetry }: ChatMessageItemProps) => {
    const alignment = isOwnMessage ? 'flex-end' : 'flex-start'
    const radius = isOwnMessage ? bubbleRadius.own : bubbleRadius.other
    const theme = useMantineTheme()

    const bubbleStyles = useMemo(() => {
      if (message.isSystem) {
        return {
          background:
            theme.colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(17, 24, 39, 0.06)',
          color:
            theme.colorScheme === 'dark' ? theme.colors.gray[2] : theme.colors.dark[6],
          border: `1px dashed ${
            theme.colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[3]
          }`,
          shadow: theme.shadows.xs,
        }
      }

      if (isOwnMessage) {
        return {
          background: `linear-gradient(135deg, ${theme.colors.violet[5]} 0%, ${theme.colors.cyan[4]} 100%)`,
          color: theme.white,
          border: 'none',
          shadow: theme.shadows.sm,
        }
      }

      return {
        background:
          theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
        color: theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.colors.dark[7],
        border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        shadow: theme.shadows.xs,
      }
    }, [isOwnMessage, message.isSystem, theme])

    return (
      <Group
        wrap="nowrap"
        align="flex-end"
        justify={alignment}
        gap="sm"
        className="chat-message-item"
        data-own={isOwnMessage}
      >
        {!isOwnMessage && !message.isSystem && (
          <Avatar
            radius="xl"
            size={38}
            variant="gradient"
            gradient={{ from: 'violet', to: 'cyan', deg: 130 }}
          >
            {message.userName.slice(0, 2).toUpperCase()}
          </Avatar>
        )}

        <Stack gap={4} maw="75%" align={isOwnMessage ? 'flex-end' : 'flex-start'}>
          <Group gap={8} justify={alignment}>
            {!isOwnMessage && !message.isSystem && (
              <Text size="sm" fw={600} c="dimmed">
                {message.userName}
              </Text>
            )}
            <Text size="xs" c="dimmed">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Group>

          <Paper
            shadow={isOwnMessage ? 'none' : 'xs'}
            radius={radius}
            px="md"
            py="sm"
            bg={bubbleStyles.background}
            c={bubbleStyles.color}
            withBorder={!isOwnMessage && !message.isSystem}
            style={{
              border: bubbleStyles.border,
              boxShadow: bubbleStyles.shadow,
              backdropFilter: isOwnMessage ? 'blur(0px)' : 'blur(6px)',
            }}
            className="chat-message-bubble"
          >
            <Text
              style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}
              size="sm"
              ff="var(--mantine-font-family)"
            >
              {message.body}
            </Text>
          </Paper>

          {!message.isSystem && (
            <Group gap={6} justify={alignment}>
              {message.status === 'sending' && (
                <Badge
                  leftSection={<Loader size="xs" color="gray" />}
                  variant="light"
                  color="gray"
                  size="xs"
                >
                  {statusLabel[message.status]}
                </Badge>
              )}
              {message.status === 'failed' && (
                <Group gap={6}>
                  <Tooltip label={statusLabel[message.status]} color="red">
                    <Badge
                      leftSection={<IconAlertTriangle size={14} />}
                      variant="light"
                      color="red"
                      size="xs"
                    >
                      Failed
                    </Badge>
                  </Tooltip>
                  {onRetry && (
                    <Tooltip label="Retry sending">
                      <ActionIcon
                        size="sm"
                        radius="xl"
                        variant="outline"
                        color="red"
                        onClick={() => onRetry(message)}
                        aria-label="Retry sending message"
                      >
                        <IconRotateClockwise size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              )}
            </Group>
          )}
        </Stack>

        {isOwnMessage && !message.isSystem && (
          <Avatar radius="xl" size={38} color="primary">
            {message.userName.slice(0, 2).toUpperCase()}
          </Avatar>
        )}
      </Group>
    )
  },
)

ChatMessageItem.displayName = 'ChatMessageItem'
