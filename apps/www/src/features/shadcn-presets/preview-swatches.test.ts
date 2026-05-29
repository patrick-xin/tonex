import { MODES } from '@tonex/core'
import { SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { presetSwatches } from './preview-swatches'

const NAMES = Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]
const ROLES = ['bg', 'card', 'primary', 'secondary', 'accent'] as const
const HEX = /^#[0-9a-f]{6}$/i

describe('presetSwatches', () => {
  it('returns a valid hex for every role, in both modes, for every preset', () => {
    for (const name of NAMES) {
      const swatches = presetSwatches(name)
      for (const mode of MODES) {
        for (const role of ROLES) {
          expect(swatches[mode][role], `${name}.${mode}.${role}`).toMatch(HEX)
        }
      }
    }
  })

  it('reflects each preset as its pure curated look — different presets differ', () => {
    // grove (teal) and default (violet) must not derive the same primary.
    expect(presetSwatches('grove').light.primary).not.toBe(presetSwatches('default').light.primary)
  })

  it('co-derives both modes — light and dark backgrounds differ', () => {
    const s = presetSwatches('default')
    expect(s.light.bg).not.toBe(s.dark.bg)
  })
})

describe('presetSwatches with a resolved source override', () => {
  it('derives against the provided seed/contrast, not the preset’s curated source', () => {
    const curated = presetSwatches('grove').light.primary
    const overridden = presetSwatches('grove', {
      seed: SHADCN_PRESETS.default.seed,
      contrastLevel: SHADCN_PRESETS.default.contrastLevel,
    }).light.primary
    expect(overridden).not.toBe(curated)
  })

  it('equals the curated look when handed the preset’s own source', () => {
    const curated = presetSwatches('grove')
    const explicit = presetSwatches('grove', {
      seed: SHADCN_PRESETS.grove.seed,
      contrastLevel: SHADCN_PRESETS.grove.contrastLevel,
    })
    expect(explicit.light.primary).toBe(curated.light.primary)
    expect(explicit.dark.bg).toBe(curated.dark.bg)
  })

  it('returns valid hex for every role under an override source', () => {
    const s = presetSwatches('grove', {
      seed: SHADCN_PRESETS.default.seed,
      contrastLevel: SHADCN_PRESETS.default.contrastLevel,
    })
    for (const mode of MODES) {
      for (const role of ROLES) {
        expect(s[mode][role], `grove.${mode}.${role}`).toMatch(HEX)
      }
    }
  })
})
