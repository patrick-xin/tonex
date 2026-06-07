import { expect, menuPickerTrigger, menuSeedHub, pickWheelDot, test } from './fixtures'

// why: the menu color picker (color-picker/custom/menu-color-picker.tsx → the
// AnimatedColorPicker wheel) is the seed entry on the marketing pages
// (about/roadmap). It had no coverage, and its hub used to be hardcoded to the
// MD3 default instead of the live seed — so its offered values were isolated from
// the rest of the app. This locks the contract that closes both gaps: picking a
// wheel color commits it to the SAME shared source store the editor and landing
// swatches use, and the hub reflects whatever seed is live (read straight from
// the store, no page navigation needed to prove it).
test.describe('menu color picker', () => {
  test('picking a wheel color commits it to the shared seed', async ({ page }) => {
    await page.goto('/about')
    await menuPickerTrigger(page).click()

    // pick any ring dot and capture the hex it commits — palette-independent, the
    // way pickFirstPreset is for the landing swatches (the generated ring colors
    // are not a contract; "a wheel color commits" is).
    const hex = await pickWheelDot(page)

    // the hub renders the live seed read from the shared store, so it adopts this
    // hex only if the click actually reached the store — asserting the hub is
    // asserting the commit, and the seam fix (hub mirrors live seed) at once.
    await expect(menuSeedHub(page)).toHaveAttribute('aria-label', `Seed color ${hex}`)
  })
})
