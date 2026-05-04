import { argbFromHex, Hct, hexFromArgb } from '@tonex/mcu'
import type { TokenMap } from './derive'

// why: surface desaturation — chroma multiplier on MCU output. Operates on
// whatever MCU emitted: parse → HCT → scale chroma → emit. Tone and hue
// preserved exactly; only chroma moves.
//
// level=0: MCU as-is (no effect).
// level=1: chroma forced to 0 (pure neutral).
//
// Applies to all surface-family tokens including `--color-on-surface`,
// because text-on-tinted-surface was the original complaint (e.g. `#352f43`
// purple-tinted text in temp.md).

const SURFACE_FAMILY = [
  '--color-surface',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-on-surface',
] as const

function scaleChroma(hex: string, level: number): string {
  if (level <= 0) return hex
  const hct = Hct.fromInt(argbFromHex(hex))
  const next = Hct.from(hct.hue, hct.chroma * (1 - level), hct.tone)
  return hexFromArgb(next.toInt())
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
