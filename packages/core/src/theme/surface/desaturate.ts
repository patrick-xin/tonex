import { Hct } from '@tonex/mcu'
import type { TokenMap } from '../derive'
import { argbFromOklch, oklchFromArgb } from '../oklch'

// why: surface desaturation — chroma multiplier on MCU output. Operates on
// whatever MCU emitted: parse → HCT → scale chroma → emit. Tone and hue
// preserved exactly; only chroma moves.
//
// level=0: MCU as-is (no effect).
// level=1: chroma forced to 0 (pure neutral).
//
// Covers the FULL md surface ramp + on-surface text pair. Uniform multiplier
// means new tokens cost nothing to include; leaving them out would let a
// "neutral" surface sit next to an MCU-tinted `--color-surface-container-low`
// in the same ramp (visible inconsistency). on-surface and on-surface-variant
// are included because text-on-tinted-surface was the original complaint
// (e.g. `#352f43` purple-tinted text in temp.md).

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

function scaleChroma(value: string, level: number): string {
  if (level <= 0) return value
  const hct = Hct.fromInt(argbFromOklch(value))
  const next = Hct.from(hct.hue, hct.chroma * (1 - level), hct.tone)
  return oklchFromArgb(next.toInt())
}

export function applySurfaceDesaturate(mcuLayer: TokenMap, level: number): TokenMap {
  if (level <= 0) return mcuLayer
  const out: TokenMap = { ...mcuLayer }
  for (const token of SURFACE_FAMILY) {
    const v = mcuLayer[token]
    if (v) out[token] = scaleChroma(v, level)
  }
  return out
}
