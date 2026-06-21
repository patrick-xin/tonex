import { argbFromHex, contrastRatio } from '@tonex/color-utils'
import { describe, expect, it } from 'vitest'
import { deriveForeground } from './foreground'

// why: deriveForeground is the contrast-surface capability that picks an AA-safe
// (or, for a requested ratio, ratio-safe) foreground for an ARBITRARY literal fill
// — the generalized, ratio-parameterized form of derive's private brandForeground.
// Tests pin the load-bearing behaviour: it clears the requested ratio when the fill
// allows it, honors a raised ratio, and — crucially — NEVER throws on a mid-tone
// fill where no foreground can reach the floor, returning the max-contrast extreme.
describe('deriveForeground', () => {
  it('returns a foreground that clears AA (4.5) for an off-mid fill', () => {
    for (const hex of ['#6750a4', '#ff0000', '#ffd400', '#0a0a0a', '#f5f5f5']) {
      const fill = argbFromHex(hex)
      const fg = deriveForeground(fill)
      expect(contrastRatio(fg, fill)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('honors a raised ratio (AAA = 7) where achievable', () => {
    // a dark, saturated fill leaves plenty of room toward white for AAA.
    const fill = argbFromHex('#0a0a0a')
    expect(contrastRatio(deriveForeground(fill, { ratio: 7 }), fill)).toBeGreaterThanOrEqual(7)
  })

  it('agrees byte-for-byte with the brand path at ratio 4.5 (the delegation contract)', () => {
    // why: derive.ts's brandForeground is now a thin caller of this with ratio 4.5;
    // the www brand value must stay byte-identical, so a known seed must yield the
    // exact same argb under either entry point. We assert the value is stable here
    // (derive.test.ts proves the brand surface still emits it unchanged).
    const seed = argbFromHex('#6750a4')
    expect(deriveForeground(seed, { ratio: 4.5 })).toBe(deriveForeground(seed))
  })

  it('falls back to the pure max-contrast extreme when the tint falls short (no sub-threshold tint, never throws)', () => {
    // for a mid grey the aesthetic low-chroma tint can't clear 4.5, so the function
    // must fall back to the pure extreme on the max-contrast side (here black, ~5.3:1)
    // rather than return the sub-threshold tint — and it must never throw.
    const fill = argbFromHex('#808080')
    const fg = deriveForeground(fill)
    const white = argbFromHex('#ffffff')
    const black = argbFromHex('#000000')
    expect([white, black]).toContain(fg)
    // and it is the better of the two extremes (max achievable contrast).
    const best = Math.max(contrastRatio(white, fill), contrastRatio(black, fill))
    expect(contrastRatio(fg, fill)).toBeCloseTo(best, 5)
  })
})
