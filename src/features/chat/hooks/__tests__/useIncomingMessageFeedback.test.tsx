import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

import type { ChatMessage } from '@features/chat/types'
import type { UseIncomingMessageFeedbackOptions } from '../useIncomingMessageFeedback'

type UseIncomingMessageFeedbackHook = (options: UseIncomingMessageFeedbackOptions) => void

class FakeGainNode {
  connect = vi.fn()
  disconnect = vi.fn()
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  }
}

class FakeOscillator {
  type = 'sine'
  frequency = {
    setValueAtTime: vi.fn(),
  }
  connect = vi.fn()
  disconnect = vi.fn()
  start = vi.fn()

  stop = vi.fn(() => {
    this.onended?.()
  })

  onended: (() => void) | null = null
}

class FakeAudioContext {
  currentTime = 0
  state: 'running' | 'suspended' | 'closed' = 'running'
  resume = vi.fn().mockResolvedValue(undefined)
  destination = {}

  createOscillator() {
    const oscillator = new FakeOscillator()
    createdOscillators.push(oscillator)
    return oscillator
  }

  createGain() {
    const gain = new FakeGainNode()
    createdGains.push(gain)
    return gain
  }
}

let createdOscillators: FakeOscillator[] = []
let createdGains: FakeGainNode[] = []
let vibrateSpy: ReturnType<typeof vi.fn>
let useIncomingMessageFeedback: UseIncomingMessageFeedbackHook
const originalVibrate = (
  navigator as Navigator & { vibrate?: (pattern: number[]) => boolean }
).vibrate
const originalAudioContext = globalThis.AudioContext
const originalWebkitAudioContext = (
  globalThis as { webkitAudioContext?: typeof AudioContext }
).webkitAudioContext

const createMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: overrides.id ?? `msg-${Math.random().toString(36).slice(2)}`,
  chatroomId: overrides.chatroomId ?? 1,
  body: overrides.body ?? 'hello',
  userName: overrides.userName ?? 'User',
  userUid: overrides.userUid ?? 'user-remote',
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  status: overrides.status ?? 'sent',
  isLocal: overrides.isLocal,
  isSystem: overrides.isSystem,
})

describe('useIncomingMessageFeedback', () => {
  beforeEach(async () => {
    vi.resetModules()
    createdOscillators = []
    createdGains = []
    vibrateSpy = vi.fn()

    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrateSpy,
    })

    Object.defineProperty(globalThis, 'AudioContext', {
      configurable: true,
      writable: true,
      value: FakeAudioContext as unknown as typeof AudioContext,
    })

    delete (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    ;({ useIncomingMessageFeedback } = await import('../useIncomingMessageFeedback'))
  })

  afterEach(() => {
    if (originalVibrate === undefined) {
      delete (navigator as Navigator & { vibrate?: unknown }).vibrate
    } else {
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: originalVibrate,
      })
    }

    if (originalAudioContext) {
      Object.defineProperty(globalThis, 'AudioContext', {
        configurable: true,
        writable: true,
        value: originalAudioContext,
      })
    } else {
      delete (globalThis as { AudioContext?: unknown }).AudioContext
    }

    if (originalWebkitAudioContext) {
      Object.defineProperty(globalThis, 'webkitAudioContext', {
        configurable: true,
        writable: true,
        value: originalWebkitAudioContext,
      })
    } else {
      delete (globalThis as { webkitAudioContext?: unknown }).webkitAudioContext
    }
  })

  it('plays feedback for subsequent remote messages while ignoring history and self-sent messages', async () => {
    const initialMessage = createMessage({ id: 'initial', userUid: 'other-user' })
    const remoteFollowUp = createMessage({
      id: 'remote-2',
      userUid: 'friend',
      body: 'hey!',
    })
    const ownMessage = createMessage({
      id: 'self',
      userUid: 'current-user',
      body: 'my text',
    })

    const { rerender } = renderHook((props) => useIncomingMessageFeedback(props), {
      initialProps: {
        messages: [],
        activeChatroomId: 7,
        currentUserUid: 'current-user',
      },
    })

    rerender({
      messages: [initialMessage],
      activeChatroomId: 7,
      currentUserUid: 'current-user',
    })

    await waitFor(() => {
      expect(vibrateSpy).toHaveBeenCalledTimes(0)
      expect(createdOscillators).toHaveLength(0)
    })

    rerender({
      messages: [initialMessage, remoteFollowUp],
      activeChatroomId: 7,
      currentUserUid: 'current-user',
    })

    await waitFor(() => {
      expect(vibrateSpy).toHaveBeenCalledTimes(1)
      const oscillator = createdOscillators.at(-1)
      expect(oscillator?.start).toHaveBeenCalledTimes(1)
      expect(oscillator?.stop).toHaveBeenCalledTimes(1)
      expect(oscillator?.disconnect).toHaveBeenCalledTimes(1)
      expect(createdGains.at(-1)?.connect).toHaveBeenCalledTimes(1)
    })

    rerender({
      messages: [initialMessage, remoteFollowUp, ownMessage],
      activeChatroomId: 7,
      currentUserUid: 'current-user',
    })

    await waitFor(() => {
      expect(vibrateSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('resets feedback tracking when switching chatrooms', async () => {
    const roomAFirst = createMessage({ id: 'a-1', chatroomId: 2, userUid: 'other-1' })
    const roomASecond = createMessage({ id: 'a-2', chatroomId: 2, userUid: 'other-2' })
    const roomBFirst = createMessage({ id: 'b-1', chatroomId: 9, userUid: 'other-3' })
    const roomBSecond = createMessage({ id: 'b-2', chatroomId: 9, userUid: 'other-4' })

    const { rerender } = renderHook((props) => useIncomingMessageFeedback(props), {
      initialProps: {
        messages: [],
        activeChatroomId: 2,
        currentUserUid: 'me',
      },
    })

    rerender({
      messages: [roomAFirst],
      activeChatroomId: 2,
      currentUserUid: 'me',
    })

    rerender({
      messages: [roomAFirst, roomASecond],
      activeChatroomId: 2,
      currentUserUid: 'me',
    })

    await waitFor(() => {
      expect(vibrateSpy).toHaveBeenCalledTimes(1)
    })

    rerender({
      messages: [roomBFirst],
      activeChatroomId: 9,
      currentUserUid: 'me',
    })

    await waitFor(() => {
      expect(vibrateSpy).toHaveBeenCalledTimes(1)
    })

    rerender({
      messages: [roomBFirst, roomBSecond],
      activeChatroomId: 9,
      currentUserUid: 'me',
    })

    await waitFor(() => {
      expect(vibrateSpy).toHaveBeenCalledTimes(2)
    })
  })
})
