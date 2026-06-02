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
- **`seedField` targets the field by its accessible name, and visible-filters.**
  The editor mounts the rail twice (desktop aside + `sm:hidden` mobile drawer), so
  the seed input renders twice. It's addressed by its accessible name ("Seed color
  hex") rather than by id — the id is now per-mount unique (`useId`, after the
  duplicate-`id="hex-input"` bug this suite surfaced was fixed under #180).
  Filtering to the visible match keeps helpers pointed at the field the user sees;
  don't re-handle the twin per spec.
- **HCT sliders are anchored on `[data-slot="slider"]` + label text, not role.**
  Base UI's slider thumb exposes no nameable `role=slider` until late client
  mount, and each slider also carries a hidden `<input type="range">`. So
  `hctSlider`/`setHctValue` anchor on the labelled `data-slot` container and drive
  the inline `input[inputmode="decimal"]` editor (deterministic where a thumb drag
  is flaky). The custom *picker* popover's saturation area, by contrast, *is* a
  nameable `role=slider` — use `saturationArea(page)` and arrow keys.
- **The seed lock disables controls unevenly — assert on the range input.** When
  `seedHexLock` is set, the hex field and picker trigger get a real `disabled`
  attribute, but the Hue/Tone value buttons only *dim* (opacity + an onClick
  guard, no `disabled` prop) — so clicking one hangs on Playwright's actionability
  wait. The one signal consistent across all three axes is each slider's hidden
  `input[type="range"]`, which Base UI disables; use
  `hctSliderRangeInput(page, axis)` + `toBeDisabled()`, never a value-button click.
- **Preset chips match on `^name`, not `name#`.** A button's accessible name
  joins its child elements with a space (`"grove #27B08B"`), so a `#`-adjacent
  regex never fires even though `textContent` has no space (`"grove#27B08B"`).
  `presetChip` anchors on the leading name; this is a recurring accname-vs-text
  trap when a label and a value sit in sibling elements.
- **Preset dialog choice cards have no nameable radio.** The Current/Preset cards
  are `<label>`s wrapping a Base UI radio whose own accessible name is empty.
  Select by the visible label text (`presetChoiceCard(page, 'Current'|'Preset')`)
  and assert on the resulting *seed value* — the user-visible outcome — not the
  radio's checked state.
- **Mode is read off the `<html>` class.** next-themes runs `attribute="class"`,
  so the live mode is the `light`/`dark` class on `<html>` (`getMode(page)`); the
  toggle's truth is its action-phrased `aria-label`, not the icon. The starting
  mode follows the OS color-scheme default, so specs capture it and assert the
  *flip*, never hard-code light or dark.

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
| `seed-lock.spec.ts` | **Tier-3** — `seedHexLock` disables every seed input + freezes the seed; unlock restores |
| `preset-apply.spec.ts` | **Tier-3** — shadcn preset dirty-gate: clean pick applies, touched seed opens the keep-vs-adopt dialog |
| `theme-mode.spec.ts` | **Tier-3** — light/dark toggle flips the `<html>` mode + a token color, leaves the seed untouched |

Tiers 1–3 of issue #180 are implemented. One Tier-3 slice is **deliberately
deferred**: preset-apply preserving *existing custom colors* (ADR-0026 — a preset
overwrites the recipe but never `customColors`). The touched-seed keep-vs-adopt
branch is covered; asserting custom-color preservation needs the add-custom-color
UI flow, which isn't yet mapped here. Pick it up by seeding a custom color, then
applying a preset and asserting it survives.
