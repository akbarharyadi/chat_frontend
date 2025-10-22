import { ColorSchemeScript } from '@mantine/core'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from '@app/App'
import { AppProviders } from '@app/providers/AppProviders'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <>
    <ColorSchemeScript defaultColorScheme="auto" />
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>
  </>,
)
