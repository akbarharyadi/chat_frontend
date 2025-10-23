import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { PropsWithChildren, ReactElement } from 'react'

/**
 * Build a QueryClient tuned for deterministic testing.
 *
 * @returns Query client configured with retry disabled.
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

/**
 * Render helper that wires Mantine + React Query providers for component tests.
 *
 * @param ui - React node to render within providers.
 * @param options - Testing-library render options plus optional query client override.
 * @returns Result from RTL's `render` function.
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions & { queryClient?: QueryClient },
) => {
  const queryClient = options?.queryClient ?? createTestQueryClient()

  const Wrapper = ({ children }: PropsWithChildren): JSX.Element => (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MantineProvider>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}
