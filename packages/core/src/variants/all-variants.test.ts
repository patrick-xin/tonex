import { argbFromHex, Hct } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { type VariantName, variants } from './index'

// why: blanket build-contract coverage for every registered variant. Closes
// the #129 gap where 7 of 10 strategies had no test — cmf/tonalSpot keep
// their richer per-entry files; this one asserts the contract that must hold
// uniformly across the registry (VariantStrategy in types.ts), so a new
// variant added to the record is covered the moment it lands.

const SEED = Hct.fromInt(argbFromHex('#6750a4'))
const SECOND = Hct.fromInt(argbFromHex('#b3261e'))
const VARIANT_NAMES = Object.keys(variants) as VariantName[]
const SAMPLE_TONES = [10, 40, 90]

describe.each(VARIANT_NAMES)('variant %s', (name) => {
  const strategy = variants[name]

  it('declares a name matching its registry key', () => {
    // why: derive.ts looks up variants[source.variant]; a key/name mismatch
    // would let a strategy be reachable under a name it doesn't claim.
    expect(strategy.name).toBe(name)
  })

  it('builds light and dark schemes carrying the threaded mode + contrast', () => {
    const light = strategy.build(SEED, false, 0)
    expect(light.variant).toBe(strategy.mcuVariant)
    expect(light.isDark).toBe(false)
    expect(light.contrastLevel).toBe(0)

    const dark = strategy.build(SEED, true, 0)
    expect(dark.isDark).toBe(true)

    const high = strategy.build(SEED, false, 0.5)
    expect(high.contrastLevel).toBe(0.5)
  })

  it('produces a real tonal palette (light and dark ends differ)', () => {
    // why: a usable scheme must span its tone range; a degenerate palette
    // collapsing tone 10 onto tone 90 would mean the seed never reached the
    // palette constructor.
    const scheme = strategy.build(SEED, false, 0)
    expect(scheme.primaryPalette.tone(10)).not.toBe(scheme.primaryPalette.tone(90))
  })
})

describe('secondHct extra source — only cmf consumes it (types.ts)', () => {
  for (const name of VARIANT_NAMES) {
    if (name === 'cmf') continue
    it(`${name} ignores secondHct (tertiary palette unchanged)`, () => {
      const without = variants[name].build(SEED, false, 0)
      const withSecond = variants[name].build(SEED, false, 0, SECOND)
      for (const tone of SAMPLE_TONES) {
        expect(withSecond.tertiaryPalette.tone(tone)).toBe(without.tertiaryPalette.tone(tone))
      }
    })
  }

  it('cmf consumes secondHct (tertiary palette shifts toward the second source)', () => {
    const without = variants.cmf.build(SEED, false, 0)
    const withSecond = variants.cmf.build(SEED, false, 0, SECOND)
    const shifted = SAMPLE_TONES.some(
      (tone) => withSecond.tertiaryPalette.tone(tone) !== without.tertiaryPalette.tone(tone),
    )
    expect(shifted).toBe(true)
  })
})
