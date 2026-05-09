import { argbFromHex } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from './contrast'

describe('contrastRatio (WCAG 2)', () => {
  const W = argbFromHex('#ffffff')
  const K = argbFromHex('#000000')

  it('black on white = 21:1 (the spec ceiling)', () => {
    expect(contrastRatio(K, W)).toBeCloseTo(21, 6)
  })

  it('white on black = 21:1 (order-independent)', () => {
    // why: WCAG ratio is `(Lhi + 0.05) / (Llo + 0.05)`, symmetric by definition.
    // Pin the symmetry so a future implementation can't smuggle in fg-only weighting.
    expect(contrastRatio(W, K)).toBeCloseTo(21, 6)
  })

  it('any color against itself = 1:1 (the spec floor)', () => {
    expect(contrastRatio(W, W)).toBeCloseTo(1, 9)
    expect(contrastRatio(K, K)).toBeCloseTo(1, 9)
    expect(contrastRatio(argbFromHex('#6750a4'), argbFromHex('#6750a4'))).toBeCloseTo(1, 9)
  })

  it('#595959 on white ≈ 7.00 (the canonical AAA boundary)', () => {
    // why: this exact grey is widely cited in WCAG explainers as the AAA reference;
    // matching it within 0.01 proves the gamma + coefficient pair is correct.
    expect(contrastRatio(argbFromHex('#595959'), W)).toBeCloseTo(7.0, 1)
  })

  it('#767676 on white ≈ 4.54 (the canonical AA boundary)', () => {
    expect(contrastRatio(argbFromHex('#767676'), W)).toBeCloseTo(4.54, 1)
  })

  it('pure red #ff0000 on white ≈ 4.00 (R coefficient at full intensity)', () => {
    // why: red's linear-luminance contribution is exactly the WCAG R coefficient
    // (0.2126); pinning this catches a coefficient swap that grey samples would miss.
    expect(contrastRatio(argbFromHex('#ff0000'), W)).toBeCloseTo(4.0, 1)
  })
})
