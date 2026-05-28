import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: false,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      RESEND_API_KEY: 'test_key',
      EMAIL_DOMAIN: 'resend.dev',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // why: .tsx components aren't wired for rendering tests yet; the
      // include: 'src/**/*.ts' restriction keeps coverage focused on the
      // logic we own (hooks, helpers, stores, route handlers). Widen to
      // .tsx when component tests land.
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.config.ts', 'src/app/**', 'src/emails/**', 'scripts/**'],
    },
  },
})
