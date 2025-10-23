import { useEffect, useRef } from 'react'

import type { ChatMessage } from '@features/chat/types'

type ExtendedWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

let notificationAudioContext: AudioContext | null = null

/**
 * Lazily instantiate a single AudioContext instance for notification playback.
 * Browsers often limit concurrent contexts, so reuse avoids exceeding limits.
 */
const getOrCreateAudioContext = () => {
  if (typeof window === 'undefined') {
    return null
  }
  if (notificationAudioContext) {
    return notificationAudioContext
  }

  const extendedWindow = window as ExtendedWindow
  const AudioContextCtor = window.AudioContext ?? extendedWindow.webkitAudioContext
  if (!AudioContextCtor) {
    return null
  }

  notificationAudioContext = new AudioContextCtor()
  return notificationAudioContext
}

/**
 * Emit a short confirmation tone to complement the vibration feedback.
 */
const playNotificationTone = async () => {
  const audioContext = getOrCreateAudioContext()
  if (!audioContext) {
    return
  }

  try {
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.35)
  } catch {
    // Browsers may block autoplay until the user interacts with the page.
    return
  }
}

/**
 * Trigger a light vibration pulse on devices that support the API.
 */
const vibrateDevice = () => {
  if (typeof navigator === 'undefined') {
    return
  }
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate([40, 60, 40])
  }
}

export interface UseIncomingMessageFeedbackOptions {
  messages: ChatMessage[]
  activeChatroomId: number | null
  currentUserUid: string
}

/**
 * Provide haptic/audio feedback when a new message arrives from another user.
 * The hook ignores initial history loads, the current user's messages, and
 * resets tracking when the active chatroom changes.
 */
export const useIncomingMessageFeedback = ({
  messages,
  activeChatroomId,
  currentUserUid,
}: UseIncomingMessageFeedbackOptions) => {
  const lastNotifiedMessageIdRef = useRef<string | null>(null)
  const isChatroomInitialisedRef = useRef(false)

  useEffect(() => {
    lastNotifiedMessageIdRef.current = null
    isChatroomInitialisedRef.current = false
  }, [activeChatroomId])

  useEffect(() => {
    if (messages.length === 0) {
      return
    }

    const latestMessage = messages[messages.length - 1]
    if (!isChatroomInitialisedRef.current) {
      lastNotifiedMessageIdRef.current = latestMessage.id
      isChatroomInitialisedRef.current = true
      return
    }

    if (latestMessage.id === lastNotifiedMessageIdRef.current) {
      return
    }

    lastNotifiedMessageIdRef.current = latestMessage.id
    if (latestMessage.userUid === currentUserUid) {
      return
    }

    vibrateDevice()
    void playNotificationTone()
  }, [currentUserUid, messages])
}
