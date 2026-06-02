import { defineConfig, devices } from '@playwright/test'

// why: the E2E tier exists to catch the one bug class vitest + jsdom are blind to
// by construction — render-timing and cross-navigation state sync (issue #180).
// `act()` collapses the paint→effect boundary, so a lagging mirror and a
// render-time sync produce identical final state and both pass a unit test; only
// a real browser across a real navigation can observe the stale frame. This file
// is the FOUNDATION: webServer + one smoke. The Tier-1/2 suites land on top.

const PORT = 3000
const BASE_URL = `http://localhost:${PORT}`

// why: the app reads these at module load (subscribe route, app URL). Mirror the
// values vitest.config.ts injects so `next build` / `next start` don't crash in
// CI where real secrets are absent. Never put real secrets here.
const APP_ENV = {
  NEXT_PUBLIC_APP_URL: BASE_URL,
  RESEND_API_KEY: 'test_key',
  EMAIL_DOMAIN: 'resend.dev',
}

export default defineConfig({
  testDir: './e2e',
  // why: warm the editor routes before any test so a cold Next-dev compile can't
  // masquerade as a render-timing flake (see e2e/global-setup.ts).
  globalSetup: './e2e/global-setup.ts',
  // why: generous-but-finite ceilings. Hydration + a first interaction across a
  // navigation can take a few seconds even warm; defaults (30s test / 5s expect)
  // are too tight and read as flake. Finite so a genuine hang still fails loud.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // why: render-timing assertions are flake-prone under CI load; retry there
  // only — locally a flake should fail loud so we fix the test, not paper over it.
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // why: prod-like `next start` in CI to exercise the real hydration path the
    // bug rode in on (CI builds in a prior step, so this only boots); `dev`
    // locally for fast iteration, reusing an already-running `pnpm dev` instead
    // of double-spawning. cwd defaults to this config's dir (apps/www).
    command: process.env.CI ? 'pnpm start' : 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: APP_ENV,
  },
})
