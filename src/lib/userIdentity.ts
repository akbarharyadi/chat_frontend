const STORAGE_KEY = 'free-chat:user-identity'

export interface UserIdentity {
  userUid: string
  userName: string
}

// Generate a stable identifier for the browser session.
const randomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11)
}

// Provide a friendly default display name for first-time visitors.
const defaultName = () => {
  const adjectives = ['Curious', 'Brave', 'Swift', 'Bright', 'Lively', 'Calm']
  const animals = ['Fox', 'Otter', 'Hawk', 'Panda', 'Lynx', 'Dolphin']
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  return `${adjective} ${animal}`
}

/**
 * Retrieve the persisted identity or create a new one if unavailable.
 */
export function getStoredIdentity(): UserIdentity {
  if (typeof window === 'undefined') {
    return {
      userUid: randomId(),
      userName: defaultName(),
    }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as UserIdentity
    }
  } catch (error) {
    console.warn('Unable to read user identity from storage', error)
  }

  const identity: UserIdentity = {
    userUid: randomId(),
    userName: defaultName(),
  }
  setStoredIdentity(identity)
  return identity
}

/**
 * Persist the user identity in localStorage for future sessions.
 */
export function setStoredIdentity(identity: UserIdentity) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  } catch (error) {
    console.warn('Unable to persist user identity', error)
  }
}
