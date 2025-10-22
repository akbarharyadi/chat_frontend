import { setupServer } from 'msw/node'
import type { RestHandler } from 'msw'

export const handlers = [] as const satisfies readonly RestHandler[]

export const server = setupServer(...handlers)
