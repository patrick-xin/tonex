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

Locally the config runs `next dev -p ${PORT}` and **reuses an already-running `pnpm dev`**.
CI does a prod-like `next build && next start -p ${PORT}` to exercise the true hydration
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

### Selectors: accessible name by default, `data-testid` for identity

Prefer `getByRole` / `getByLabel` / `getByText`. They assert a *user-facing
contract* and double as free a11y coverage — when one breaks, something a user can
perceive changed. The ladder is **role → label → text → testid**. Reach for
`data-testid` only when an element's *identity* can't be reliably expressed by an
accessible name: the moment a semantic selector needs a uniqueness trick
(`.or()`, `.first()`, `nth`, structural scoping) or pins to copy that can change
for non-test reasons, that's the signal to promote to a testid.

Two questions decide it:

1. Could a behaviour-neutral change break this selector? (marketing copy, a second
   CTA with the same words, a duplicated collection label)
2. Is the element load-bearing for a flow? (a nav entry, a critical trigger)

**Two yeses → `data-testid`.** One or none → stay semantic. The accessible name is
the default precisely because it's free a11y signal; keep the testid'd set *small*,
or you train the suite (and the agents writing it) to ignore accessibility.

**Find and assert are separate handles.** Find by the stable thing; assert on the
user-visible state. It's correct — often better — to `getByTestId(...).click()`
then `expect(page).toHaveURL(...)` / assert the rendered value. The selector only
has to *locate*; the assertion carries the user-facing meaning. (`hctSlider`
already does this — finds by `data-slot`, asserts on the rendered value.)

**A testid is an API the moment it exists.** Name it for its role in the flow
(`cta-md`, `seed-preset-<hex>`), never its implementation (`rainbow-button-2`);
renaming one is a breaking change to the suite.

What lands where in this app:

| Element | Selector | Why |
|---|---|---|
| Nav / flow-entry CTAs | `data-testid` (`cta-md`, `cta-shadcn`) | copy-driven + load-bearing; labels collide — the hero "Try tonex" link and the FinalCta pill share the words |
| Collection items (preset chips, rows) | `data-testid` keyed by their data (`seed-preset-<hex>`) | names aren't unique by design; the hex *is* the identity the spec asserts |
| Stateful controls (mode toggle, seed lock) | `getByRole` + name | the label encodes the state — `"Switch to dark mode"` breaking *is* the bug to catch |
| Form fields (seed hex) | `getByLabel` | the accessible name is the real contract |
| No accessible handle (decorative trigger, shader canvas) | `data-slot` / role anchor, then testid | last resort; never styling classes |

> The case this rule came from: `enterEditor` matched the accessible name "Try
> tonex" via `getByRole('link').or(getByRole('button'))`. Unique the day it was
> written — until the FinalCta pill (`RainbowButton`, default children
> `'Try tonex'`) added a second match and the union went strict-mode-ambiguous.
> The label was *content*, not *identity*. An agent reading the DOM can't see that
> collision coming; a testid on the navigating CTA makes the identity explicit.

### Gotchas already handled by the foundation

You inherit these — they're documented so a new spec knows *why* the seam looks the
way it does, not so it has to re-solve them:

- **Onboarding tour is auto-suppressed.** The editor pops a focus-trapping
  first-run tour whenever the `guide_seen` cookie is absent, and every Playwright
  context starts cookieless. The extended `test` in `fixtures.ts` seeds that cookie
  on the context, so the tour never steals focus mid-spec. (This is the one
  exception to "no storage injection" — it's environment setup, not theme state.)
- **Editor and site routes are warmed once.** `next dev` compiles a route on first request;
  a cold compile outruns a test timeout. `global-setup.ts` requests `/`, `/theme`,
  `/theme/shadcn`, `/about` before any test so the first spec doesn't pay (and flake
  on) the compile. No-op under CI's prod build.
- **The Next dev indicator is disabled once.** Next 16's local devtools portal sits
  bottom-right, the same corner as the marketing menu color picker, and can
  intercept clicks. `global-setup.ts` POSTs to Next's dev-only disable endpoint;
  in CI's `next start` it is a harmless failed request.
- **`seedField` targets the field by its accessible name, and visible-filters.**
  The editor mounts the rail twice (desktop aside + `sm:hidden` mobile drawer), so
  the seed input renders twice. It's addressed by its accessible name ("Seed color,
  hex or oklch") rather than by id — the id is now per-mount unique (`useId`, after the
  duplicate-`id="hex-input"` bug this suite surfaced was fixed under #180).
  Filtering to the visible match keeps helpers pointed at the field the user sees;
  don't re-handle the twin per spec. **That accessible name is copy-volatile *and*
  load-bearing.** When the field gained oklch paste (5b2919c) the label widened from
  `"Seed color hex"`, and because every editor *and* landing spec routes through
  `seedField`/`landingSeedField`, the whole suite went red at once on a change with
  no behavioural meaning. By this doc's own two-yeses rule that makes the seed input
  a `data-testid` promotion candidate (tracked as a follow-up issue); until that
  lands, any edit to this label must update both accessors in `fixtures.ts` and this
  note together.
- **HCT sliders are anchored on `[data-slot="slider"]` + label text, not role.**
  Base UI's slider thumb exposes no nameable `role=slider` until late client
  mount, and each slider also carries a hidden `<input type="range">`. So
  `hctSlider`/`setHctValue` anchor on the labelled `data-slot` container and drive
  the inline `input[inputmode="decimal"]` editor (deterministic where a thumb drag
  is flaky). The custom *picker* popover's saturation area, by contrast, *is* a
  nameable `role=slider` — use `saturationArea(page)` and arrow keys.
- **The seed lock folds the HCT/image inputs away — assert the disclosure, not the
  sliders.** When `seedHexLock` is set, the always-on hex field + picker trigger get
  a real `disabled` attribute, but the HCT/image inputs live in the "Source Control"
  disclosure, which `ShadcnSourceColor`/`SourceColorTabs` *force-close* on lock
  (`setOpen(false)`) — so the sliders collapse out of the page entirely. An earlier
  draft asserted each slider's hidden `input[type="range"]` was `toBeDisabled()`;
  that only passed by racing the close animation and broke once reduced-motion made
  the collapse instant. Assert `sourceControlToggle(page)` is
  `aria-expanded="false"` instead — it flips synchronously with the lock state, no
  race. (Per-axis disabled state is already unit-tested at the store seam.)
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
| `global-setup.ts` | disables local Next dev indicator + warms suite routes so cold `next dev` compile isn't read as flake |
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
