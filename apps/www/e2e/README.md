# www E2E (Playwright)

The browser tier. It exists for the one bug class `vitest` + `jsdom` cannot see:
**render-timing and cross-navigation state sync** (issue #180). `act()` flushes
effects synchronously, so a lagging `useEffect` mirror and a render-time sync
produce identical final state — both pass a unit test. Only a real browser across
a real navigation observes the stale frame. If a bug is "sometimes out of sync,"
it belongs here; if it's pure logic, keep it in a `vitest` unit test.

## Run

```bash
pnpm --filter @tonex/www e2e          # headless run
pnpm --filter @tonex/www e2e:ui       # Playwright UI / time-travel debugger
pnpm --filter @tonex/www e2e:report   # open the last HTML report
```

First run on a fresh machine needs the browser binary once:

```bash
pnpm --filter @tonex/www exec playwright install chromium
```

Locally the config runs `next dev` and **reuses an already-running `pnpm dev`**.
CI does a prod-like `next build && next start` to exercise the true hydration
path the bug rode in on.

## Writing a spec

Import everything from `./fixtures` — never import `@playwright/test` directly in
a spec. The fixtures module is the reusable foundation; add a helper there the
moment a second spec would re-derive a selector or a wait.

```ts
import { test, expect, gotoTheme, setSeedHex, getSeedHex } from './fixtures'

test('seed survives a layer switch', async ({ page }) => {
  await gotoTheme(page, 'md')
  await setSeedHex(page, '#2e5bff')
  await gotoTheme(page, 'shadcn')
  expect(await getSeedHex(page)).toBe('#2e5bff') // the #180 Tier-1 assertion
})
```

### Conventions

- **Assert on what the user sees**, never on store internals — the field value,
  the swatch color, a rendered token. Divergence between displayed values *is* the
  bug class.
- **Always settle hydration first.** `gotoTheme` does this; if you `page.goto`
  directly, call `waitForHydrated(page)` before interacting (the store rehydrates
  after first paint — ADR-0015).
- **Seed via the UI** (`setSeedHex` / `pickPreset`), not localStorage injection.
  The persist wire-shape is freely mutable pre-launch; UI-driven helpers don't
  couple to it and exercise the real onChange → store → re-render path.
- **One selector, one place.** Element accessors live in `fixtures.ts`. If a spec
  needs a new one, add an exported accessor rather than inlining a locator.
- **Navigate in-app, then assert the URL.** `enterEditor` (landing → editor) and
  `crossToLayer` (md ↔ shadcn) click real links and `waitForURL` before settling
  hydration, so a no-op navigation fails as "wrong page", not "field never loaded".

### Gotchas already handled by the foundation

You inherit these — they're documented so a new spec knows *why* the seam looks the
way it does, not so it has to re-solve them:

- **Onboarding tour is auto-suppressed.** The editor pops a focus-trapping
  first-run tour whenever the `guide_seen` cookie is absent, and every Playwright
  context starts cookieless. The extended `test` in `fixtures.ts` seeds that cookie
  on the context, so the tour never steals focus mid-spec. (This is the one
  exception to "no storage injection" — it's environment setup, not theme state.)
- **Editor routes are warmed once.** `next dev` compiles a route on first request;
  a cold compile outruns a test timeout. `global-setup.ts` requests `/`, `/theme`,
  `/theme/shadcn` before any test so the first spec doesn't pay (and flake on) the
  compile. No-op under CI's prod build.
- **`seedField` targets the *visible* `#hex-input`.** The editor mounts the rail
  twice (desktop aside + `sm:hidden` mobile drawer), so two elements share
  `id="hex-input"` — a real uniqueness bug logged under #180. Filtering to the
  visible match keeps helpers pointed at the field the user sees; don't re-handle
  the duplicate per spec.
- **HCT sliders are anchored on `[data-slot="slider"]` + label text, not role.**
  Base UI's slider thumb exposes no nameable `role=slider` until late client
  mount, and each slider also carries a hidden `<input type="range">`. So
  `hctSlider`/`setHctValue` anchor on the labelled `data-slot` container and drive
  the inline `input[inputmode="decimal"]` editor (deterministic where a thumb drag
  is flaky). The custom *picker* popover's saturation area, by contrast, *is* a
  nameable `role=slider` — use `saturationArea(page)` and arrow keys.

## Layout

| File | Role |
|---|---|
| `../playwright.config.ts` | webServer, baseURL, chromium, CI retries, globalSetup, timeouts |
| `global-setup.ts` | warms editor routes so a cold `next dev` compile isn't read as flake |
| `fixtures.ts` | single import surface: `test`/`expect` + reusable seam helpers |
| `smoke.spec.ts` | proves the harness boots + hydrates (not feature coverage) |
| `seed-sync.spec.ts` | **Tier-1** — seed stays in sync across navigation + seed-entry surfaces |
| `hex-field.spec.ts` | **Tier-2** — seed hex field input contract (select-all, invalid-revert, no silent normalization) |
| `hct-controls.spec.ts` | **Tier-2** — HCT axes ↔ hex reconcile, 0/360 verbatim, gamut clamp, picker round-trip |

Tier-3 (preset-vs-custom, `seedHexLock` disabling the rail, light/dark toggle)
from issue #180 builds on these primitives — see the issue for the prioritized list.
