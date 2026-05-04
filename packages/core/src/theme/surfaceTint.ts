import { argbFromHex, Hct, hexFromArgb } from '@tonex/mcu'
import type { TokenMap } from './derive'

// why: surface tint — replaces MCU's surfaces with a TW zinc base, then
// blends primary's hue+chroma back in proportional to `level`. Tone is
// preserved exactly (zinc shade map mirrors MCU's tone ladder).
//
// level=0: pure zinc (no primary character).
// level=1: zinc with chroma forced to TARGET_CHROMA and hue snapped to primary.
//
// Applies to surface-bg tokens only; `--color-on-surface` stays MCU-derived
// (no shade map for text-on-surface).

const TARGET_CHROMA = 8

// Tailwind v4 zinc — hex approximations of the OKLCH palette.
const ZINC: Record<string, string> = {
  '50': '#fafafa',
  '100': '#f4f4f5',
  '200': '#e4e4e7',
  '300': '#d4d4d8',
  '700': '#3f3f46',
  '800': '#27272a',
  '900': '#18181b',
  '950': '#09090b',
}

const SHADE_MAP: Record<'light' | 'dark', Record<string, string>> = {
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

function blendOne(baseHex: string, primaryHex: string, level: number): string {
  if (level <= 0) return baseHex
  const base = Hct.fromInt(argbFromHex(baseHex))
  const primary = Hct.fromInt(argbFromHex(primaryHex))
  const blended = Hct.from(
    lerpHue(base.hue, primary.hue, level),
    base.chroma + (TARGET_CHROMA - base.chroma) * level,
    base.tone,
  )
  return hexFromArgb(blended.toInt())
}

export function applySurfaceTint(
  mcuLayer: TokenMap,
  mode: 'light' | 'dark',
  level: number,
): TokenMap {
  const primaryHex = mcuLayer['--color-primary']
  const out: TokenMap = { ...mcuLayer }
  const shades = SHADE_MAP[mode]
  for (const [token, shade] of Object.entries(shades)) {
    const baseHex = ZINC[shade]
    if (!baseHex || !primaryHex) continue
    out[token] = blendOne(baseHex, primaryHex, level)
  }
  return out
}
