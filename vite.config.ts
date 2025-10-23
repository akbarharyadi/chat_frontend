import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const srcPath = (dir: string) => fileURLToPath(new URL(`./src/${dir}`, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': srcPath('app'),
      '@components': srcPath('components'),
      '@features': srcPath('features'),
      '@hooks': srcPath('hooks'),
      '@lib': srcPath('lib'),
      '@services': srcPath('services'),
      '@styles': srcPath('styles'),
      '@tests': srcPath('tests'),
      '@types': srcPath('types'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mantine: [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/notifications',
            '@mantine/modals',
          ],
          query: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setupTests.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
