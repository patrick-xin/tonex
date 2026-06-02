import { expect, gotoTheme, seedField, THEME_PATHS, test } from './fixtures'

// why: foundation smoke — proves the harness boots the app, the page hydrates,
// and the reusable helpers resolve real elements. This is NOT the issue #180
// Tier-1 coverage (the cross-navigation seed-sync assertion lands next, on top of
// this). If this fails, the harness is broken — not the feature under test.
test.describe('e2e harness', () => {
  test('boots the md theme page and hydrates the seed field', async ({ page }) => {
    await gotoTheme(page, 'md')
    await expect(seedField(page)).toBeVisible()
  })

  test('serves the shadcn theme layer', async ({ page }) => {
    await page.goto(THEME_PATHS.shadcn)
    await expect(seedField(page)).toBeVisible()
  })
})
