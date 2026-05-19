import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
    env: {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      RESEND_API_KEY: 'test_key',
      RESEND_AUDIENCE_ID: 'test_audience',
      EMAIL_DOMAIN: 'resend.dev',
    },
  },
})
