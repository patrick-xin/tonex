import { Hct } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { hctFromHex } from '../hct'
import { MODES } from '../mode'
import { DEFAULT_INPUTS } from '../schema'
import { applySurfaceDesaturate } from './desaturate'

// why: layer is argb-canonical (ADR-0021). Hct.fromInt consumes argb
// directly — no oklch parse needed for HCT-domain assertions.

const SURFACE_FAMILY = [
  '--color-surface',
  '--color-surface-dim',
  '--color-surface-bright',
  '--color-surface-container-lowest',
  '--color-surface-container-low',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
  '--color-on-surface',
  '--color-on-surface-variant',
  // why: borders are coherence-coupled too (#93) — a brand-colored divider on a
  // drained surface reads broken, same reason on-surface is here.
  '--color-outline',
  '--color-outline-variant',
] as const

describe('applySurfaceDesaturate', () => {
  it('level=0 is identity on every surface-family token', () => {
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    const out = applySurfaceDesaturate(layer, 0)
    for (const tok of SURFACE_FAMILY) {
      expect(out[tok]).toBe(layer[tok])
    }
  })

  it('level=1 collapses chroma to ~0 across the full surface family (incl. on-surface)', () => {
    // why: level=1 is the "pure neutral" contract. on-surface is included
    // because text-on-tinted-surface was the original complaint that motivated
    // this algorithm — see comment in surfaceDesaturate.ts.
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    const out = applySurfaceDesaturate(layer, 1)
    for (const tok of SURFACE_FAMILY) {
      const hct = Hct.fromInt(out[tok])
      // why: HCT.from(hue, 0, tone)→argb→hex→Hct.fromInt can pump chroma back
      // up by a few units; sRGB gamut + 8-bit quantization lose the "pure
      // neutral" we asked for. <4 is the structural assertion (was ~30+).
      expect(hct.chroma).toBeLessThan(4)
    }
  })

  it('preserves tone at every level (chroma scales, lightness does not)', () => {
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    for (const level of [0, 0.25, 0.5, 0.75, 1]) {
      const out = applySurfaceDesaturate(layer, level)
      for (const tok of SURFACE_FAMILY) {
        const before = Hct.fromInt(layer[tok])
        const after = Hct.fromInt(out[tok])
        expect(Math.abs(after.tone - before.tone)).toBeLessThan(1)
      }
    }
  })

  it('drains outline/outline-variant with the surface — no brand border on a grey card (#93)', () => {
    // why: THE #93 regression guard. A red seed makes MCU paint outline at
    // chroma ~39; before this fix desaturate left it untouched, so every border
    // glowed red on a fully-drained (c≈3) surface. Borders are structural, not
    // accents — they drain with the surface, automatically (no knob), the same
    // coherence call desaturate already makes for on-surface text.
    for (const mode of MODES) {
      const layer = deriveTheme({
        ...DEFAULT_INPUTS,
        seed: { ...hctFromHex('#ff0000'), exactHex: '#ff0000' },
      }).md[mode]
      // sanity: MCU really does hand us a chromatic border to drain.
      expect(Hct.fromInt(layer['--color-outline']).chroma).toBeGreaterThan(20)
      const out = applySurfaceDesaturate(layer, 1)
      for (const tok of ['--color-outline', '--color-outline-variant'] as const) {
        expect(Hct.fromInt(out[tok]).chroma).toBeLessThan(4)
      }
    }
  })

  it('non-surface tokens (e.g. primary) are untouched', () => {
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    const out = applySurfaceDesaturate(layer, 1)
    expect(out['--color-primary']).toBe(layer['--color-primary'])
    expect(out['--color-on-primary']).toBe(layer['--color-on-primary'])
    expect(out['--color-primary-container']).toBe(layer['--color-primary-container'])
  })
})
