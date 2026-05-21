import { Hct } from '@tonex/mcu'
import type { TokenMap } from '../derive'
import { argbFromOklch } from '../oklch'
import {
  NEUTRAL_PALETTE_NAMES,
  type NeutralPaletteName,
  TAILWIND_PALETTE_OKLCH,
} from './tailwind-colors'

// why: surface tint — repaints the md surface backgrounds with a chosen
// Tailwind neutral palette, then blends the primary's hue back in proportional
// to `level`. Each token keeps its MCU *tone*; only hue+chroma are swapped, so
// the elevation staircase MCU built survives intact.
//
// level=0: pure chosen neutral, no primary character — the inspectable anchor
//          "give me exactly this palette" (take-2 semantics, GH #91 discussion).
// level=1: that neutral nudged to the primary's hue, chroma → TARGET_CHROMA.
//
// Mechanism (B2, GH #91): the old tint snapped 3 tokens to literal Tailwind
// shades (50/100/200) and let the other 5 ramp steps flow through MCU — so
// neutral and brand-tinted steps alternated in one ramp (broken elevation).
// Literal shades can't scale: Tailwind's ladder has no rung for most of MCU's
// narrow high-tone surface band. So instead we *resample* the palette — read
// its hue+chroma at each token's own MCU tone (linear interp between the
// bracketing shades) — covering all 8 backgrounds with one coherent neutral
// ramp. Tone now carries the light/dark split, so the `mode` param is gone;
// this mirrors desaturate's per-token shape, the two differing only in
// direction (desaturate drains brand out, tint adds a chosen neutral in).
//
// Coverage: the 8 surface backgrounds only. on-surface/on-surface-variant stay
// MCU-derived — brand-tinted text ships later as an opt-in accent decoupled
// from this level (ADR-0018 amendment 2026-05-20), not folded in here.
//
// Argb-canonical per ADR-0021 — argb in, HCT math native argb, argb out.
// Stringification happens at the format/applyDom seam.

const TARGET_CHROMA = 8

const SURFACE_BACKGROUNDS = [
  '--color-surface',
  '--color-surface-dim',
  '--color-surface-bright',
  '--color-surface-container-lowest',
  '--color-surface-container-low',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
] as const

interface ShadePoint {
  hue: number
  chroma: number
  tone: number
}

// why: parse each neutral palette's OKLCH shades → HCT once at module load,
// sorted by tone ascending so sampleNeutral can walk bracketing pairs. Source
// of truth is tailwind-colors.ts; this derived lookup lives here to keep that
// file pure data.
const NEUTRAL_SHADE_POINTS: Record<NeutralPaletteName, ShadePoint[]> = (() => {
  const out = {} as Record<NeutralPaletteName, ShadePoint[]>
  for (const name of NEUTRAL_PALETTE_NAMES) {
    const points = Object.values(TAILWIND_PALETTE_OKLCH[name]).map((oklch) => {
      const hct = Hct.fromInt(argbFromOklch(oklch))
      return { hue: hct.hue, chroma: hct.chroma, tone: hct.tone }
    })
    points.sort((a, b) => a.tone - b.tone)
    out[name] = points
  }
  return out
})()

function lerpHue(a: number, b: number, t: number): number {
  let diff = b - a
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return (a + diff * t + 360) % 360
}

// why: the palette's hue+chroma at an arbitrary MCU tone, linearly interpolated
// between the two bracketing shades. Tones past the palette's range (MCU's t100
// white / t0 black extremes) clamp to the nearest end.
function sampleNeutral(points: ShadePoint[], tone: number): { hue: number; chroma: number } {
  const first = points[0]
  if (tone <= first.tone) return { hue: first.hue, chroma: first.chroma }
  const last = points[points.length - 1]
  if (tone >= last.tone) return { hue: last.hue, chroma: last.chroma }
  for (let i = 0; i < points.length - 1; i++) {
    const lo = points[i]
    const hi = points[i + 1]
    if (tone <= hi.tone) {
      const t = (tone - lo.tone) / (hi.tone - lo.tone || 1)
      return { hue: lerpHue(lo.hue, hi.hue, t), chroma: lo.chroma + (hi.chroma - lo.chroma) * t }
    }
  }
  return { hue: last.hue, chroma: last.chroma }
}

// why: level=0 returns the pure neutral at this tone; above 0 it lerps hue
// toward primary and lifts chroma toward TARGET_CHROMA. Tone is fixed by the
// caller (MCU's), never moved.
function tintToken(
  tone: number,
  neutral: { hue: number; chroma: number },
  primaryHue: number,
  level: number,
): number {
  if (level <= 0) return Hct.from(neutral.hue, neutral.chroma, tone).toInt()
  return Hct.from(
    lerpHue(neutral.hue, primaryHue, level),
    neutral.chroma + (TARGET_CHROMA - neutral.chroma) * level,
    tone,
  ).toInt()
}

export function applySurfaceTint(
  mcuLayer: TokenMap,
  level: number,
  paletteName: NeutralPaletteName,
): TokenMap {
  const primaryArgb = mcuLayer['--color-primary']
  if (primaryArgb === undefined) return mcuLayer
  const primaryHue = Hct.fromInt(primaryArgb).hue
  const points = NEUTRAL_SHADE_POINTS[paletteName]
  const out: TokenMap = { ...mcuLayer }
  for (const token of SURFACE_BACKGROUNDS) {
    const argb = mcuLayer[token]
    if (argb === undefined) continue
    const tone = Hct.fromInt(argb).tone
    out[token] = tintToken(tone, sampleNeutral(points, tone), primaryHue, level)
  }
  return out
}
