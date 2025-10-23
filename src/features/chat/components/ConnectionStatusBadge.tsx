import { Badge, Tooltip } from '@mantine/core'

import type { ConnectionStatus } from '@features/chat/types'

const statusConfig: Record<
  ConnectionStatus,
  { label: string; color: string; description: string }
> = {
  connecting: {
    label: 'Connecting...',
    color: 'yellow',
    description: 'Attempting to connect to the chat server.',
  },
  connected: {
    label: 'Online',
    color: 'teal',
    description: 'Connected to the chat server. Messages will stream in real-time.',
  },
  disconnected: {
    label: 'Offline',
    color: 'red',
    description: 'Disconnected from chat server. Messages may be delayed.',
  },
}

export interface ConnectionStatusBadgeProps {
  status: ConnectionStatus
}

/**
 * Displays the current realtime connection state with contextual tooltip.
 *
 * @param props.status - Connection lifecycle stage for the realtime websocket.
 * @returns Status badge with short label and descriptive tooltip.
 */
export const ConnectionStatusBadge = ({ status }: ConnectionStatusBadgeProps) => {
  const config = statusConfig[status]

  return (
    <Tooltip label={config.description}>
      <Badge color={config.color} variant="light" size="sm">
        {config.label}
      </Badge>
    </Tooltip>
  )
}
