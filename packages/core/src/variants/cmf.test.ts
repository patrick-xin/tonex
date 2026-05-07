import { argbFromHex, Hct, Variant } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { cmf } from './cmf'

const SEED = Hct.fromInt(argbFromHex('#6750a4'))

describe('cmf variant strategy', () => {
  it('declares its identity', () => {
    expect(cmf.name).toBe('cmf')
    expect(cmf.mcuVariant).toBe(Variant.CMF)
  })

  it('builds a light DynamicScheme', () => {
    const scheme = cmf.build(SEED, false, 0)
    expect(scheme.variant).toBe(Variant.CMF)
    expect(scheme.isDark).toBe(false)
    expect(scheme.contrastLevel).toBe(0)
  })

  it('builds a dark DynamicScheme', () => {
    const scheme = cmf.build(SEED, true, 0)
    expect(scheme.isDark).toBe(true)
  })

  it('honors contrast level', () => {
    const scheme = cmf.build(SEED, false, 0.5)
    expect(scheme.contrastLevel).toBe(0.5)
  })

  it('single-source build ignores second-source path entirely', () => {
    // why: the no-secondHct branch passes only a single Hct to SchemeCmf so
    // sourceColorHcts has length 1. MCU's constructor falls back to
    // secondarySourceColorHct = seed in this case — assert via the array
    // shape rather than re-deriving the fallback ourselves.
    const scheme = cmf.build(SEED, false, 0)
    expect(scheme.sourceColorHcts.length).toBe(1)
  })

  it('second-source build threads secondHct into sourceColorHcts', () => {
    // why: structural assertion — when a second hct is passed the array has
    // length 2 and the second entry is the override hct's argb. SchemeCmf
    // reads sourceColorHcts[1] as secondarySourceColorHct, so this fixes
    // the contract between cmf strategy and MCU's CMF spec.
    const second = Hct.fromInt(argbFromHex('#ff8800'))
    const scheme = cmf.build(SEED, false, 0, second)
    expect(scheme.sourceColorHcts.length).toBe(2)
    expect(scheme.sourceColorHcts[1].toInt()).toBe(second.toInt())
  })

  it('second-source shifts tertiaryPalette and errorPalette away from single-source', () => {
    // why: the two palettes that observe the second source per SchemeCmf
    // are tertiary (full reassign from second hue+chroma) and error (hue
    // picked via getErrorHue(seedHue, secondHue)). Tertiary always shifts
    // (palette is rebuilt from second hue/chroma). Error only shifts when
    // secondHue lands in a different getErrorHue bucket than seedHue. SEED
    // hue is ~290, which routes to the final else clause:
    //   (secondHue > 12 && secondHue <= 28) ? 32 : 16
    // Pick second.hue=20 to get bucket 32 (vs single-source bucket 16) so
    // the error assertion has a deterministic shift independent of the hex
    // fixture. Primary/secondary palettes are unaffected — identity check.
    const second = Hct.from(20, 60, 50)
    const single = cmf.build(SEED, false, 0)
    const dual = cmf.build(SEED, false, 0, second)
    expect(dual.tertiaryPalette.keyColor.toInt()).not.toBe(single.tertiaryPalette.keyColor.toInt())
    expect(dual.errorPalette.keyColor.toInt()).not.toBe(single.errorPalette.keyColor.toInt())
    expect(dual.primaryPalette.keyColor.toInt()).toBe(single.primaryPalette.keyColor.toInt())
    expect(dual.secondaryPalette.keyColor.toInt()).toBe(single.secondaryPalette.keyColor.toInt())
  })
})
