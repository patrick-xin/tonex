import { argbFromHex, Hct } from '@tonex/mcu'
import type { TokenMap } from '../derive'
import type { Mode } from '../mode'
import { argbFromOklch, oklchFromArgb } from '../oklch'

// why: surface tint — replaces MCU's surfaces with a TW zinc base, then
// blends primary's hue+chroma back in proportional to `level`. Tone is
// preserved exactly (zinc shade map mirrors MCU's tone ladder).
//
// level=0: pure zinc (no primary character).
// level=1: zinc with chroma forced to TARGET_CHROMA and hue snapped to primary.
//
// Applies to surface-bg tokens only; `--color-on-surface` stays MCU-derived
// (no shade map for text-on-surface).
//
// Internally the algorithm is argb (HCT operates on argb ints); the layer
// at the API boundary is oklch strings — parse on input, format on output.

const TARGET_CHROMA = 8

// Tailwind v4 zinc — hex approximations of the OKLCH palette. Stored as
// argb ints because every consumer below needs HCT, not the hex string.
const ZINC_ARGB: Record<string, number> = {
  '50': argbFromHex('#fafafa'),
  '100': argbFromHex('#f4f4f5'),
  '200': argbFromHex('#e4e4e7'),
  '300': argbFromHex('#d4d4d8'),
  '700': argbFromHex('#3f3f46'),
  '800': argbFromHex('#27272a'),
  '900': argbFromHex('#18181b'),
  '950': argbFromHex('#09090b'),
}

const SHADE_MAP: Record<Mode, Record<string, string>> = {
  light: {
    '--color-surface': '50',
    '--color-surface-container': '100',
    '--color-surface-container-high': '200',
  },
  dark: {
    '--color-surface': '950',
    '--color-surface-container': '900',
    '--color-surface-container-high': '800',
  },
}

function lerpHue(a: number, b: number, t: number): number {
  let diff = b - a
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return (a + diff * t + 360) % 360
}

function blendOne(baseArgb: number, primaryArgb: number, level: number): string {
  if (level <= 0) return oklchFromArgb(baseArgb)
  const base = Hct.fromInt(baseArgb)
  const primary = Hct.fromInt(primaryArgb)
  const blended = Hct.from(
    lerpHue(base.hue, primary.hue, level),
    base.chroma + (TARGET_CHROMA - base.chroma) * level,
    base.tone,
  )
  return oklchFromArgb(blended.toInt())
}

export function applySurfaceTint(mcuLayer: TokenMap, mode: Mode, level: number): TokenMap {
  const primaryOklch = mcuLayer['--color-primary']
  if (!primaryOklch) return mcuLayer
  const primaryArgb = argbFromOklch(primaryOklch)
  const out: TokenMap = { ...mcuLayer }
  const shades = SHADE_MAP[mode]
  for (const [token, shade] of Object.entries(shades)) {
    const baseArgb = ZINC_ARGB[shade]
    if (baseArgb === undefined) continue
    out[token] = blendOne(baseArgb, primaryArgb, level)
  }
  return out
}
