# Free Chat Frontend

Free Chat is a React + TypeScript single-page application that delivers a realtime messaging experience with Mantine UI, TanStack React Query, and a Rails Action Cable backend. The frontend is optimized for both desktop and mobile.

## Tech Stack

- [Vite](https://vite.dev/) + React 19 + TypeScript
- [Mantine UI](https://mantine.dev/) for interface components
- [TanStack React Query](https://tanstack.com/query/latest) for server state management
- [Vitest](https://vitest.dev/) + Testing Library for unit tests
- [MSW](https://mswjs.io/) for mocking network calls in tests

## Getting Started

```bash
pnpm install
pnpm dev
```

The app expects backend endpoints and Action Cable websocket URLs configured via environment variables:

```env
VITE_CHAT_API_URL=https://your-api.example.com
VITE_CHAT_WS_URL=wss://your-api.example.com/cable
```

Run the full quality gate:

```bash
pnpm lint
pnpm test
pnpm build
```

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the project and deploys the `dist/` directory to a custom server via SCP. Configure the required secrets (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`, `VITE_CHAT_API_URL`, `VITE_CHAT_WS_URL`) before pushing to `main`.

## Project Structure

```
src/
  app/               # App shell and providers
  features/chat/     # Chat UI components, hooks, and types
  services/          # API and realtime clients
  tests/             # Testing utilities and MSW server
```

## Contributing

1. Create a feature branch.
2. Run `pnpm lint` and `pnpm test` before committing.
3. Push to `main`; the Husky pre-push hook also runs tests/build automatically.

## License

This project is distributed under the MIT License. See `LICENSE` for more information.
