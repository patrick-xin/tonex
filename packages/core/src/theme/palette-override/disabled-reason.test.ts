import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS, PALETTE_NAMES, type PortableTheme } from '../schema'
import { paletteOverrideDisabledReason } from './disabled-reason'

describe('paletteOverrideDisabledReason', () => {
  // why: under a non-cmf variant every palette is enabled. tonalSpot is the
  // canonical "no special rules" variant — used as the ground truth here so
  // the assertion isolates "no rule fires" from cmf's tertiary carve-out.
  it('returns null for every palette under a non-cmf variant', () => {
    const source: PortableTheme = { ...DEFAULT_INPUTS, variant: 'tonalSpot' }
    for (const palette of PALETTE_NAMES) {
      expect(paletteOverrideDisabledReason(palette, source)).toBeNull()
    }
  })

  it('disables tertiary when variant is cmf', () => {
    const source: PortableTheme = { ...DEFAULT_INPUTS, variant: 'cmf' }
    const reason = paletteOverrideDisabledReason('tertiary', source)
    expect(reason).not.toBeNull()
    expect(reason).toMatch(/CMF second-source/)
  })

  it('does not disable other palettes under cmf', () => {
    const source: PortableTheme = { ...DEFAULT_INPUTS, variant: 'cmf' }
    for (const palette of PALETTE_NAMES) {
      if (palette === 'tertiary') continue
      expect(paletteOverrideDisabledReason(palette, source)).toBeNull()
    }
  })

  it('does not disable tertiary under non-cmf variants', () => {
    for (const variant of ['tonalSpot', 'vibrant', 'expressive', 'monochrome'] as const) {
      const source: PortableTheme = { ...DEFAULT_INPUTS, variant }
      expect(paletteOverrideDisabledReason('tertiary', source)).toBeNull()
    }
  })
})
