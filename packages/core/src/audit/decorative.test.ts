import { describe, expect, it } from 'vitest'
import { isDecorative } from './decorative'

// why: per M3 spec, outline-variant is decorative (purely visual dividers,
// WCAG 1.4.11 exempt). The full surface ladder needs the exemption — issue
// #47 added container variants, and all of them pair with outline-variant.
// These assertions pin the exempt set + the no-false-positive boundary
// (outline itself is NOT decorative, neither are the non-outline-variant
// foregrounds on the same surfaces).

const SURFACES = [
  '--color-surface',
  '--color-surface-container-lowest',
  '--color-surface-container-low',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
]

describe('isDecorative', () => {
  it('marks every outline-variant pair across the full surface ladder as decorative', () => {
    for (const bg of SURFACES) {
      expect(isDecorative({ fg: '--color-outline-variant', bg })).toBe(true)
    }
  })

  it('does NOT mark --color-outline as decorative (load-bearing edge token)', () => {
    for (const bg of SURFACES) {
      expect(isDecorative({ fg: '--color-outline', bg })).toBe(false)
    }
  })

  it('only matches when fg is outline-variant (other fgs on same surfaces are functional)', () => {
    for (const bg of SURFACES) {
      expect(isDecorative({ fg: '--color-on-surface', bg })).toBe(false)
      expect(isDecorative({ fg: '--color-primary', bg })).toBe(false)
    }
  })

  it('does not match outline-variant against a non-surface bg', () => {
    expect(isDecorative({ fg: '--color-outline-variant', bg: '--color-primary' })).toBe(false)
    expect(isDecorative({ fg: '--color-outline-variant', bg: '--background' })).toBe(false)
  })

  it('matches by exact key equality — fg/bg swap is not decorative', () => {
    expect(isDecorative({ fg: '--color-surface', bg: '--color-outline-variant' })).toBe(false)
  })
})
