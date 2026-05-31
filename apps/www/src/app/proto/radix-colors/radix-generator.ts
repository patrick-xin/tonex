// THROWAWAY SPIKE — validates that MCU can generate a Radix-shaped 12-step
// scale from any seed. A real build lifts this into a pure core module
// (theme/radix/) feeding exporters/radix.ts; ADR-0017 keeps the tone/chroma/
// contrast math on the spine, never in the sink. Uses only @tonex/core public
// HCT primitives — no @tonex/mcu reach-through (ADR-0025).
import { hctFromHex, hexFromHct, type Mode, maxChroma } from '@tonex/core'
import { argbFromHex, relativeLuminance } from '@tonex/core/oklch'

// tone (≈L*) targets for the structural steps 1–8; 9–12 are seed-anchored or
// contrast-walked below. Light = light tinted-gray ramp; dark = its inverse.
const TONE: Record<Mode, number[]> = {
  light: [99, 98, 96, 93.5, 91, 87.5, 82, 75],
  dark: [8, 11, 15, 19, 23, 28, 35, 45],
}

// chroma as a fraction of seed chroma — backgrounds stay desaturated, peaking
// at the step-9 anchor. Indices 0–7 are steps 1–8; [8]=11-text, [9]=12-text.
const CFRAC: Record<Mode, { bg: number[]; text11: number; text12: number }> = {
  light: { bg: [0.05, 0.09, 0.18, 0.27, 0.36, 0.46, 0.58, 0.7], text11: 0.9, text12: 0.55 },
  dark: { bg: [0.35, 0.45, 0.6, 0.68, 0.74, 0.8, 0.82, 0.78], text11: 0.75, text12: 0.45 },
}

function at(h: number, c: number, t: number): string {
  return hexFromHct({ hue: h, chroma: Math.min(c, maxChroma(h, t)), tone: t })
}

export function contrast(fg: string, bg: string): number {
  const a = relativeLuminance(argbFromHex(fg))
  const b = relativeLuminance(argbFromHex(bg))
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

// walk tone in `dir` (+lighter / −darker) from `start` until contrast vs `bg`
// clears `target`; return the first passing tone (the lowest-contrast step that
// still satisfies) — mirrors tonex's chart sequential tone-walk.
function walkToContrast(
  h: number,
  c: number,
  start: number,
  dir: 1 | -1,
  bg: string,
  target: number,
): number {
  let t = start
  for (let i = 0; i < 120; i++) {
    if (contrast(at(h, c, t), bg) >= target) return t
    t += dir
    if (t <= 2 || t >= 98) return Math.max(2, Math.min(98, t))
  }
  return t
}

export type RadixScaleResult = { steps: string[]; onColor: string }

export function buildRadixScale(seedHex: string, mode: Mode): RadixScaleResult {
  const seed = hctFromHex(seedHex)
  const h = seed.hue
  const cs = seed.chroma
  const env = CFRAC[mode]
  const dir: 1 | -1 = mode === 'light' ? -1 : 1
  const steps = new Array<string>(12)

  // 1–8: structural backgrounds / borders
  for (let i = 0; i < 8; i++) steps[i] = at(h, cs * env.bg[i], TONE[mode][i])

  // 9 solid = the seed (anchors exactly); 10 = hovered solid
  const t9 = seed.tone
  steps[8] = at(h, cs, t9)
  steps[9] = at(h, cs, t9 + 4 * dir)

  // 11 low-contrast text ≥4.5:1 vs step-2; 12 high-contrast text ≥7:1 vs step-1
  const t11 = walkToContrast(h, cs * env.text11, t9 + 4 * dir, dir, steps[1], 4.5)
  steps[10] = at(h, cs * env.text11, t11)
  const t12 = walkToContrast(h, cs * env.text12, t11 + dir, dir, steps[0], 7)
  steps[11] = at(h, cs * env.text12, t12)

  // step-9 foreground: white or a dark tint of the hue, whichever reads better
  const fgDark = at(h, cs * 0.4, mode === 'light' ? 18 : 16)
  const onColor = contrast(steps[8], '#ffffff') >= contrast(steps[8], fgDark) ? '#ffffff' : fgDark

  return { steps, onColor }
}

// sRGB hex → OKLab ΔE (euclidean; OKLab ~perceptually uniform, ~0.02 = JND)
function lin(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
function oklab(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16)
  const r = lin(((n >> 16) & 255) / 255)
  const g = lin(((n >> 8) & 255) / 255)
  const b = lin((n & 255) / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
export function deltaE(a: string, b: string): number {
  const x = oklab(a)
  const y = oklab(b)
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}
