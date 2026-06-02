import {
  expect,
  getSeedHex,
  gotoTheme,
  hctSliderRangeInput,
  seedField,
  seedLockButton,
  seedPickerTrigger,
  setSeedHex,
  test,
} from './fixtures'

// Tier-3 (#180) — the seed lock. `seedHexLock` is the one switch that makes the
// seed read-only: every seed setter no-ops at the store seam (unit-tested in
// core-react), and the rail's inputs go DOM-disabled so the user can't drive one
// in the first place. This suite guards the user-facing half — locking renders
// the whole seed surface non-interactive and freezes the value, unlocking
// restores it — so a regression that drops the disabled wiring (and lets a write
// slip through the seam) is caught at the surface the user actually touches.

test.describe('seed lock', () => {
  test('locking disables every seed input and freezes the seed', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const before = await getSeedHex(page)

    // fresh load is unlocked, so the button offers "Lock seed".
    await seedLockButton(page).click()

    // the control flips to its unlock affordance — the lock took.
    await expect(
      page.getByRole('button', { name: 'Unlock seed' }).filter({ visible: true }),
    ).toBeVisible()

    // every seed-entry surface goes disabled: the hex field, the picker swatch,
    // and all three HCT axes (read via each slider's underlying range input).
    await expect(seedField(page)).toBeDisabled()
    await expect(seedPickerTrigger(page)).toBeDisabled()
    for (const axis of ['Hue', 'Chroma', 'Tone'] as const) {
      await expect(hctSliderRangeInput(page, axis)).toBeDisabled()
    }

    // and the seed itself can't drift while locked.
    expect(await getSeedHex(page)).toBe(before)
  })

  test('unlocking restores interaction and a fresh edit commits', async ({ page }) => {
    await gotoTheme(page, 'shadcn')

    await seedLockButton(page).click() // lock
    await expect(seedField(page)).toBeDisabled()

    await seedLockButton(page).click() // unlock
    await expect(seedField(page)).toBeEnabled()

    // the store-seam no-op is lifted: an edit now commits and propagates to the
    // picker swatch (#abcdef === rgb(171, 205, 239)).
    await setSeedHex(page, '#abcdef')
    expect(await getSeedHex(page)).toBe('#abcdef')
    await expect(seedPickerTrigger(page)).toHaveCSS('background-color', 'rgb(171, 205, 239)')
  })
})
