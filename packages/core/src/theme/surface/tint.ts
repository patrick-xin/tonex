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
// Coverage: the 8 surface backgrounds AND the 2 outline tokens (both driven by
// `level` — borders are coherence-coupled to the surface, GH #93 / ADR-0018
// amendment 2026-05-21) PLUS, opt-in, the 2 text tokens on-surface/
// on-surface-variant (driven by a SEPARATE `textLevel`, GH #92). Text decouples
// from `level` so "clean neutral cards + brand-accented text" is reachable;
// outline does NOT, because a brand border on a neutral card reads as a leftover
// rather than a deliberate accent.
//
// Text follows the SAME neutral→brand model as the backgrounds, on its own knob:
// textLevel=0 is the chosen neutral palette at the token's own tone (a clean
// baseline — picking a neutral palette drains MCU's brand chroma out of text too,
// not just the surfaces), and textLevel rises toward --color-primary's hue.
// The one difference is the chroma ceiling: backgrounds cap at TARGET_CHROMA (a
// whisper), text at TEXT_CHROMA_CEILING_FRACTION of the primary's own chroma — a
// deliberately stronger accent, settled at 25% in /prototype-text-accent (enough
// pop without tripping the 4.5:1 floor; linear, no easing). Tone is pinned
// throughout (text legibility depends on it).
//
// Argb-canonical per ADR-0021 — argb in, HCT math native argb, argb out.
// Stringification happens at the format/applyDom seam.

const TARGET_CHROMA = 8

// why: text-accent chroma ceiling, as a fraction of the primary's own chroma.
// 25% accents without crowding the 4.5:1 contrast floor on the canary token
// (settled in /prototype-text-accent across vivid + muted seeds, GH #92).
const TEXT_CHROMA_CEILING_FRACTION = 0.25

const TEXT_TOKENS = ['--color-on-surface', '--color-on-surface-variant'] as const

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

// why: outline/outline-variant ride the SAME `level` and recipe as the
// backgrounds (GH #93) — coherence-coupled to surfaceTintLevel, NOT a separate
// accent knob like text (#92). A brand-colored border on a neutral surface
// reads as a structural leftover, not a deliberate accent, so level=0 drains
// outline to the chosen neutral exactly as it does the backgrounds.
const SURFACE_OUTLINES = ['--color-outline', '--color-outline-variant'] as const

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

// why: opt-in text accent — same neutral→brand model as tintToken, on its own
// knob. Base is the chosen neutral palette at the token's own tone (textLevel=0
// → clean neutral text, NOT MCU). textLevel lerps hue toward the primary and
// lifts chroma toward TEXT_CHROMA_CEILING_FRACTION of the primary's chroma —
// a stronger ceiling than backgrounds, since text is a deliberate accent. Tone
// stays MCU's (legibility).
function tintTextToken(
  textArgb: number,
  neutralPoints: ShadePoint[],
  primary: Hct,
  level: number,
): number {
  const tone = Hct.fromInt(textArgb).tone
  const base = sampleNeutral(neutralPoints, tone)
  if (level <= 0) return Hct.from(base.hue, base.chroma, tone).toInt()
  const ceiling = primary.chroma * TEXT_CHROMA_CEILING_FRACTION
  return Hct.from(
    lerpHue(base.hue, primary.hue, level),
    base.chroma + (ceiling - base.chroma) * level,
    tone,
  ).toInt()
}

export function applySurfaceTint(
  mcuLayer: TokenMap,
  level: number,
  paletteName: NeutralPaletteName,
  textLevel = 0,
): TokenMap {
  const primaryArgb = mcuLayer['--color-primary']
  if (primaryArgb === undefined) return mcuLayer
  const primary = Hct.fromInt(primaryArgb)
  const points = NEUTRAL_SHADE_POINTS[paletteName]
  const out: TokenMap = { ...mcuLayer }
  for (const token of [...SURFACE_BACKGROUNDS, ...SURFACE_OUTLINES]) {
    const argb = mcuLayer[token]
    if (argb === undefined) continue
    const tone = Hct.fromInt(argb).tone
    out[token] = tintToken(tone, sampleNeutral(points, tone), primary.hue, level)
  }
  for (const token of TEXT_TOKENS) {
    const argb = mcuLayer[token]
    if (argb === undefined) continue
    out[token] = tintTextToken(argb, points, primary, textLevel)
  }
  return out
}
