import { describe, expect, it } from 'vitest'
import { showsTintZeroHint } from './hints'

// why: Tint@0 still rebuilds surfaces from the plain neutral, while Desaturate@0
// is a true no-op — so only Tint-at-zero earns the asymmetry nudge.
describe('showsTintZeroHint', () => {
  it('is true only for Tint at level 0', () => {
    expect(showsTintZeroHint('tint', 0)).toBe(true)
  })

  it('is false for Tint above 0', () => {
    expect(showsTintZeroHint('tint', 0.1)).toBe(false)
    expect(showsTintZeroHint('tint', 1)).toBe(false)
  })

  it('is false for Desaturate at any level', () => {
    expect(showsTintZeroHint('desaturate', 0)).toBe(false)
    expect(showsTintZeroHint('desaturate', 0.5)).toBe(false)
  })
})
