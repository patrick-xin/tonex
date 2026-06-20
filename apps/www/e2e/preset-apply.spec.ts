import {
  expect,
  getSeedHex,
  gotoTheme,
  presetButton,
  presetChip,
  presetChoiceCard,
  presetDialog,
  seedField,
  setSeedHex,
  test,
} from './fixtures'

// Tier-3 (#180) — the shadcn preset dirty-gate. requestPresetSwitch is the one
// entry point for a preset chip, and its whole job is "a stray pick can't
// silently wipe user customizations": with nothing to decide it applies straight
// through (snappy), but a touched-and-unlocked seed routes through a keep-vs-adopt
// dialog so the user's tuning is never overwritten without consent. This suite
// pins that branch — clean pick = no dialog + preset seed adopted; touched pick =
// dialog; Current keeps the user seed; Preset adopts; Cancel applies nothing.
//
// Preset seeds are curated data in packages/core/src/theme/shadcn-presets.ts;
// asserted case-insensitively since the field may echo a different hex casing.
const STONE_HEX = /#161616/i // stone preset's curated seed
const PAPER_HEX = /#e3bfaa/i // paper preset's curated seed
const TOUCHED = '#123456' // an arbitrary user-edited seed, distinct from any preset

test.describe('shadcn preset apply', () => {
  test('a clean pick applies straight through — no dialog, preset seed adopted', async ({
    page,
  }) => {
    await gotoTheme(page, 'shadcn')
    // a fresh editor sits on the `default` preset with an untouched seed, so a
    // pick raises no decision: it applies immediately and supersedes the
    // untouched seed with the preset's curated one.
    await presetButton(page).click()
    await presetChip(page, 'stone').click()

    await expect(presetDialog(page)).toHaveCount(0)
    await expect(seedField(page)).toHaveValue(STONE_HEX)
  })

  test('a pick over a touched seed opens the keep-vs-adopt dialog', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    await setSeedHex(page, TOUCHED) // mark the seed touched

    await presetButton(page).click()
    await presetChip(page, 'paper').click()

    await expect(presetDialog(page)).toBeVisible()
    await expect(
      presetDialog(page).getByRole('heading', { name: /switch to paper/i }),
    ).toBeVisible()
  })

  test('keeping Current preserves the user seed', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    await setSeedHex(page, TOUCHED)
    await presetButton(page).click()
    await presetChip(page, 'paper').click()

    // the dialog defaults to "Current" (the safe choice) — apply as-is.
    await presetDialog(page).getByRole('button', { name: 'Apply' }).click()

    await expect(presetDialog(page)).toHaveCount(0)
    expect(await getSeedHex(page)).toBe(TOUCHED)
  })

  test('choosing Preset adopts the preset seed', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    await setSeedHex(page, TOUCHED)
    await presetButton(page).click()
    await presetChip(page, 'paper').click()

    await presetChoiceCard(page, 'Preset').click()
    await presetDialog(page).getByRole('button', { name: 'Apply' }).click()

    await expect(presetDialog(page)).toHaveCount(0)
    await expect(seedField(page)).toHaveValue(PAPER_HEX)
  })

  test('Cancel applies nothing — the touched seed survives', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    await setSeedHex(page, TOUCHED)
    await presetButton(page).click()
    await presetChip(page, 'paper').click()

    await presetDialog(page).getByRole('button', { name: 'Cancel' }).click()

    await expect(presetDialog(page)).toHaveCount(0)
    expect(await getSeedHex(page)).toBe(TOUCHED)
  })
})
