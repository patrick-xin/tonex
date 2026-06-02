// why: Next dev compiles each route on its first request, and a cold compile of
// the editor routes (/theme, /theme/shadcn) easily outruns a test's default
// timeout — so the first spec to touch them flakes locally, while CI (a
// precompiled `next start`) stays green and hides it. Warm every route the suite
// navigates to once, here, before any test runs: requesting a route and awaiting
// the response blocks on its compilation, so by the time tests start the dev
// server serves them instantly. In CI the build is already done, so this is a
// cheap no-op. A warm failure is non-fatal — the test itself surfaces real breakage.
// why: track PORT like playwright.config.ts so warm-up hits the server the tests
// actually run against, not a sibling worktree's dev server squatting on :3000.
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`
const ROUTES = ['/', '/theme', '/theme/shadcn']

async function globalSetup() {
  await Promise.all(
    ROUTES.map((route) =>
      fetch(BASE_URL + route).catch(() => {
        /* non-fatal: a failed warm-up just means the first test pays the compile */
      }),
    ),
  )
}

export default globalSetup
