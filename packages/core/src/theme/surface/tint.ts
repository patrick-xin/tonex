import { Hct } from '@tonex/mcu'
import type { TokenMap } from '../derive'
import type { Mode } from '../mode'
import { argbFromOklch, oklchFromArgb } from '../oklch'
import {
  NEUTRAL_PALETTE_NAMES,
  type NeutralPaletteName,
  TAILWIND_PALETTE_OKLCH,
} from './tailwind-colors'

// why: surface tint — replaces MCU's surfaces with a chosen TW neutral palette
// shade, then blends primary's hue+chroma back in proportional to `level`.
// Tone is preserved exactly (the shade map mirrors MCU's tone ladder).
//
// level=0: pure base palette shade (no primary character).
// level=1: base shade with chroma forced to TARGET_CHROMA and hue snapped to primary.
//
// Slice 7 generalized this from hardcoded zinc to any of NEUTRAL_PALETTE_NAMES;
// `paletteName` is required and validated by the type system.
//
// Scope: deliberately narrower than desaturate. Only the three core surface-bg
// tokens (`--color-surface`, `--color-surface-container`, `--color-surface-
// container-high`) are tinted — a known gap relative to the full md surface
// ramp added in slice 2 (`-dim`, `-bright`, `-container-lowest`, `-container-
// low`, `-container-highest` flow through MCU untouched). Expanding requires
// picking shades for each new token (a design call), not just enlarging
// SHADE_MAP. Defer until a UI exposes the full ramp under tint. on-surface +
// on-surface-variant are MCU-derived (no shade map for text-on-surface).
//
// Internally the algorithm is argb (HCT operates on argb ints); the layer
// at the API boundary is oklch strings — parse on input, format on output.

const TARGET_CHROMA = 8

// why: parse OKLCH strings → argb once at module load. Source of truth is
// `tailwind-colors.ts`; this is a derived lookup. Keeping the conversion here
// (not in tailwind-colors.ts) preserves that file as pure data.
const NEUTRAL_PALETTE_ARGB: Record<NeutralPaletteName, Record<string, number>> = (() => {
  const out = {} as Record<NeutralPaletteName, Record<string, number>>
  for (const name of NEUTRAL_PALETTE_NAMES) {
    const shades = TAILWIND_PALETTE_OKLCH[name]
    const map: Record<string, number> = {}
    for (const [shade, oklch] of Object.entries(shades)) {
      map[shade] = argbFromOklch(oklch)
    }
    out[name] = map
  }
  return out
})()

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

export function applySurfaceTint(
  mcuLayer: TokenMap,
  mode: Mode,
  level: number,
  paletteName: NeutralPaletteName,
): TokenMap {
  const primaryOklch = mcuLayer['--color-primary']
  if (!primaryOklch) return mcuLayer
  const primaryArgb = argbFromOklch(primaryOklch)
  const out: TokenMap = { ...mcuLayer }
  const shades = SHADE_MAP[mode]
  const palette = NEUTRAL_PALETTE_ARGB[paletteName]
  for (const [token, shade] of Object.entries(shades)) {
    const baseArgb = palette[shade]
    if (baseArgb === undefined) continue
    out[token] = blendOne(baseArgb, primaryArgb, level)
  }
  return out
}
