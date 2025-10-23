import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type FormEvent,
} from 'react'

import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Popover,
  SimpleGrid,
  Textarea,
  Tooltip,
} from '@mantine/core'
import { useMediaQuery, useDisclosure } from '@mantine/hooks'
import { IconMoodSmile, IconSend } from '@tabler/icons-react'

export interface MessageComposerProps {
  onSend: (message: string) => Promise<void> | void
  isSending?: boolean
  disabled?: boolean
  variant?: 'default' | 'mobile'
}

const EMOJI_OPTIONS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '🤔',
  '👍',
  '🙏',
  '🔥',
  '🎉',
  '❤️',
  '🚀',
  '🌟',
  '😴',
]

/**
 * Chat input allowing users to draft multi-line content and submit via button or Enter key.
 *
 * @param props.onSend - Async handler invoked with the finalised message body.
 * @param props.isSending - Toggles loading state on the send button.
 * @param props.disabled - Disables input controls, typically when offline.
 * @returns Controlled message composer form element.
 */
export const MessageComposer = ({
  onSend,
  isSending = false,
  disabled = false,
  variant = 'default',
}: MessageComposerProps) => {
  const [value, setValue] = useState('')
  const mediaQueryMatches = useMediaQuery('(max-width: 40em)')
  const isMobile = variant === 'mobile' ? true : mediaQueryMatches
  const [isEmojiOpen, { toggle: toggleEmojiPicker, close: closeEmojiPicker }] =
    useDisclosure(false)

  // Submit the draft message and optimistically clear the input.
  const handleSubmit = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault()
      const trimmed = value.trim()
      if (!trimmed) {
        return
      }
      setValue('')
      try {
        await onSend(trimmed)
      } catch (error) {
        setValue(trimmed)
        console.error('Failed to send message', error)
      }
    },
    [onSend, value],
  )

  // Allow pressing Enter to send while Shift+Enter still inserts a newline.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setValue((current) => `${current}${emoji}`)
      closeEmojiPicker()
    },
    [closeEmojiPicker],
  )

  useEffect(() => {
    if (disabled) {
      closeEmojiPicker()
    }
  }, [disabled, closeEmojiPicker])

  return (
    <Paper
      component="form"
      onSubmit={(event) => void handleSubmit(event)}
      withBorder
      radius="lg"
      px="md"
      py="xs"
    >
      <Group
        align="flex-end"
        gap={variant === 'mobile' ? 'xs' : 'sm'}
        wrap="wrap"
        justify={
          variant === 'mobile'
            ? 'space-between'
            : isMobile
              ? 'space-between'
              : 'flex-start'
        }
      >
        <Popover
          opened={isEmojiOpen}
          onClose={closeEmojiPicker}
          position="top-start"
          withArrow
          shadow="xl"
          withinPortal
        >
          <Popover.Target>
            <Tooltip label="Insert emoji" disabled={isEmojiOpen}>
              <ActionIcon
                size={isMobile ? 'md' : 'lg'}
                radius="xl"
                variant="subtle"
                color="gray"
                aria-label="Open emoji picker"
                aria-expanded={isEmojiOpen}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    toggleEmojiPicker()
                  }
                }}
              >
                <IconMoodSmile size={20} />
              </ActionIcon>
            </Tooltip>
          </Popover.Target>
          <Popover.Dropdown p="xs">
            <SimpleGrid cols={4} spacing="xs">
              {EMOJI_OPTIONS.map((emoji) => (
                <ActionIcon
                  key={emoji}
                  variant="subtle"
                  radius="md"
                  onClick={() => handleEmojiSelect(emoji)}
                  aria-label={`Insert emoji ${emoji}`}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>
                </ActionIcon>
              ))}
            </SimpleGrid>
          </Popover.Dropdown>
        </Popover>

        <Textarea
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          autosize
          minRows={1}
          maxRows={4}
          style={{
            flex: 1,
            minWidth: variant === 'mobile' || isMobile ? '100%' : 0,
          }}
          radius="md"
          disabled={disabled}
          aria-label="Message body"
          size={variant === 'mobile' ? 'sm' : 'md'}
        />

        <Button
          type="submit"
          radius="xl"
          rightSection={<IconSend size={18} />}
          loading={isSending}
          disabled={disabled}
          fullWidth={variant === 'mobile' || isMobile}
          size={variant === 'mobile' ? 'md' : isMobile ? 'md' : 'sm'}
          style={
            variant === 'mobile' ? { paddingInline: '1.75rem', height: 48 } : undefined
          }
        >
          Send
        </Button>
      </Group>
    </Paper>
  )
}
