import { argbFromHex, hexFromArgb } from '@tonex/mcu'
import { converter, toGamut } from 'culori'
import { isValidHex } from './hex'

// why: hex→argb boundary primitive. Re-exported so consumers (and the
// `@tonex/core/oklch` surface above) get hex→argb without importing
// `@tonex/mcu` directly — the ADR-0025 firewall keeps mcu a dep of this
// package alone. Pairs with `hexString` as the inverse direction (issue #128).
export { argbFromHex } from '@tonex/mcu'

// why: ADR-0025 commitment 3 — tonex owns the string form. culori does the
// math (commitment 2); this layer pins precision, trailing-zero behavior, and
// chromaless hue snap so a culori upgrade can never silently shift emission.

const toOklch = converter('oklch')
// why: CSS Color Module 4 gamut mapping — reduces chroma at fixed L/H to bring
// out-of-sRGB OKLCH into gamut, matching browsers and oklch.com. Per-channel
// clipping (the prior `clamp255` path) snapped one axis to the gamut wall and
// shifted perceived hue/lightness for the ~33% of TAILWIND_PALETTE_OKLCH
// swatches outside sRGB. ADR-0025 firewall holds: color-utils stays culori's
// only consumer.
const toGamutRgb = toGamut('rgb', 'oklch')

const L_PRECISION = 4
const C_PRECISION = 4
const H_PRECISION = 2

// why: `toFixed` rounds to precision but pads with zeros (`297.4` → `"297.40"`);
// biome's CSS formatter strips those zeros on commit, so the baked globals.css
// would no longer equal `formatCss(deriveTheme(DEFAULT_INPUTS))` — drift-guard
// tripped on a no-op file save. Round, then re-parse to drop the padding.
function trim(n: number, precision: number): string {
  return Number(n.toFixed(precision)).toString()
}

export function argbComponents(argb: number): { r: number; g: number; b: number } {
  return {
    r: (argb >> 16) & 0xff,
    g: (argb >> 8) & 0xff,
    b: argb & 0xff,
  }
}

function rgbObj(argb: number) {
  const { r, g, b } = argbComponents(argb)
  return { mode: 'rgb' as const, r: r / 255, g: g / 255, b: b / 255 }
}

export function oklchFromArgb(argb: number): string {
  const oklch = toOklch(rgbObj(argb))
  const L = oklch.l ?? 0
  const C = oklch.c ?? 0
  // why: culori returns `h: undefined` for chromaless inputs (hue is undefined
  // when chroma is zero). The explicit `< 1e-4` snap also catches near-neutral
  // surfaces where float noise would otherwise produce non-zero hues that
  // round to e.g. `297.42` for two visually identical greys.
  let H = oklch.h ?? 0
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
  if (!match) throw new Error(`[color-utils] not a canonical oklch(L C H) string: ${value}`)
  const L = Number(match[1])
  const C = Number(match[2])
  const H = Number(match[3])
  const rgb = toGamutRgb({ mode: 'oklch', l: L, c: C, h: H })
  const r = to255(rgb.r)
  const g = to255(rgb.g)
  const b = to255(rgb.b)
  return ((255 << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)) >>> 0
}

// why: toGamutRgb guarantees [0,1] channels, so this is round-and-scale only;
// the prior clamp was load-bearing against out-of-gamut overflow and is no
// longer needed. Math.min guards float dust above 1 (e.g. 1.0000002).
function to255(v: number): number {
  return Math.min(255, Math.round((v ?? 0) * 255))
}

export function oklchFromHex(hex: string): string {
  return oklchFromArgb(argbFromHex(hex))
}

export function hexFromOklch(value: string): string {
  return hexFromArgb(argbFromOklch(value))
}

// why: the seed-input transducer. The seed field accepts two color formats — a
// 6-digit hex and a canonical `oklch(L C H)` (the form shadcn/tweakcn emit) —
// and projects both to one sRGB hex for `setSeedHex`. Returning a hex (never
// the oklch) is exactly why it's safe on the seed (a lossy derivation input,
// not a WYSIWYG-pinned token) and why it must NOT back the override/custom/role
// pickers. Canonical-only: a non-canonical oklch fails OKLCH_PATTERN and returns
// null rather than being normalized — the lenient parser is deferred. Composes
// the strict argbFromOklch firewall (ADR-0025); never relaxes it.
export function hexFromColorInput(value: string): string | null {
  const trimmed = value.trim()
  if (isValidHex(trimmed)) return trimmed
  if (OKLCH_PATTERN.test(trimmed)) return hexFromOklch(trimmed)
  return null
}

// why: ADR-0021 commitment 1 — argb-canonical TokenMaps. `oklchString` and
// `hexString` are the projection helpers every emitter (applyDom, exporters)
// calls. Adding a third colorspace later (lab, p3) is a one-helper change.
export function oklchString(argb: number): string {
  return oklchFromArgb(argb)
}

export function hexString(argb: number): string {
  return hexFromArgb(argb)
}
