const chatApiUrl = import.meta.env.VITE_CHAT_API_URL

if (!chatApiUrl) {
  console.warn(
    'Missing VITE_CHAT_API_URL environment variable. API requests will fail until it is configured.',
  )
}

export const env = {
  chatApiUrl,
} as const
