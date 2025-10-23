import '@testing-library/jest-dom/vitest'

import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from '@tests/mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mantine relies on matchMedia for color-scheme detection; provide a jsdom shim.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })
}

// Provide minimal stubs for browser APIs used by Mantine scroll areas.
if (typeof window !== 'undefined') {
  if (!('ResizeObserver' in window)) {
    class ResizeObserverStub {
      observe(): void {
        // no-op stub for jsdom
      }
      unobserve(): void {
        // no-op stub for jsdom
      }
      disconnect(): void {
        // no-op stub for jsdom
      }
    }
    ;(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      ResizeObserverStub as unknown as typeof ResizeObserver
  }

  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = () => undefined
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined
  }
}
