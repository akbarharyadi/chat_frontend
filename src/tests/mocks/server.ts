import { setupServer } from 'msw/node'
import type { RequestHandler } from 'msw'

export const handlers = [] as const satisfies readonly RequestHandler[]

export const server = setupServer(...handlers)
