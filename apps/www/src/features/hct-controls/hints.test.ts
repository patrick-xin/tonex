import { CHROMA_HUE_LOCK } from '@tonex/core'
import { describe, expect, it } from 'vitest'
import { showsHueDisabledHint } from './hints'

// why: the Hue axis greys out on a near-grey seed (chroma below CHROMA_HUE_LOCK).
// The cue tells the user how to re-enable it — but only when chroma is the reason,
// not when the seed is locked (that's the lock, a separate Finding 10 concern).
describe('showsHueDisabledHint', () => {
  it('is true when chroma is below the lock threshold and unlocked', () => {
    expect(showsHueDisabledHint(0, false)).toBe(true)
    expect(showsHueDisabledHint(CHROMA_HUE_LOCK - 1, false)).toBe(true)
  })

  it('is false at or above the lock threshold', () => {
    expect(showsHueDisabledHint(CHROMA_HUE_LOCK, false)).toBe(false)
    expect(showsHueDisabledHint(40, false)).toBe(false)
  })

  it('is false when the seed is locked, regardless of chroma', () => {
    expect(showsHueDisabledHint(0, true)).toBe(false)
    expect(showsHueDisabledHint(40, true)).toBe(false)
  })
})
