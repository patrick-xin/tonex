import {
  crossToLayer,
  enterEditor,
  expect,
  getSeedHex,
  gotoTheme,
  hexToRgbCss,
  landingSeedField,
  landingSeedSwatch,
  pickFirstPreset,
  seedField,
  setSeedHex,
  test,
  waitForHydrated,
} from './fixtures'

// why: Tier-1 of issue #180 — the seed must stay in sync with the active source
// across every navigation and seed-entry surface. This is the flow the original
// "field sometimes out of sync" bug shipped in: the prop→state mirror in
// use-hex-field-state used a post-paint useEffect, so an external write (preset
// swap, hydration) left the field one painted frame behind. The fix syncs during
// render.
//
// HONEST SCOPE: the bug's symptom was a *self-correcting one-frame flicker*.
// Playwright assertions auto-retry, so they converge on the buggy and fixed code
// alike — the same reason the jsdom unit test couldn't catch it (both versions
// reach an identical final state). These specs therefore do NOT assert the
// sub-frame flash; they guard the *persistent* invariant — the seed always
// reconciles to the active value across navigation/hydration, and field and
// swatch never disagree about it. That catches the regressions that actually
// matter: a mirror that stops reconciling, reconciles to the wrong value, or
// loses the seed across a route change.
test.describe('seed sync across navigation', () => {
  test('a landing preset survives the navigation into the md editor', async ({ page }) => {
    await page.goto('/')
    await waitForHydrated(page, landingSeedField(page))

    const hex = await pickFirstPreset(page)
    await expect(landingSeedField(page)).toHaveValue(hex)

    // client-side nav (next/link), not a reload — exercises the remount path the
    // store carries the seed through, exactly as the original repro did.
    await enterEditor(page, 'md')
    await expect(seedField(page)).toHaveValue(hex)
  })

  test('a landing preset survives the navigation into the shadcn editor', async ({ page }) => {
    await page.goto('/')
    await waitForHydrated(page, landingSeedField(page))

    const hex = await pickFirstPreset(page)
    await expect(landingSeedField(page)).toHaveValue(hex)

    await enterEditor(page, 'shadcn')
    await expect(seedField(page)).toHaveValue(hex)
  })

  test('an edited seed survives the md ↔ shadcn round trip', async ({ page }) => {
    await gotoTheme(page, 'md')
    await setSeedHex(page, '#ff0000')

    // md and shadcn are separate route-layout groups, so crossing remounts the
    // source-color section — the seed has to be re-derived from the store, not
    // remembered by the component.
    await crossToLayer(page, 'shadcn')
    await expect(seedField(page)).toHaveValue('#ff0000')

    await crossToLayer(page, 'md')
    await expect(seedField(page)).toHaveValue('#ff0000')
  })

  test('the landing seed field and swatch render the same seed', async ({ page }) => {
    await page.goto('/')
    await waitForHydrated(page, landingSeedField(page))

    // the swatch fill is the seed projected to a background-color, so it must track
    // the field's text value — assert both against the same runtime-derived hex.
    const hex = await pickFirstPreset(page)
    await expect(landingSeedField(page)).toHaveValue(hex)
    await expect(landingSeedSwatch(page)).toHaveCSS('background-color', hexToRgbCss(hex))
  })

  test('a seed edited in the editor flows back to the landing seed surface', async ({ page }) => {
    await gotoTheme(page, 'md')
    await setSeedHex(page, '#123456')
    expect(await getSeedHex(page)).toBe('#123456')

    // the landing has no crossLink; navigate via the logo/home is out of scope
    // here, so reload the landing route. Even a full reload must rehydrate the
    // edited seed from storage onto the landing SeedTrigger.
    await page.goto('/')
    await expect(landingSeedField(page)).toHaveValue('#123456')
  })
})
