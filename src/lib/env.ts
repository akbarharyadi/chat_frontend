// Sanitize environment values to enforce string outputs for config fields.
const toStringOrEmpty = (value: unknown): string =>
  typeof value === 'string' ? value : ''

const chatApiUrl = toStringOrEmpty(import.meta.env.VITE_CHAT_API_URL)
const chatWsUrl = toStringOrEmpty(import.meta.env.VITE_CHAT_WS_URL)

if (!chatApiUrl || !chatWsUrl) {
  console.warn(
    'Missing chat API environment variables. Ensure VITE_CHAT_API_URL and VITE_CHAT_WS_URL are configured.',
  )
}

/**
 * Normalised environment configuration used throughout the application.
 */
export const env = Object.freeze({
  chatApiUrl,
  chatWsUrl,
})
