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
const hueOf = (argb: number) => hctFromHex(hexString(argb)).hue
// why: shortest arc between two hues on the 360° wheel — text-tint targets the
// primary's hue, so "did it move toward primary" is an angular-distance check.
const hueDist = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

// why: the full md surface-background ramp. Tint must cover ALL 8 or the
// untouched steps keep MCU's brand chroma and alternate with the neutral ones
// in a single elevation ramp (#91). on-surface/on-surface-variant ride a
// SEPARATE textLevel (the TEXT pair below) — same neutral→brand model, own knob.
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

  it('textLevel=0 drains text to the chosen neutral (clean baseline, not MCU) (#92)', () => {
    // why: the decided model is neutral→brand, mirroring the surface knob —
    // picking a neutral palette gives clean surfaces AND clean text. So at
    // textLevel=0 the text pair is the chosen palette at the token's own tone,
    // NOT MCU: a vivid seed's brand chroma (11–38) is drained to near-grey, and
    // two seeds converge on the same neutral text. Surface level never moves it.
    // why: pure-grey `neutral` palette (as the bg neutrality guard above) so the
    // clean-baseline claim is sharpest; threshold 4 sits above sRGB round-trip
    // noise and far below MCU's 11–38 brand chroma the bug would leave.
    const vivid = deriveTheme(withSeed('#6750A4')).md.light
    for (const tok of TEXT) {
      const base = applySurfaceTint(vivid, 0, 'neutral', 0)
      expect(chromaOf(base[tok])).toBeLessThan(4) // drained to the grey palette
      expect(chromaOf(base[tok])).toBeLessThan(chromaOf(vivid[tok])) // below MCU's brand chroma
      expect(Math.abs(toneOf(base[tok]) - toneOf(vivid[tok]))).toBeLessThan(1.5) // tone pinned
    }
    // primary-independent: the clean baseline is the palette, not the seed.
    const red = applySurfaceTint(deriveTheme(withSeed('#ff0000')).md.light, 0, 'neutral', 0)
    const green = applySurfaceTint(deriveTheme(withSeed('#00ff00')).md.light, 0, 'neutral', 0)
    for (const tok of TEXT) expect(red[tok]).toBe(green[tok])
    // decoupled from surface level: textLevel=0 text is identical at any surfaceLevel.
    const sl0 = applySurfaceTint(vivid, 0, 'neutral', 0)
    const sl1 = applySurfaceTint(vivid, 1, 'neutral', 0)
    for (const tok of TEXT) expect(sl0[tok]).toBe(sl1[tok])
  })

  it('textLevel=1 carries text toward the primary, ceiling 25% of its chroma, tone pinned (#92)', () => {
    // why: the accent target is --color-primary's hue at a 25% chroma ceiling
    // (settled in the /prototype-text-accent lab — enough pop without tripping
    // the 4.5:1 floor; linear, no easing). So from the neutral baseline chroma
    // climbs to ~0.25·primaryChroma and hue swings to the primary's. Tone is
    // pinned — text legibility depends on it.
    const layer = deriveTheme(withSeed('#6750A4')).md.light
    const primaryChroma = chromaOf(layer['--color-primary'])
    const primaryHue = hueOf(layer['--color-primary'])
    const base = applySurfaceTint(layer, 0, 'zinc', 0)
    const tinted = applySurfaceTint(layer, 0, 'zinc', 1)
    for (const tok of TEXT) {
      expect(chromaOf(tinted[tok])).toBeGreaterThan(chromaOf(base[tok])) // accent adds chroma
      expect(chromaOf(tinted[tok])).toBeLessThan(primaryChroma) // capped well below full
      expect(Math.abs(chromaOf(tinted[tok]) - 0.25 * primaryChroma)).toBeLessThan(2) // ~25% ceiling
      expect(hueDist(hueOf(tinted[tok]), primaryHue)).toBeLessThan(3) // hue → primary
      expect(Math.abs(toneOf(tinted[tok]) - toneOf(layer[tok]))).toBeLessThan(1.5) // tone pinned
    }
  })

  it('text-tint is decoupled from surface-tint level (the whole point of #92)', () => {
    // why: "clean neutral cards + brand-accented text" must be reachable, so
    // text-tint must NOT ride surfaceTintLevel. Full surface tint + zero text
    // tint leaves text at the clean neutral baseline; zero surface tint + full
    // text tint still accents text; and textLevel never leaks into the 8 bgs.
    const layer = deriveTheme(withSeed('#ff0000')).md.light
    const baseline = applySurfaceTint(layer, 0, 'zinc', 0)
    const surfOnly = applySurfaceTint(layer, 1, 'zinc', 0)
    for (const tok of TEXT) expect(surfOnly[tok]).toBe(baseline[tok]) // text unmoved by surface
    const textOnly = applySurfaceTint(layer, 0, 'zinc', 1)
    for (const tok of TEXT) expect(textOnly[tok]).not.toBe(baseline[tok]) // accent independent
    for (const tok of SURFACE_BG) expect(textOnly[tok]).toBe(baseline[tok]) // bgs untouched by textLevel
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
