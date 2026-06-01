import { describe, expect, it } from 'vitest'
import { isDarkSwatch } from './is-dark-swatch'

// why: isDarkSwatch picks black-vs-white label text on every color tile
// (color-tile.tsx, _color-roles-overview.tsx). Its `< 0.5` cutoff is a www
// decision layered on core's `relativeLuminance`, which is a 0–1 linear scale
// (core's oklch.test.ts pins white≈1, black=0, #808080≈0.216). Two things can
// drift: the threshold could be flipped/retuned here, or core could change the
// luminance scale (e.g. to 0–100) underneath us — either silently inverts
// labels into unreadable contrast. The #808080 case is load-bearing: it only
// reads `dark` because 0.216 < 0.5 on the linear scale; on a 0–100 scale it
// would be 21.6 (not < 0.5 → false), so this test fails loudly if core's scale
// drifts. Anchors mirror core's oklch.test.ts so the two halves stay locked.

describe('isDarkSwatch', () => {
  it('treats the luminance extremes as dark/light', () => {
    expect(isDarkSwatch('#000000')).toBe(true) // luminance 0
    expect(isDarkSwatch('#ffffff')).toBe(false) // luminance ~1
  })

  it('brackets the 0.5 cutoff: green is light, mid-gray is dark', () => {
    // green #00ff00 ≈ 0.7152 (> 0.5 → light); gray #808080 ≈ 0.216 (< 0.5 →
    // dark). Together they pin both the cutoff direction and that it operates
    // on core's 0–1 linear scale.
    expect(isDarkSwatch('#00ff00')).toBe(false)
    expect(isDarkSwatch('#808080')).toBe(true)
  })

  it('treats pure red and blue as dark (both below 0.5 on the linear scale)', () => {
    expect(isDarkSwatch('#ff0000')).toBe(true) // ~0.2126
    expect(isDarkSwatch('#0000ff')).toBe(true) // ~0.0722
  })
})
