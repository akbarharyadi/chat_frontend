import { AppShell, Container, Stack, Text, Title } from '@mantine/core'

export function App() {
  return (
    <AppShell padding="md">
      <AppShell.Main>
        <Container size="md" py="xl">
          <Stack gap="md" align="center">
            <Title order={2}>Free Chat</Title>
            <Text c="dimmed">
              Chat experience is coming together. Next steps wire up chatroom and realtime
              messaging.
            </Text>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
