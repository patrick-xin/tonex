import { argbFromHex, Hct } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { variants } from '../../variants'
import { DEFAULT_INPUTS, type PortableTheme } from '../schema'
import { applyPaletteOverrides } from './apply'

// why: structural tests for the post-construction palette mutation. We
// don't compare emitted hex values (that's derive.test.ts's job) — here
// we verify the scheme's palette field actually changed identity to the
// override TonalPalette, and that disabled overrides leave the field
// untouched.

function buildSchemes(source: PortableTheme) {
  const variant = variants[source.variant]
  const seedHct = Hct.from(source.seed.hue, source.seed.chroma, source.seed.tone)
  return {
    light: variant.build(seedHct, false, source.contrastLevel),
    dark: variant.build(seedHct, true, source.contrastLevel),
  }
}

describe('applyPaletteOverrides', () => {
  it('replaces primaryPalette on both schemes when primary is overridden', () => {
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      paletteOverrides: { primary: '#ff0066' },
    }
    const { light, dark } = buildSchemes(source)
    const beforeLight = light.primaryPalette
    const beforeDark = dark.primaryPalette
    applyPaletteOverrides(light, dark, source)
    expect(light.primaryPalette).not.toBe(beforeLight)
    expect(dark.primaryPalette).not.toBe(beforeDark)
    // why: same palette object on both modes — palette is a tone ramp, mode
    // selects tones from it. Identity check pins the contract.
    expect(light.primaryPalette).toBe(dark.primaryPalette)
    // why: keyColor of the override palette must trace back to the input hex.
    // TonalPalette.fromInt builds from the input HCT; keyColor recovers it.
    expect(light.primaryPalette.keyColor.toInt()).toBe(argbFromHex('#ff0066'))
  })

  it('leaves untouched palettes intact', () => {
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      paletteOverrides: { primary: '#ff0066' },
    }
    const { light, dark } = buildSchemes(source)
    const secondaryBefore = light.secondaryPalette
    const tertiaryBefore = light.tertiaryPalette
    const errorBefore = light.errorPalette
    applyPaletteOverrides(light, dark, source)
    expect(light.secondaryPalette).toBe(secondaryBefore)
    expect(light.tertiaryPalette).toBe(tertiaryBefore)
    expect(light.errorPalette).toBe(errorBefore)
  })

  it('replaces every palette field when all six are overridden', () => {
    // why: tonalSpot — non-cmf so tertiary isn't disabled. DEFAULT_VARIANT
    // is cmf which would skip tertiary via paletteOverrideDisabledReason and
    // half-test the loop. The full-six assertion needs every palette enabled.
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      variant: 'tonalSpot',
      paletteOverrides: {
        primary: '#ff0066',
        secondary: '#33ccaa',
        tertiary: '#ffaa00',
        neutral: '#888899',
        neutralVariant: '#776655',
        error: '#ee2244',
      },
    }
    const { light, dark } = buildSchemes(source)
    applyPaletteOverrides(light, dark, source)
    expect(light.primaryPalette.keyColor.toInt()).toBe(argbFromHex('#ff0066'))
    expect(light.secondaryPalette.keyColor.toInt()).toBe(argbFromHex('#33ccaa'))
    expect(light.tertiaryPalette.keyColor.toInt()).toBe(argbFromHex('#ffaa00'))
    expect(light.neutralPalette.keyColor.toInt()).toBe(argbFromHex('#888899'))
    expect(light.neutralVariantPalette.keyColor.toInt()).toBe(argbFromHex('#776655'))
    expect(light.errorPalette.keyColor.toInt()).toBe(argbFromHex('#ee2244'))
  })

  it('skips disabled overrides (cmf + tertiary)', () => {
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      variant: 'cmf',
      paletteOverrides: { tertiary: '#ffaa00', primary: '#ff0066' },
    }
    const { light, dark } = buildSchemes(source)
    const tertiaryBefore = light.tertiaryPalette
    applyPaletteOverrides(light, dark, source)
    // tertiary is disabled under cmf — palette unchanged
    expect(light.tertiaryPalette).toBe(tertiaryBefore)
    // primary still applies
    expect(light.primaryPalette.keyColor.toInt()).toBe(argbFromHex('#ff0066'))
  })

  it('no-op when paletteOverrides is empty', () => {
    const { light, dark } = buildSchemes(DEFAULT_INPUTS)
    const before = {
      primary: light.primaryPalette,
      secondary: light.secondaryPalette,
      tertiary: light.tertiaryPalette,
      neutral: light.neutralPalette,
      neutralVariant: light.neutralVariantPalette,
      error: light.errorPalette,
    }
    applyPaletteOverrides(light, dark, DEFAULT_INPUTS)
    expect(light.primaryPalette).toBe(before.primary)
    expect(light.secondaryPalette).toBe(before.secondary)
    expect(light.tertiaryPalette).toBe(before.tertiary)
    expect(light.neutralPalette).toBe(before.neutral)
    expect(light.neutralVariantPalette).toBe(before.neutralVariant)
    expect(light.errorPalette).toBe(before.error)
  })
})
