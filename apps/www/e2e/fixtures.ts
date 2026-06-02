import { test as base, expect, type Locator, type Page } from '@playwright/test'
import type { Mode } from '@tonex/core'

// why: track PORT like playwright.config.ts so the guide_seen cookie is scoped to
// the same origin the tests run against — a PORT override (sibling-worktree
// collision avoidance) would otherwise set the cookie for :3000 while tests hit
// :3100, re-arming the focus-trapping onboarding tour.
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`

// why: single import surface for every e2e spec — `import { test, expect, ... }
// from './fixtures'`. Keeps Playwright's globals and the repo's reusable helpers
// in one place so a new spec never re-derives selectors or the hydration-wait
// dance. This is the reusable foundation issue #180 asked for: write the seam
// primitives once, here; specs compose them.
//
// The base `test` is extended once, here, to suppress the editor's first-run
// onboarding tour: it auto-opens a focus-trapping modal whenever the `guide_seen`
// cookie is absent (guide-context.tsx), and every Playwright context starts
// cookieless — so without this the tour fires mid-spec, steals focus, and drops
// the rest of the UI (nav, cross-layer link) out of the accessible tree. Seeding
// the cookie on the context before any page loads is test-environment setup, not
// theme-state injection: the seed itself is still driven through the UI.
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addCookies([{ name: 'guide_seen', value: '1', url: BASE_URL }])
    await use(context)
  },
})
export { expect }

// why: the two theme layers the rail renders into. The seed/source controls are
// shared across both, so navigating between them is exactly the seam #180's
// Tier-1 smoke exercises — set a seed on one layer, assert it survives the route
// change to the other (the original "out of sync after navigation" repro).
export const THEME_PATHS = {
  md: '/theme',
  shadcn: '/theme/shadcn',
} as const
export type ThemeLayer = keyof typeof THEME_PATHS

// why: the canonical seed hex field (source-color/hex-input.tsx). Targeted by its
// accessible name ("Seed color hex", set via aria-label when the visible "Hex"
// label is hidden in the rail) — NOT by id: the editor mounts the rail twice (the
// desktop aside `hidden sm:flex` + the `sm:hidden` mobile drawer) and the id is
// now per-mount unique (useId), so an id selector no longer addresses it. Two
// mounts still exist, so visible-filter keeps every helper pointed at the field
// the user sees. exact:true so it can't bleed into the landing field, whose name
// is the superset "Seed color hex value".
export function seedField(page: Page) {
  return page.getByLabel('Seed color hex', { exact: true }).filter({ visible: true })
}

// why: the store rehydrates from localStorage *after* first paint (the ADR-0015
// hydration gate) and only then derives the seed. Treat "the seed field holds a
// hex-shaped value" as the hydration-complete signal — every interaction helper
// waits on it first so specs don't race the rehydrate. Playwright auto-retries
// the assertion until it settles or times out. Pass an explicit field for pages
// whose seed surface isn't #hex-input (e.g. the landing SeedTrigger).
export async function waitForHydrated(page: Page, field: Locator = seedField(page)) {
  await expect(field).toHaveValue(/#?[0-9a-fA-F]{3,7}/)
}

// why: navigate to a theme layer and block until hydration settles, so callers
// always start from a known-good state rather than an empty pre-hydration frame.
export async function gotoTheme(page: Page, layer: ThemeLayer) {
  await page.goto(THEME_PATHS[layer])
  await waitForHydrated(page)
}

// why: read the seed as the *user sees it* — the field's displayed value, not the
// store. Divergence between this and the swatch / store is the entire bug class,
// so specs assert on this, never on internal state.
export async function getSeedHex(page: Page) {
  return (await seedField(page).inputValue()).trim()
}

// why: drive the seed the way a user does — fill then commit with Enter.
// UI-driven on purpose: (1) it stays correct as the persist wire-shape mutates
// pre-launch (localStorage injection would couple to the schema), and (2) it
// exercises the real onChange → store → re-render path the bug lived in. For
// per-keystroke buffering tests (Tier-2), use `field.pressSequentially` instead.
export async function setSeedHex(page: Page, hex: string) {
  const field = seedField(page)
  await field.fill(hex)
  await field.press('Enter')
  await expect(field).toHaveValue(hex)
}

// why: the landing preset row (presets-row.tsx) is the other seed entry point and
// the one in the original repro (click preset → navigate → out of sync). Click by
// visible name; the caller asserts the downstream effect.
export async function pickPreset(page: Page, name: string) {
  await page.getByRole('button', { name }).click()
}

// why: the landing seed surface is SeedTrigger (an inline <input> labelled "Seed
// color hex value" + a decorative swatch), NOT the editor's #hex-input. Its own
// accessor so landing specs read the seed the user sees there. Same fixed
// useHexFieldState hook underneath — so this and #hex-input can never disagree
// on the active seed, which is the invariant the seed-sync specs assert.
export function landingSeedField(page: Page) {
  return page.getByLabel('Seed color hex value')
}

// why: the swatch rendered immediately before the landing seed input (aria-hidden,
// inline background-color: seedHex). Field text and swatch fill must reflect one
// seed — divergence is the bug class. Targeted by DOM position rather than its
// utility classnames so a restyle doesn't break the selector.
export function landingSeedSwatch(page: Page) {
  return landingSeedField(page).locator('xpath=preceding-sibling::span[1]')
}

// why: the landing presets (presets-row.tsx) as name → the seed hex each commits.
// Specs assert the downstream value without re-hardcoding it per test; if the row
// changes, this one map updates with it.
export const LANDING_PRESETS = {
  Cobalt: '#2e5bff',
  Tangerine: '#ff6a1a',
  Sage: '#478f5c',
  Iris: '#7a2fff',
  Lagoon: '#00c4c9',
  Ruby: '#e54666',
} as const

// why: the cross-layer link in the editor rail (nav-tabs.tsx crossLink). Its label
// is the *target* layer's display name — "Shadcn" on the md rail, "MD3" on the
// shadcn rail. Rendered as a Button-as-Link, so match either role to stay robust
// to that wrapper. This is the md ↔ shadcn navigation the Tier-1 round-trip rides.
const CROSS_LINK_LABEL = { md: 'MD3', shadcn: 'Shadcn' } as const
export async function crossToLayer(page: Page, target: ThemeLayer) {
  const label = CROSS_LINK_LABEL[target]
  await page
    .getByRole('link', { name: label, exact: true })
    .or(page.getByRole('button', { name: label, exact: true }))
    .click()
  // why: assert we actually landed on the target layer before waiting on its seed
  // field — a navigation that silently no-ops then fails as "wrong page", not as a
  // confusing "field never hydrated".
  await page.waitForURL((url) => url.pathname === THEME_PATHS[target])
  await waitForHydrated(page)
}

// why: the landing CTAs into each editor layer (hero-content.tsx) — "Try tonex"
// → /theme, "shadcn mode" → /theme/shadcn. Client-side next/link navigation, which
// is what the original repro exercised (set seed on landing, then enter the editor).
const CTA_LABEL = { md: 'Try tonex', shadcn: 'shadcn mode' } as const
export async function enterEditor(page: Page, target: ThemeLayer) {
  const label = CTA_LABEL[target]
  await page
    .getByRole('link', { name: label })
    .or(page.getByRole('button', { name: label }))
    .click()
  await page.waitForURL((url) => url.pathname === THEME_PATHS[target])
  await waitForHydrated(page)
}

// ── HCT control sliders (hct-controls/) ────────────────────────────────────
// why: the seed's HCT axes are the *other* canonical seed input (ADR-0028: hex,
// HCT, image all write the one seed). They live in the "Source Control"
// disclosure, which is open with the HCT tab active by default — so on a fresh
// editor load all three sliders are already visible, no setup gesture needed.
// Base UI's slider thumb does NOT expose a nameable role=slider (verified live:
// getByRole('slider') is empty until the custom picker popover opens), so anchor
// on the data-slot container carrying the axis label. .filter({ visible: true })
// drops the sm:hidden mobile-rail twin, same duplicate-mount reason as seedField.
export type HctAxis = 'Hue' | 'Chroma' | 'Tone'
export function hctSlider(page: Page, axis: HctAxis) {
  return page
    .locator('[data-slot="slider"]', {
      has: page.locator('[data-slot="slider-label"]', { hasText: new RegExp(`^${axis}$`) }),
    })
    .filter({ visible: true })
}

// why: each axis renders its value as a clickable button (`value.toFixed(2)`,
// chroma also appends " / {gamutCeiling}"). It's both the read-out and the seam
// into the inline numeric editor. One accessor so a markup change is fixed once.
export function hctValueButton(page: Page, axis: HctAxis) {
  return hctSlider(page, axis).locator('button[type="button"]')
}

// why: read an axis as the user sees it — the displayed `.toFixed(2)`. parseFloat
// takes the leading number, so chroma's "47.86 / 87" reads 47.86 (the value, not
// the ceiling). Reading the rendered string, never the store, keeps these specs
// honest about what reconciled to the screen.
export async function getHctValue(page: Page, axis: HctAxis) {
  const text = (await hctValueButton(page, axis).textContent()) ?? ''
  return Number.parseFloat(text)
}

// why: the gamut ceiling chroma shows as " / {n}" — the wall the slider clamps
// to. Returns null for hue/tone, which have no ceiling suffix.
export async function getChromaGamutCeiling(page: Page) {
  const text = (await hctValueButton(page, 'Chroma').textContent()) ?? ''
  const m = text.match(/\/\s*([\d.]+)/)
  return m ? Number.parseFloat(m[1]) : null
}

// why: drive an axis the precise way the keyboard user does — click the value to
// open the inline editor, type, commit with Enter. Deterministic where a thumb
// drag is flaky, and it exercises the real commitDraft → setSeed{Axis} path
// (clamping included), which is exactly what the 0/360 and gamut-wall specs probe.
export async function setHctValue(page: Page, axis: HctAxis, value: number) {
  await hctValueButton(page, axis).click()
  // why: scope to the inline editor's decimal input — Base UI's slider also
  // mounts a hidden <input type="range"> in the same container, so a bare
  // `input` locator is ambiguous (strict-mode violation).
  const input = hctSlider(page, axis).locator('input[inputmode="decimal"]')
  await input.fill(String(value))
  await input.press('Enter')
}

// ── custom color picker (color-picker/custom/) ─────────────────────────────
// why: the seed swatch in SourceColorSection is the only size-12 ColorPicker
// trigger on the page (palette/role pickers default to size-8 — verified live:
// exactly one match). It's a styled PopoverTrigger button with no accessible
// name, so it can't be reached by role+name; the size class is the stable hook.
export function seedPickerTrigger(page: Page) {
  return page.locator('button.size-12')
}

// why: the hex field *inside* the picker popover (aria-label "Hex value"), a
// distinct surface from the rail's #hex-input but wired to the same seed onChange.
// Editing it is an external write from useColorManipulation's view, so it's how
// the picker-mirror spec drives a seed change the saturation read-out must follow.
export function pickerHexField(page: Page) {
  return page.getByLabel('Hex value')
}

// why: the 2D saturation/brightness area is a role=slider exposing its state as
// aria-valuetext ("Saturation s%, Brightness v%"). Asserting that text tracks an
// external seed change reads the use-color-manipulation hex→hsva mirror without a
// flaky pointer drag.
export function saturationArea(page: Page) {
  return page.getByRole('slider', { name: /saturation/i })
}

// ── seed lock (source-color/color-lock.tsx) ────────────────────────────────
// why: the lock toggle's accessible name IS its state — "Lock seed" while
// unlocked (click to lock), "Unlock seed" while locked. Match either so a spec
// can find the control regardless of state; the spec reads/clicks the specific
// label it expects. Visible-filtered for the same desktop/mobile dual-mount
// reason as seedField. When locked, every seed setter no-ops at the store seam
// AND these controls go DOM-disabled: the hex field and picker trigger get a
// real `disabled` attribute, and each HCT slider disables its underlying Base UI
// `input[type=range]` (verified live — the value buttons also become
// unactionable, so a spec must assert disabled, never try to click them).
export function seedLockButton(page: Page) {
  return page.getByRole('button', { name: /^(Lock|Unlock) seed$/ }).filter({ visible: true })
}

// why: the hidden range input Base UI mounts inside each slider is the one
// element that carries a real `disabled` attribute consistently across all three
// axes (the Hue/Tone value buttons dim via opacity + an onClick guard, not a
// `disabled` prop). Asserting toBeDisabled() on it reads the slider's locked
// state semantically rather than via a brittle opacity class.
export function hctSliderRangeInput(page: Page, axis: HctAxis) {
  return hctSlider(page, axis).locator('input[type="range"]')
}

// ── shadcn preset picker (shadcn-presets/) ─────────────────────────────────
// why: the editor's preset entry point — a secondary icon button labelled
// "Preset" (shadcn layer only; md has no preset concept per ADR-0026). Distinct
// from the landing presets-row Tier-1 covers. Opens a popover of preset chips.
export function presetButton(page: Page) {
  return page.getByRole('button', { name: 'Preset', exact: true }).filter({ visible: true })
}

// why: each chip is a button whose accessible name starts with the preset name
// (the swatch strip is decorative, so the name leads). Anchor on `^{name}` —
// NOT `{name}#`: the accname algorithm joins child elements with a space
// ("grove #27B08B"), so a `#`-adjacent match never fires. `^` keeps it a button
// (excludes the non-button hover preview card) and unique per preset. Open the
// picker first (presetButton click) — chips only render then.
export function presetChip(page: Page, name: string) {
  return page.getByRole('button', { name: new RegExp(`^${name}`, 'i') }).filter({ visible: true })
}

// why: the keep-vs-adopt confirmation. requestPresetSwitch only opens it when a
// pick raises a decision — a drifted recipe, or a touched-and-unlocked seed /
// touched contrast (predicate.ts). Title is "Switch to {name}?", so match on it;
// a clean pick applies straight through and this never mounts (assert count 0).
export function presetDialog(page: Page) {
  return page.getByRole('dialog', { name: /switch to/i })
}

// why: the seed/contrast choice cards are <label>s wrapping a Base UI radio whose
// own accessible name is empty — so target the card by its visible label text
// ("Current" keeps the user's value, "Preset" adopts the preset's). Clicking the
// label selects the nested radio. Scoped to the dialog so the words can't match
// elsewhere. The real assertion is always the resulting seed value, not the
// radio's checked state.
export function presetChoiceCard(page: Page, choice: 'Current' | 'Preset') {
  return presetDialog(page).locator('label').filter({ hasText: choice })
}

// ── light/dark mode (components/shared/theme-mode-toggle.tsx) ───────────────
// why: the Base UI Toggle renders a <button> whose action-phrased aria-label is
// the truth ("Switch to dark mode" while light, "Switch to light mode" while
// dark) — the icon swap is visual-only. Two mount sites (rail-footer desktop +
// mobile-nav-drawer); the drawer one stays hidden at desktop width, so
// visible-filter to the one the user sees. The control is disabled until
// next-themes resolves on the client, so prefer auto-waiting assertions.
export function modeToggle(page: Page) {
  return page
    .getByRole('button', { name: /switch to (light|dark) mode/i })
    .filter({ visible: true })
}

// why: mode is ambient via next-themes `attribute="class"` — it writes "light" or
// "dark" onto <html>. Reading that class is how a spec observes the active mode
// the user sees, without coupling to next-themes' storage. Returns the live mode.
export async function getMode(page: Page): Promise<Mode> {
  const cls = (await page.locator('html').getAttribute('class')) ?? ''
  return cls.split(/\s+/).includes('dark') ? 'dark' : 'light'
}
