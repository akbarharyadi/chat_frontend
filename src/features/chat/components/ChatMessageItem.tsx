import { memo, useMemo } from 'react'
import type { ReactNode } from 'react'

import {
  Anchor,
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Tooltip,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import { IconAlertTriangle, IconRotateClockwise, IconUser } from '@tabler/icons-react'

import type { ChatMessage } from '@features/chat/types'
import './ChatMessageItem.css'

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
  own: 'lg',
  other: 'xs',
}

/**
 * Renders an individual chat message with author info, status, and retry affordances.
 *
 * @param props.message - Chat message model to display.
 * @param props.isOwnMessage - Flags whether the message belongs to the current user.
 * @param props.onRetry - Optional handler invoked when retrying failed messages.
 * @returns Memoised message row element.
 */

export const ChatMessageItem = memo(
  ({ message, isOwnMessage, onRetry }: ChatMessageItemProps) => {
    const alignment = isOwnMessage ? 'flex-end' : 'flex-start'
    const radius = isOwnMessage ? bubbleRadius.own : bubbleRadius.other
    const theme = useMantineTheme()
    const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

    const linkifiedBody = useMemo<ReactNode>(() => {
      const urlRegex = /(https?:\/\/[^\s]+)/gi
      const trailingPunctuationRegex = /[),.;!?]+$/
      const nodes: ReactNode[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = urlRegex.exec(message.body)) !== null) {
        const matchStart = match.index

        if (matchStart > lastIndex) {
          nodes.push(message.body.slice(lastIndex, matchStart))
        }

        let url = match[0]
        let trailingPunctuation = ''

        const punctuationMatch = trailingPunctuationRegex.exec(url)
        if (punctuationMatch) {
          trailingPunctuation = punctuationMatch[0]
          url = url.slice(0, -trailingPunctuation.length)
        }

        nodes.push(
          <Anchor
            key={`chat-link-${url}-${matchStart}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            className="chat-message-link"
          >
            {url}
          </Anchor>,
        )

        if (trailingPunctuation) {
          nodes.push(trailingPunctuation)
        }

        lastIndex = urlRegex.lastIndex
      }

      if (lastIndex === 0) {
        return message.body
      }

      if (lastIndex < message.body.length) {
        nodes.push(message.body.slice(lastIndex))
      }

      return nodes
    }, [message.body])

    const bubbleStyles = useMemo(() => {
      if (message.isSystem) {
        return {
          background:
            colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(17, 24, 39, 0.06)',
          color: colorScheme === 'dark' ? theme.colors.gray[2] : theme.colors.dark[6],
          border: `1px dashed ${
            colorScheme === 'dark' ? theme.colors.gray[6] : theme.colors.gray[3]
          }`,
          shadow: theme.shadows.xs,
        }
      }

      return {
        background: colorScheme === 'dark' ? theme.colors.dark[4] : theme.white,
        color: colorScheme === 'dark' ? theme.colors.gray[1] : theme.colors.dark[7],
        border: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2]}`,
        shadow:
          colorScheme === 'dark'
            ? theme.shadows.xs
            : '0 10px 28px rgba(15, 23, 42, 0.06)',
      }
    }, [colorScheme, message.isSystem, theme])

    return (
      <Group
        wrap="nowrap"
        align="flex-start"
        justify={alignment}
        gap="sm"
        className="chat-message-item"
        data-own={isOwnMessage}
      >
        {!isOwnMessage && !message.isSystem && (
          <Avatar
            radius="xl"
            size={52}
            variant="gradient"
            gradient={{
              from: theme.colors.violet[5],
              to: theme.colors.cyan[4],
              deg: 135,
            }}
            className="chat-message-avatar"
            aria-label={`${message.userName} avatar`}
          >
            <IconUser size={24} stroke={1.5} className="chat-message-avatar__icon" />
          </Avatar>
        )}

        <Stack gap={4} maw="75%" align={isOwnMessage ? 'flex-end' : 'flex-start'}>
          {!message.isSystem && (
            <Text size="sm" fw={600} c="dimmed" className="chat-message-author">
              {isOwnMessage ? 'You' : message.userName}
            </Text>
          )}

          <Paper
            shadow={isOwnMessage ? 'xs' : 'xs'}
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
              style={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.45,
                wordBreak: 'break-word',
              }}
              size="sm"
              ff="var(--mantine-font-family)"
            >
              {linkifiedBody}
            </Text>

            <Text
              size="xs"
              c={bubbleStyles.color}
              style={{
                opacity: 0.7,
                marginTop: 8,
                textAlign: isOwnMessage ? 'right' : 'left',
              }}
            >
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
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
          <Avatar
            radius="xl"
            size={52}
            variant="gradient"
            gradient={{
              from: theme.colors.violet[5],
              to: theme.colors.cyan[4],
              deg: 135,
            }}
            className="chat-message-avatar"
            aria-label={`${message.userName} avatar`}
          >
            <IconUser size={24} stroke={1.5} className="chat-message-avatar__icon" />
          </Avatar>
        )}
      </Group>
    )
  },
)

ChatMessageItem.displayName = 'ChatMessageItem'
