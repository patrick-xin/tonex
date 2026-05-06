// why: OKLCH conversion at the emission seam. MCU operates in argb internally;
// shadcn v4 + Tailwind v4 emit `oklch(L C H)` at the CSS surface. Conversion
// is local to this file so derive.ts and the surface treatments speak one
// format (oklch strings) at their TokenMap boundaries — round-trip through
// argb only when an algorithm needs HCT operations.
//
// Refs:
//   - https://bottosson.github.io/posts/oklab/ (forward + inverse matrices)
//   - https://www.w3.org/TR/css-color-4/#color-conversion-code
// Forward path: argb → linear sRGB → OKLab → OKLCH. Inverse mirrors.

// why: linear sRGB → LMS (Bottosson, 2020). Constants are exact within the
// matrix's published precision; do NOT replace with rounded values.
const LINEAR_TO_LMS = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
] as const

// why: cube-rooted LMS → OKLab. Same reference as above.
const LMS_TO_OKLAB = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
] as const

// why: inverse matrices for OKLab → LMS → linear sRGB. Computed by direct
// matrix inversion of the forward matrices; values pinned here so future
// edits don't accidentally drift the round-trip.
const OKLAB_TO_LMS = [
  [1.0, 0.3963377774, 0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.291485548],
] as const

const LMS_TO_LINEAR = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
] as const

function srgbToLinear(c: number): number {
  const cn = c / 255
  return cn <= 0.04045 ? cn / 12.92 : ((cn + 0.055) / 1.055) ** 2.4
}

function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
  return Math.max(0, Math.min(255, Math.round(v * 255)))
}

// why: precision targets. L stays in 0..1; C is small (typically <0.4 in
// in-gamut sRGB); H wraps 0..360. 4 decimals on L/C and 2 on H mirrors the
// shadcn v4 / tailwind v4 conventions and keeps token files diff-friendly.
const L_PRECISION = 4
const C_PRECISION = 4
const H_PRECISION = 2

// why: emit precision-bounded numbers without trailing zeros. `toFixed` rounds
// to the precision target but pads with zeros (`297.4` → `"297.40"`); biome's
// CSS formatter strips those zeros on commit, breaking the drift-guard since
// the file then no longer equals `formatCss(deriveTheme(DEFAULT_INPUTS))`.
// Round via toFixed, then re-parse so the final string has no padding.
function trim(n: number, precision: number): string {
  return Number(n.toFixed(precision)).toString()
}

export function oklchFromArgb(argb: number): string {
  const r = (argb >> 16) & 0xff
  const g = (argb >> 8) & 0xff
  const b = argb & 0xff
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)

  const lms0 = LINEAR_TO_LMS[0][0] * lr + LINEAR_TO_LMS[0][1] * lg + LINEAR_TO_LMS[0][2] * lb
  const lms1 = LINEAR_TO_LMS[1][0] * lr + LINEAR_TO_LMS[1][1] * lg + LINEAR_TO_LMS[1][2] * lb
  const lms2 = LINEAR_TO_LMS[2][0] * lr + LINEAR_TO_LMS[2][1] * lg + LINEAR_TO_LMS[2][2] * lb

  const l_ = Math.cbrt(lms0)
  const m_ = Math.cbrt(lms1)
  const s_ = Math.cbrt(lms2)

  const L = LMS_TO_OKLAB[0][0] * l_ + LMS_TO_OKLAB[0][1] * m_ + LMS_TO_OKLAB[0][2] * s_
  const a = LMS_TO_OKLAB[1][0] * l_ + LMS_TO_OKLAB[1][1] * m_ + LMS_TO_OKLAB[1][2] * s_
  const bb = LMS_TO_OKLAB[2][0] * l_ + LMS_TO_OKLAB[2][1] * m_ + LMS_TO_OKLAB[2][2] * s_

  const C = Math.sqrt(a * a + bb * bb)
  let H = (Math.atan2(bb, a) * 180) / Math.PI
  if (H < 0) H += 360
  // why: chromaless colors have undefined hue; collapse to 0 so the string
  // is canonical and round-trips deterministically. Below 1e-4 the hue is
  // already noise from float math on near-neutral inputs.
  if (C < 1e-4) H = 0

  return `oklch(${trim(L, L_PRECISION)} ${trim(C, C_PRECISION)} ${trim(H, H_PRECISION)})`
}

// why: matches `oklch(L C H)` with whitespace flexibility but rejects the
// alpha syntax (`/ A`) since deriveTheme never emits alpha — anything
// non-canonical signals upstream corruption and should throw, not silently
// strip alpha.
const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/

export function argbFromOklch(value: string): number {
  const match = OKLCH_PATTERN.exec(value.trim())
  if (!match) throw new Error(`[oklch] not a canonical oklch(L C H) string: ${value}`)
  const L = Number(match[1])
  const C = Number(match[2])
  const H = (Number(match[3]) * Math.PI) / 180
  const a = C * Math.cos(H)
  const bb = C * Math.sin(H)

  const l_ = OKLAB_TO_LMS[0][0] * L + OKLAB_TO_LMS[0][1] * a + OKLAB_TO_LMS[0][2] * bb
  const m_ = OKLAB_TO_LMS[1][0] * L + OKLAB_TO_LMS[1][1] * a + OKLAB_TO_LMS[1][2] * bb
  const s_ = OKLAB_TO_LMS[2][0] * L + OKLAB_TO_LMS[2][1] * a + OKLAB_TO_LMS[2][2] * bb

  const lms0 = l_ ** 3
  const lms1 = m_ ** 3
  const lms2 = s_ ** 3

  const lr = LMS_TO_LINEAR[0][0] * lms0 + LMS_TO_LINEAR[0][1] * lms1 + LMS_TO_LINEAR[0][2] * lms2
  const lg = LMS_TO_LINEAR[1][0] * lms0 + LMS_TO_LINEAR[1][1] * lms1 + LMS_TO_LINEAR[1][2] * lms2
  const lb = LMS_TO_LINEAR[2][0] * lms0 + LMS_TO_LINEAR[2][1] * lms1 + LMS_TO_LINEAR[2][2] * lms2

  const r = linearToSrgb(lr)
  const g = linearToSrgb(lg)
  const b = linearToSrgb(lb)

  return ((255 << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)) >>> 0
}

// why: convenience adapters for sites that hold a hex (user input,
// localStorage v1 reads, container/lock overrides) and need the canonical
// emission format. Keeps consumers free of `argbFromHex(...) → oklchFromArgb`
// boilerplate; everything routes through one parser pair.
import { argbFromHex, hexFromArgb } from '@tonex/mcu'

export function oklchFromHex(hex: string): string {
  return oklchFromArgb(argbFromHex(hex))
}

export function hexFromOklch(value: string): string {
  return hexFromArgb(argbFromOklch(value))
}
