import { expect, getMode, getSeedHex, gotoTheme, modeToggle, test } from './fixtures'

// Tier-3 (#180) — the light/dark toggle. Mode is ambient (next-themes,
// `attribute="class"` on <html>); both modes are co-derived from the one seed, so
// the toggle changes how tokens resolve but must NOT touch the seed. This suite
// pins both halves: toggling flips the document mode + the control's affordance
// and a rendered token color responds, while the seed stays put across the flip.
// Direction-agnostic — the starting mode depends on the OS color-scheme default,
// so capture it and assert the flip rather than hard-coding light or dark.

test.describe('light/dark mode', () => {
  test('toggling flips the document mode and the control, without touching the seed', async ({
    page,
  }) => {
    await gotoTheme(page, 'shadcn')
    const seedBefore = await getSeedHex(page)
    const modeBefore = await getMode(page)
    const labelBefore = await modeToggle(page).getAttribute('aria-label')

    await modeToggle(page).click()

    // <html> flips light <-> dark (next-themes attribute="class")...
    await expect.poll(() => getMode(page)).not.toBe(modeBefore)
    // ...and the control re-labels to the new action (icon swap is visual-only).
    await expect(modeToggle(page)).not.toHaveAttribute('aria-label', labelBefore ?? '')
    // mode is ambient — the seed is mode-independent and must not move.
    expect(await getSeedHex(page)).toBe(seedBefore)
  })

  test('a rendered token color responds to the mode flip', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const modeBefore = await getMode(page)
    const bg = () => page.locator('body').evaluate((el) => getComputedStyle(el).backgroundColor)
    const bgBefore = await bg()

    await modeToggle(page).click()
    await expect.poll(() => getMode(page)).not.toBe(modeBefore)

    // the surface token re-resolves for the new mode — proof the flip drives the
    // derived palette, not just an <html> class.
    expect(await bg()).not.toBe(bgBefore)
  })
})
