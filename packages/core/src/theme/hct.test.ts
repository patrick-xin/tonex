import { describe, expect, it } from 'vitest'
import { CHROMA_HUE_LOCK, hctFromHex, hexFromHct, maxChroma } from './hct'

describe('hctFromHex', () => {
  it('decomposes the default seed into stable HCT', () => {
    // why: MCU's HctSolver gives hue ≈ 299, chroma ≈ 48, tone ≈ 40 for the
    // M3 baseline seed #6750a4. Bands sized to absorb solver drift across
    // MCU updates; this is a sanity test, not a numeric contract.
    const { hue, chroma, tone } = hctFromHex('#6750a4')
    expect(hue).toBeGreaterThan(285)
    expect(hue).toBeLessThan(310)
    expect(chroma).toBeGreaterThan(40)
    expect(chroma).toBeLessThan(55)
    expect(tone).toBeGreaterThan(35)
    expect(tone).toBeLessThan(45)
  })

  it('round-trips hex → hct → hex within HCT solver tolerance', () => {
    const hex = '#3b82f6'
    const hct = hctFromHex(hex)
    const recomposed = hctFromHex(hexFromHct(hct))
    expect(recomposed.hue).toBeCloseTo(hct.hue, 0)
    expect(recomposed.chroma).toBeCloseTo(hct.chroma, 0)
    expect(recomposed.tone).toBeCloseTo(hct.tone, 0)
  })
})

describe('hexFromHct', () => {
  it('emits a 6-digit lowercase hex', () => {
    const hex = hexFromHct({ hue: 292, chroma: 45, tone: 40 })
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('maxChroma', () => {
  it('returns a positive chroma for a mid-tone non-grey hue', () => {
    expect(maxChroma(0, 50)).toBeGreaterThan(20)
  })

  it('drops sharply at tone extremes vs mid-tone', () => {
    // why: gamut wall narrows as tone approaches 0 or 100. Asserting a hard
    // ceiling there would couple the test to MCU's exact solver output;
    // assert the relative collapse instead — extremes are an order of
    // magnitude below mid-tone.
    expect(maxChroma(0, 50)).toBeGreaterThan(maxChroma(0, 0) * 5)
    expect(maxChroma(0, 50)).toBeGreaterThan(maxChroma(0, 100) * 5)
  })
})

describe('CHROMA_HUE_LOCK', () => {
  it('is a positive threshold below MCU mid-chromas', () => {
    expect(CHROMA_HUE_LOCK).toBeGreaterThan(0)
    expect(CHROMA_HUE_LOCK).toBeLessThan(20)
  })
})
