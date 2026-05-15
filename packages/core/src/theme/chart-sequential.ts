import { contrastRatio } from '@tonex/color-utils'
import { argbFromHex, type DynamicScheme, Hct, TonalPalette } from '@tonex/mcu'
import { variants } from '../variants'
import { cmfSecondSourceDisabledReason } from './cmf-second-source'
import type { Mode } from './mode'
import { applyPaletteOverrides } from './palette-override'
import type { PortableTheme } from './schema'

// why: monotonic perceptual-uniform sequential chart palette (ADR-0027 c.3).
// This file hosts BOTH the production sequential path and the dev-route lab:
//   - Production: `derive.ts` calls `buildMdChartSequentialSamples` with
//     hueSpread=0 / hueAnchor='chart-1' / N=MD_CHART_TOKEN_NAMES.length and
//     no manual L* overrides, then writes argbs into the 5 chart tokens.
//     Slice 2 promotion replaced the hand-picked CHART_TONES_*  constants
//     with this algorithmic walk so the 3:1 floor against partners holds
//     across all variants/seeds by construction.
//   - Lab: `buildSequentialReport` is the dev-route entry. Same core math
//     but exposed knobs (hueSpread, hueAnchor, variable N, per-slot manual
//     L* anchors). Used by /shadcn/chart-lab to prototype multi-hue
//     (slice 3) and adjacent variations without touching production.
// The file retires when polychrome (slice 4) lands and the chart-lab page
// closes; until then, both paths share one place.
//
// Algorithm:
//   1. prominent edge = brand-presentation tone (default 30 light / 70 dark,
//      caller can pass per-mode override). In light mode this is the DARK end
//      of the band; in dark mode the LIGHT end. It's the L* furthest from the
//      safe edge — i.e. highest contrast against the partner.
//   2. safe edge = binary-searched tone where contrast against the binding
//      partner crosses 3:1 (WCAG 1.4.11 non-text). Light mode walks DOWN
//      from tone 100; dark mode walks UP from tone 0. Bisection uses the
//      seed hue; for hueSpread > 0 the slot at safe-edge L* may carry a
//      rotated hue, so the reported safe edge is the seed-hue bound — an
//      approximation good enough for lab eyeballing under rotation.
//   3. N samples evenly across [min, max]; chart-1 = lightest, chart-N =
//      darkest (ColorBrewer convention; chart-i orders by L*, not by contrast).
//      In light mode that puts chart-1 at safe and chart-N at prominent; in
//      dark mode chart-1 at prominent and chart-N at safe.
//   4. value = TonalPalette.fromHueAndChroma(hueAtSlot, chroma).tone(L) —
//      variant-aware chroma (vibrant stays vibrant, tonalSpot stays muted).
//      With hueSpread === 0 the slot hue is the seed hue and the call short-
//      circuits to the seed palette (single-hue path). With hueSpread > 0
//      the hue rotates per slot per hueAnchor.
//   5. manualAnchors[i] (when non-null) overrides slot i's auto-spaced L*.
//      Per-slot override so prominent-edge changes only re-flow non-pinned
//      anchors. Production caller passes Array(n).fill(null) for full-auto.
//
// hueAnchor (only matters when hueSpread > 0):
//   - 'chart-1':        brand (seed) hue at chart-1 in both modes (chart-1
//                       is always the lightest). chart-N rotates by hueSpread.
//                       Preserves chart-i hue identity across modes — better
//                       for "this series is the same color thing."
//   - 'prominent-edge': brand hue at the prominent-edge slot — chart-N in
//                       light, chart-1 in dark. Preserves the single-hue
//                       mental model ("brand lives at the deep/bright end")
//                       but swaps chart-1 / chart-N hues between modes.

const TARGET_CONTRAST = 3

// why: defaults pick a brand-coherent L* at the high-contrast end of the band
// (light mode = darker, dark mode = lighter). 30/70 trades wider distinguish-
// ability for chart-N at the prominent edge looking moderately deep/bright
// rather than near-black/near-white; 40/80 keeps chart-N closer to the brand
// hue but compresses the L* range. Exposed so the dev lab can sweep per-mode.
export const PROMINENT_EDGE_LIGHT_DEFAULT = 30
export const PROMINENT_EDGE_DARK_DEFAULT = 70

// why: hueSpread = 0 keeps the prototype single-hue (current default, bit-
// identical to the original behavior). Positive values rotate hue across
// slots; ColorBrewer's hand-tuned multi-hue sequentials sit around 60–120°
// but algorithmic generation past ~60° starts looking categorical.
export const HUE_SPREAD_DEFAULT = 0

export type HueAnchor = 'chart-1' | 'prominent-edge'
export const HUE_ANCHOR_DEFAULT: HueAnchor = 'chart-1'

// why: 20 bisections take [0, 100] below 10^-4 tone units — well under the
// granularity at which palette.tone() output visibly differs.
const SEARCH_ITERS = 20

export interface SequentialModeOutput {
  argbs: readonly number[]
  samples: readonly number[]
  hues: readonly number[]
  safeEdge: number
  prominentEdge: number
}

export interface SequentialOutput {
  light: SequentialModeOutput
  dark: SequentialModeOutput
}

export interface SequentialParams {
  prominentEdges: { light: number; dark: number }
  hueSpread: number
  hueAnchor: HueAnchor
  n: number
  manualAnchors: {
    light: readonly (number | null)[]
    dark: readonly (number | null)[]
  }
}

// why: t ∈ [0, 1] is the slot index normalized — 0 at chart-1 (lightest),
// 1 at chart-N (darkest). Brand hue lives at the anchor end; rotation grows
// linearly toward the opposite end. For prominent-edge anchor the prominent
// slot depends on mode (chart-N in light, chart-1 in dark) so the rotation
// amount mirrors accordingly.
function hueAtSlot(
  i: number,
  n: number,
  seedHue: number,
  hueSpread: number,
  anchor: HueAnchor,
  mode: Mode,
): number {
  if (n === 1 || hueSpread === 0) return seedHue
  const t = i / (n - 1)
  if (anchor === 'chart-1') {
    return seedHue + hueSpread * t
  }
  // anchor === 'prominent-edge': rotation amount = distance (in t-units) from
  // the prominent slot. Light mode prominent at t=1, so amount = 1 - t. Dark
  // mode prominent at t=0, so amount = t.
  const tRotation = mode === 'light' ? 1 - t : t
  return seedHue + hueSpread * tRotation
}

export function buildMdChartSequentialSamples(
  primaryPalette: TonalPalette,
  mode: Mode,
  partners: readonly number[],
  prominentEdge: number,
  hueSpread: number,
  hueAnchor: HueAnchor,
  n: number,
  manualAnchors: readonly (number | null)[],
): SequentialModeOutput {
  const seedSample = (L: number) => primaryPalette.tone(L)
  const passesAllPartners = (L: number) =>
    partners.every((p) => contrastRatio(seedSample(L), p) >= TARGET_CONTRAST)

  const safeEdge =
    mode === 'light' ? findMaxSafeL(passesAllPartners) : findMinSafeL(passesAllPartners)

  // why: chart-1 = lightest in both modes. Light mode: highL = safeEdge (~55),
  // lowL = prominentEdge (30). Dark mode: highL = prominentEdge (70), lowL =
  // safeEdge (~45). Math.max/min unifies both cases — direction depends on
  // which edge is brighter, not on `mode`.
  const highL = Math.max(prominentEdge, safeEdge)
  const lowL = Math.min(prominentEdge, safeEdge)

  const samples: number[] = []
  const hues: number[] = []
  const argbs: number[] = []
  for (let i = 0; i < n; i++) {
    const override = manualAnchors[i] ?? null
    const L =
      override !== null ? override : n === 1 ? highL : highL - (i / (n - 1)) * (highL - lowL)
    const slotHue = hueAtSlot(i, n, primaryPalette.hue, hueSpread, hueAnchor, mode)
    samples.push(L)
    hues.push(slotHue)
    // why: reuse the seed palette when the slot hue matches — single-hue mode
    // (hueSpread === 0) and the anchor slot under multi-hue both hit this
    // path. Keeps single-hue output bit-identical to the pre-multi-hue branch.
    const slotPalette =
      slotHue === primaryPalette.hue
        ? primaryPalette
        : TonalPalette.fromHueAndChroma(slotHue, primaryPalette.chroma)
    argbs.push(slotPalette.tone(L))
  }

  return { argbs, samples, hues, safeEdge, prominentEdge }
}

// why: light mode — partner is bright; chart contrast shrinks as L rises.
// Max L where every partner still hits 3:1. Brackets [0, 100] assume
// passes(0) is true and passes(100) is false in the common case; degenerate
// envelopes (both ends pass, or neither) short-circuit before bisection.
function findMaxSafeL(passes: (L: number) => boolean): number {
  if (!passes(0)) return 0
  if (passes(100)) return 100
  let lo = 0
  let hi = 100
  for (let i = 0; i < SEARCH_ITERS; i++) {
    const mid = (lo + hi) / 2
    if (passes(mid)) lo = mid
    else hi = mid
  }
  return lo
}

// why: dark mode — partner is dark; chart contrast shrinks as L falls.
// Min L where every partner still hits 3:1. Mirror of findMaxSafeL.
function findMinSafeL(passes: (L: number) => boolean): number {
  if (!passes(100)) return 100
  if (passes(0)) return 0
  let lo = 100
  let hi = 0
  for (let i = 0; i < SEARCH_ITERS; i++) {
    const mid = (lo + hi) / 2
    if (passes(mid)) lo = mid
    else hi = mid
  }
  return lo
}

// why: dev-route consumer hands us a PortableTheme + the partner argbs it
// already has from useResolvedTokens(). We rebuild the scheme(s) here
// (mirroring deriveTheme's setup) so the lab can read scheme.primaryPalette
// at fractional tones — DerivedTheme.md.palette only exposes the 13 integer-
// tone samples, which is too coarse for binary search. Cost: ~10 lines of
// scheme construction duplicated from derive.ts; acceptable while the lab
// page is live.
export function buildSequentialReport(
  source: PortableTheme,
  partners: { light: readonly number[]; dark: readonly number[] },
  params: SequentialParams,
): SequentialOutput {
  const { lightScheme, darkScheme } = buildSchemes(source)
  return {
    light: buildMdChartSequentialSamples(
      lightScheme.primaryPalette,
      'light',
      partners.light,
      params.prominentEdges.light,
      params.hueSpread,
      params.hueAnchor,
      params.n,
      params.manualAnchors.light,
    ),
    dark: buildMdChartSequentialSamples(
      darkScheme.primaryPalette,
      'dark',
      partners.dark,
      params.prominentEdges.dark,
      params.hueSpread,
      params.hueAnchor,
      params.n,
      params.manualAnchors.dark,
    ),
  }
}

function buildSchemes(source: PortableTheme): {
  lightScheme: DynamicScheme
  darkScheme: DynamicScheme
} {
  const seedHct = Hct.fromInt(argbFromHex(source.seedHex))
  const variant = variants[source.variant]
  const secondHct =
    source.cmfSecondSourceHex !== null && cmfSecondSourceDisabledReason(source) === null
      ? Hct.fromInt(argbFromHex(source.cmfSecondSourceHex))
      : undefined
  const lightScheme = variant.build(seedHct, false, source.contrastLevel, secondHct)
  const darkScheme = variant.build(seedHct, true, source.contrastLevel, secondHct)
  applyPaletteOverrides(lightScheme, darkScheme, source)
  return { lightScheme, darkScheme }
}
