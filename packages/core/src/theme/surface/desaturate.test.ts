import { Hct } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
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

  it('non-surface tokens (e.g. primary) are untouched', () => {
    const layer = deriveTheme(DEFAULT_INPUTS).md.light
    const out = applySurfaceDesaturate(layer, 1)
    expect(out['--color-primary']).toBe(layer['--color-primary'])
    expect(out['--color-on-primary']).toBe(layer['--color-on-primary'])
    expect(out['--color-primary-container']).toBe(layer['--color-primary-container'])
  })
})
