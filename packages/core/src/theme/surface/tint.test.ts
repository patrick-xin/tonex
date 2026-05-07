import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS } from '../schema'
import { applySurfaceTint } from './tint'

// why: layer is argb-canonical (ADR-0021); tokens are numbers, not strings.

const SURFACE_BG = [
  '--color-surface',
  '--color-surface-container',
  '--color-surface-container-high',
] as const

describe('applySurfaceTint', () => {
  it('level=0 yields primary-independent output (pure base-palette shade)', () => {
    // why: at level=0 we want a neutral base, not MCU-as-is. Two different
    // primaries must collapse to identical surface bg tokens — that is the
    // structural guarantee that level=0 carries no primary character.
    const red = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' }).md.light
    const green = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#00ff00' }).md.light
    const tintedRed = applySurfaceTint(red, 'light', 0, 'zinc')
    const tintedGreen = applySurfaceTint(green, 'light', 0, 'zinc')
    for (const tok of SURFACE_BG) {
      expect(tintedRed[tok]).toBe(tintedGreen[tok])
    }
  })

  it('level=1 introduces primary character (different primaries → different output)', () => {
    const red = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' }).md.light
    const green = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#00ff00' }).md.light
    const tintedRed = applySurfaceTint(red, 'light', 1, 'zinc')
    const tintedGreen = applySurfaceTint(green, 'light', 1, 'zinc')
    for (const tok of SURFACE_BG) {
      expect(tintedRed[tok]).not.toBe(tintedGreen[tok])
      expect(typeof tintedRed[tok]).toBe('number')
    }
  })

  it('--color-on-surface is never touched (no shade map for text-on-surface)', () => {
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    for (const level of [0, 0.5, 1]) {
      const out = applySurfaceTint(layer, 'light', level, 'zinc')
      expect(out['--color-on-surface']).toBe(layer['--color-on-surface'])
    }
  })

  it('level=1 produces different output from level=0 (primary character is added)', () => {
    // why: a stronger "TARGET_CHROMA reached" assertion would be ideal, but
    // zinc shades sit at extreme tones (L98 / L7) where sRGB gamut +
    // 8-bit quantization swallow small chroma deltas in the hex round-trip.
    // Asserting bytes-differ captures the structural intent without baking
    // in gamut behavior we don't control.
    const layer = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' }).md.dark
    const zero = applySurfaceTint(layer, 'dark', 0, 'zinc')
    const full = applySurfaceTint(layer, 'dark', 1, 'zinc')
    for (const tok of SURFACE_BG) {
      expect(full[tok]).not.toBe(zero[tok])
    }
  })

  it('light vs dark mode pick different base shades', () => {
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    const tintedLight = applySurfaceTint(layer, 'light', 0, 'zinc')
    const tintedDark = applySurfaceTint(layer, 'dark', 0, 'zinc')
    expect(tintedLight['--color-surface']).not.toBe(tintedDark['--color-surface'])
  })

  it('different palette → different output for same level (palette is the base shade source)', () => {
    // why: slice 7 — applySurfaceTint now reads its base shades from a chosen
    // TW neutral palette, not hardcoded zinc. At level=0 the output IS the
    // base shade, so picking 'slate' vs 'zinc' must produce visibly different
    // surface tokens. Olive (warm) vs zinc (cold) widens the delta further.
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    const zinc = applySurfaceTint(layer, 'light', 0, 'zinc')
    const slate = applySurfaceTint(layer, 'light', 0, 'slate')
    const olive = applySurfaceTint(layer, 'light', 0, 'olive')
    for (const tok of SURFACE_BG) {
      expect(zinc[tok]).not.toBe(slate[tok])
      expect(zinc[tok]).not.toBe(olive[tok])
      expect(slate[tok]).not.toBe(olive[tok])
    }
  })
})
