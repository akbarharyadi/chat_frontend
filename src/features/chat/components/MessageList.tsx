import { useEffect, useMemo, useRef, useState } from 'react'

import { Flex, ScrollArea, Stack, Text } from '@mantine/core'

import type { ChatMessage } from '@features/chat/types'
import { ChatMessageItem } from '@features/chat/components/ChatMessageItem'

export interface MessageListProps {
  messages: ChatMessage[]
  currentUserUid: string
  onRetry?: (message: ChatMessage) => void
  isLoading?: boolean
}

/**
 * Scrollable container that renders chat messages and maintains scroll-to-bottom behavior.
 *
 * @param props.messages - Collection of chat messages to render.
 * @param props.currentUserUid - Identifier of the current user for alignment decisions.
 * @param props.onRetry - Optional callback fired when retrying failed messages.
 * @param props.isLoading - Whether the message feed is currently loading.
 * @returns Scroll area containing the message history.
 */
export const MessageList = ({
  messages,
  currentUserUid,
  onRetry,
  isLoading = false,
}: MessageListProps) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  // Ensure messages render in chronological order regardless of delivery sequence.
  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages],
  )

  // Automatically scroll to the latest message unless the user is viewing history.
  useEffect(() => {
    if (isUserScrolling) {
      return
    }

    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: isLoading ? 'auto' : 'smooth',
    })
  }, [sortedMessages, isLoading, isUserScrolling])

  // Track manual scroll interactions to prevent auto-scroll when user is reading past messages.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    const handleScroll = () => {
      if (!viewport) {
        return
      }
      const isAtBottom =
        viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 24
      setIsUserScrolling(!isAtBottom)
    }

    viewport.addEventListener('scroll', handleScroll, { passive: true })
    return () => viewport.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ScrollArea
      viewportRef={viewportRef}
      type="auto"
      scrollbarSize={8}
      offsetScrollbars
      classNames={{
        scrollbar: 'message-list__scrollbar',
        thumb: 'message-list__scrollbar-thumb',
      }}
      style={{ flex: 1, minHeight: 0 }}
    >
      <Flex direction="column" justify="flex-end" style={{ minHeight: '100%' }}>
        <Stack p="md" gap="md">
          {sortedMessages.length === 0 && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              c="dimmed"
              py="sm"
              gap={4}
            >
              <Text size="sm">It&apos;s quiet here... start the conversation!</Text>
            </Flex>
          )}
          {sortedMessages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isOwnMessage={message.userUid === currentUserUid}
              onRetry={onRetry}
            />
          ))}
        </Stack>
      </Flex>
    </ScrollArea>
  )
}
