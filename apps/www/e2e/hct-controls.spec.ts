import {
  expect,
  getChromaGamutCeiling,
  getHctValue,
  getSeedHex,
  gotoTheme,
  pickerHexField,
  saturationArea,
  seedField,
  seedPickerTrigger,
  setHctValue,
  setSeedHex,
  test,
} from './fixtures'

// Tier-2 (#180) — the HCT sliders and the custom color picker. These are the
// "other" seed inputs (ADR-0028: hex, HCT, and image all write the one seed), so
// the invariant under test is that all of them stay reconciled: editing an HCT
// axis reprojects the hex, a hex edit flows back into the HCT read-outs, and the
// picker mirrors the seed in both directions. Two HCT-specific contracts ride
// along: hue is kept verbatim (360 must not snap to 0 — ADR-0028), and chroma
// pins to its hue/tone-dependent gamut wall. HCT axes are stored canonically and
// read off the rendered .toFixed(2) read-out; values that route through MCU's hex
// projection are asserted by direction/band, not exact equality.

const HEX = /^#[0-9a-fA-F]{6}$/

test.describe('HCT control sliders', () => {
  test('editing the Tone axis reprojects a new seed hex', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const initialHex = await getSeedHex(page)

    await setHctValue(page, 'Tone', 80)

    // tone is stored canonically, so the read-out is exact...
    expect(await getHctValue(page, 'Tone')).toBe(80)
    // ...and the hex field must reproject off the new HCT, not keep the old value.
    const next = await getSeedHex(page)
    expect(next).toMatch(HEX)
    expect(next).not.toBe(initialHex)
  })

  test('a hex edit reconciles back into the HCT read-outs', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const baselineHue = await getHctValue(page, 'Hue') // ~299 (default purple)
    const baselineTone = await getHctValue(page, 'Tone')

    await setSeedHex(page, '#ff0000')

    // the exact hex the user typed is preserved (no drift through the round-trip)...
    await expect(seedField(page)).toHaveValue('#ff0000')
    // ...and the HCT axes reconcile to red: hue swings far off the purple baseline
    // into the warm band, tone moves. Banded, not exact, to stay robust to MCU.
    const hue = await getHctValue(page, 'Hue')
    expect(hue).not.toBeCloseTo(baselineHue, 0)
    expect(hue).toBeLessThan(100)
    expect(await getHctValue(page, 'Tone')).not.toBeCloseTo(baselineTone, 0)
  })

  test('Hue is kept verbatim — 360 does not snap to 0', async ({ page }) => {
    await gotoTheme(page, 'shadcn')

    await setHctValue(page, 'Hue', 360)

    // ADR-0028: the store holds canonical HCT, so setSeedHue(360) is stored as 360
    // (no `% 360`). The read-out must show 360, never collapse to 0 the way a
    // hex round-trip would (hexFromHct(360) === hexFromHct(0)).
    expect(await getHctValue(page, 'Hue')).toBe(360)
  })

  test('Chroma pins to the gamut wall when pushed past it', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const initialChroma = await getHctValue(page, 'Chroma')
    const ceiling = await getChromaGamutCeiling(page)
    expect(ceiling).not.toBeNull()

    await setHctValue(page, 'Chroma', 300)

    const value = await getHctValue(page, 'Chroma')
    // 300 is rejected: the value clamps to the hue/tone-dependent gamut ceiling
    // instead of overshooting into colors the space can't represent.
    expect(value).toBeGreaterThan(initialChroma)
    expect(value).toBeLessThanOrEqual((ceiling as number) + 0.5)
    expect(value).toBeGreaterThanOrEqual((ceiling as number) - 2)
  })
})

test.describe('custom color picker', () => {
  test('an external seed change flows into the picker saturation read-out', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    await seedPickerTrigger(page).click()

    // the popover opens reflecting the live seed; capture the saturation state.
    await expect(pickerHexField(page)).toHaveValue(await getSeedHex(page))
    const before = await saturationArea(page).getAttribute('aria-valuetext')

    // drive a seed change from inside the popover (its hex field shares the seed
    // onChange). use-color-manipulation must mirror hex → hsva, moving the
    // saturation read-out — the inbound direction the original stale-frame bug hit.
    await pickerHexField(page).fill('#00ff00')
    await pickerHexField(page).press('Enter')

    await expect(saturationArea(page)).not.toHaveAttribute('aria-valuetext', before ?? '')

    // and the change propagates out to the rail's seed field once the popover closes.
    await page.keyboard.press('Escape')
    await expect(seedField(page)).toHaveValue('#00ff00')
  })

  test('nudging the saturation area flows back out to the seed', async ({ page }) => {
    await gotoTheme(page, 'shadcn')
    const initialHex = await getSeedHex(page)
    await seedPickerTrigger(page).click()
    await expect(pickerHexField(page)).toHaveValue(initialHex)

    // keyboard-drive the 2D area (±5% saturation per ArrowRight) so the outbound
    // hsva → hex → onChange path runs without a flaky pointer drag.
    await saturationArea(page).focus()
    await saturationArea(page).press('ArrowRight')
    await saturationArea(page).press('ArrowRight')
    await saturationArea(page).press('ArrowRight')

    // the picker's own hex field tracks the new color...
    await expect(pickerHexField(page)).not.toHaveValue(initialHex)
    const picked = await pickerHexField(page).inputValue()
    expect(picked).toMatch(HEX)

    // ...and the rail's seed field agrees once the popover closes (both surfaces,
    // one seed — the cross-surface invariant #180 exists to guard).
    await page.keyboard.press('Escape')
    await expect(seedField(page)).toHaveValue(picked)
  })
})
