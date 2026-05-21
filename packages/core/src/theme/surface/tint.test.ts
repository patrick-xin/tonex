import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { hctFromHex } from '../hct'
import { hexString } from '../oklch'
import { DEFAULT_INPUTS } from '../schema'
import { applySurfaceTint } from './tint'

const withSeed = (hex: string) => ({
  ...DEFAULT_INPUTS,
  seed: { ...hctFromHex(hex), exactHex: hex },
})

// why: the layer is argb-canonical (ADR-0021) — tokens are numbers. Read them
// back into HCT (the only coordinates #91 is about: chroma = how brand-tinted,
// tone = where on the elevation staircase).
const chromaOf = (argb: number) => hctFromHex(hexString(argb)).chroma
const toneOf = (argb: number) => hctFromHex(hexString(argb)).tone

// why: the full md surface-background ramp. Tint must cover ALL 8 or the
// untouched steps keep MCU's brand chroma and alternate with the neutral ones
// in a single elevation ramp (#91). on-surface/on-surface-variant are absent:
// text stays MCU-derived this slice (ADR-0018 amendment 2026-05-20).
const SURFACE_BG = [
  '--color-surface',
  '--color-surface-dim',
  '--color-surface-bright',
  '--color-surface-container-lowest',
  '--color-surface-container-low',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
] as const

// why: mid-band tokens (t90–94 light, t9–15 dark) hold chroma 8 in sRGB; the
// near-white/near-black extremes (surface-container-lowest at t100/t0) clamp,
// so a brand blend is invisible there by construction — exclude them from
// difference assertions, not from neutrality ones.
const MID_BAND = [
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
] as const

const TEXT = ['--color-on-surface', '--color-on-surface-variant'] as const

describe('applySurfaceTint', () => {
  it('level=0: every surface bg is neutral, not just the 3 legacy tokens (#91)', () => {
    // why: THE regression guard. A chromatic seed makes MCU paint all 8
    // surfaces with brand chroma; the old tint snapped 3 to neutral and let 5
    // keep it. With a pure-grey palette at level 0, every step must collapse
    // to neutral — light AND dark. Threshold 4.0 sits between the ~2.8 chroma
    // an achromatic grey can read back as at the t100/t0 extremes (8-bit sRGB
    // round-trip noise) and MCU's 6.5+ brand chroma the bug left behind.
    for (const mode of ['light', 'dark'] as const) {
      const layer = deriveTheme(withSeed('#6750A4')).md[mode]
      const tinted = applySurfaceTint(layer, 0, 'neutral')
      for (const tok of SURFACE_BG) {
        expect(chromaOf(tinted[tok])).toBeLessThan(4)
      }
    }
  })

  it('level=0: each token keeps its MCU tone (the elevation staircase survives)', () => {
    // why: B2 swaps hue+chroma but pins tone to MCU's — the luminance ramp
    // that makes elevation legible must not move.
    const layer = deriveTheme(withSeed('#6750A4')).md.light
    const tinted = applySurfaceTint(layer, 0, 'zinc')
    for (const tok of SURFACE_BG) {
      expect(Math.abs(toneOf(tinted[tok]) - toneOf(layer[tok]))).toBeLessThan(1.5)
    }
  })

  it('level=0 is primary-independent (no brand character leaks in)', () => {
    // why: take-2 semantics — level 0 is "pure chosen neutral", so two seeds
    // must yield the same surfaces. B2 derives tone from MCU (seed varies it by
    // ~0.2), so compare in HCT with a sub-unit tolerance rather than toBe.
    const red = applySurfaceTint(deriveTheme(withSeed('#ff0000')).md.light, 0, 'zinc')
    const green = applySurfaceTint(deriveTheme(withSeed('#00ff00')).md.light, 0, 'zinc')
    for (const tok of SURFACE_BG) {
      expect(Math.abs(toneOf(red[tok]) - toneOf(green[tok]))).toBeLessThan(1)
      expect(Math.abs(chromaOf(red[tok]) - chromaOf(green[tok]))).toBeLessThan(1)
    }
  })

  it('level=1 blends brand back in (different seeds → different surfaces)', () => {
    const red = applySurfaceTint(deriveTheme(withSeed('#ff0000')).md.light, 1, 'zinc')
    const green = applySurfaceTint(deriveTheme(withSeed('#00ff00')).md.light, 1, 'zinc')
    for (const tok of MID_BAND) {
      expect(red[tok]).not.toBe(green[tok])
    }
  })

  it('level=1 differs from level=0 on the mid-band tokens', () => {
    const layer = deriveTheme(withSeed('#ff0000')).md.dark
    const zero = applySurfaceTint(layer, 0, 'zinc')
    const full = applySurfaceTint(layer, 1, 'zinc')
    for (const tok of MID_BAND) {
      expect(full[tok]).not.toBe(zero[tok])
    }
  })

  it('text is never touched this slice (on-surface pair stays MCU-derived)', () => {
    // why: ADR-0018 amendment 2026-05-20 — Tint covers backgrounds only.
    // Brand-tinted text ships later as an opt-in accent, decoupled from this
    // level (issue: text-tint accent), not folded in here.
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    for (const level of [0, 0.5, 1]) {
      const out = applySurfaceTint(layer, level, 'zinc')
      for (const tok of TEXT) {
        expect(out[tok]).toBe(layer[tok])
      }
    }
  })

  it('the chosen palette drives the output (zinc ≠ slate ≠ olive)', () => {
    // why: B2 resamples the *named* palette, so a cool (zinc), chromatic
    // (slate) and warm (olive) neutral must diverge. surface-dim is the lowest
    // light tone (t87) → most chroma headroom for the temperature to register.
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    const tok = '--color-surface-dim'
    const zinc = applySurfaceTint(layer, 0, 'zinc')[tok]
    const slate = applySurfaceTint(layer, 0, 'slate')[tok]
    const olive = applySurfaceTint(layer, 0, 'olive')[tok]
    expect(zinc).not.toBe(slate)
    expect(zinc).not.toBe(olive)
    expect(slate).not.toBe(olive)
  })
})
