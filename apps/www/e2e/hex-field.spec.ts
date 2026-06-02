import {
  expect,
  getSeedHex,
  gotoTheme,
  seedField,
  seedPickerTrigger,
  setSeedHex,
  test,
} from './fixtures'

// Tier-2 (#180) — the seed hex field's input contract. This is the exact field
// the original "sometimes out of sync" bug lived in, so its buffering rules are
// worth pinning: focus selects-all (type-to-replace), an invalid partial never
// commits and reverts on blur, a valid hex commits and propagates to the picker
// swatch, and the field never silently normalizes input the engine rejects
// (isValidHex is strict 6-digit, leading #). These are pure DOM/JS contracts —
// no MCU rounding — so they assert exact values.

test.describe('seed hex field', () => {
  test('focusing the field selects all, so the next keystroke replaces it', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const initial = await getSeedHex(page)

    await seedField(page).click()
    // the select-all is deferred to a rAF (so a click's caret placement doesn't
    // collapse it); poll until the whole value is selected rather than guess at timing.
    await expect
      .poll(() =>
        seedField(page).evaluate(
          (el: HTMLInputElement) => (el.selectionEnd ?? 0) - (el.selectionStart ?? 0),
        ),
      )
      .toBe(initial.length)

    await seedField(page).pressSequentially('#00ff00')
    await expect(seedField(page)).toHaveValue('#00ff00')
  })

  test('an invalid partial buffers but never commits, and reverts on blur', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const initial = await getSeedHex(page)

    await seedField(page).fill('#11')
    // buffered locally so a user can keep typing toward a full hex...
    await expect(seedField(page)).toHaveValue('#11')
    // ...but #11 isn't a valid hex, so the seed (and the picker swatch reading it)
    // must not move.
    await expect(seedPickerTrigger(page)).not.toHaveCSS('background-color', 'rgb(17, 17, 17)')

    await seedField(page).blur()
    // blur is the reconcile point: an uncommitted partial reverts to the live seed.
    await expect(seedField(page)).toHaveValue(initial)
  })

  test('a valid hex commits and propagates to the picker swatch', async ({ page }) => {
    await gotoTheme(page, 'shadcn')

    await setSeedHex(page, '#abcdef')
    // the swatch is the picker's own copy of the seed; it can only match if the
    // commit flowed field → store → picker. #abcdef === rgb(171, 205, 239).
    await expect(seedPickerTrigger(page)).toHaveCSS('background-color', 'rgb(171, 205, 239)')
  })

  test('rejects malformed hex without silently normalizing it', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const initial = await getSeedHex(page)

    // isValidHex is strict /^#[0-9a-fA-F]{6}$/ — no 3-digit expansion, no implicit
    // leading #. Each of these must buffer, never commit, and revert on blur. If
    // the field ever "helpfully" expanded #fff → #ffffff, this would catch it.
    for (const malformed of ['#fff', 'abcdef']) {
      await seedField(page).fill(malformed)
      await expect(seedField(page)).toHaveValue(malformed)
      await seedField(page).blur()
      await expect(seedField(page)).toHaveValue(initial)
    }
  })
})
