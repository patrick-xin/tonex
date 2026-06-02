import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: false,
    environment: 'jsdom',
    passWithNoTests: true,
    // why: vitest's default include matches BOTH *.test.ts and *.spec.ts, so it
    // would try to run the Playwright e2e specs (e2e/*.spec.ts) and crash on
    // `test.describe() ... not expected here`. Unit tests are *.test.ts under src
    // by convention; e2e is *.spec.ts under e2e/ and owned by Playwright. Pin the
    // include to the unit convention so the two runners never overlap.
    include: ['src/**/*.test.ts'],
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
