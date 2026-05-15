import { type DynamicScheme, Hct } from '@tonex/mcu'
import type { Mode } from '../theme/mode'
import type { PortableTheme } from '../theme/schema'
import { MD_CHART_TOKEN_NAMES, SHADCN_CHART_TOKEN_NAMES } from './schema'
import {
  buildMdChartSequentialSamples,
  PROMINENT_EDGE_DARK_DEFAULT,
  PROMINENT_EDGE_LIGHT_DEFAULT,
} from './sequential'

// why: local alias for the argb-keyed map shape. The canonical spelling is
// theme/derive.ts's exported TokenMap; re-declaring here avoids a circular
// import (derive imports buildMdChart from this file). Same primitive shape
// — Record<string, number> — so the duplication is name-only.
type TokenMap = Record<string, number>

// why: categorical scheme — hue-rotated primitives (ADR-0024, renamed to
// `categorical` in ADR-0027 c.2). Offsets distribute 5 chart series around
// the color wheel: source hue, two triadic partners (±120°), then split-
// complementary fill (60°/180°). Fixed chroma/tone so hue is the only axis
// of separation — variant treatment intentionally does NOT participate
// (hue rotation contradicts variant tonal-spotting). Tone values shifted in
// slice contrast-4: light 50→45, dark 60→65, both for 3:1 headroom against
// shadcn `--card` partner per ADR-0027 c.5.
const MULTI_HUE_OFFSETS = [0, 120, 240, 60, 180] as const
const MULTI_CHROMA = 50
const MULTI_TONE_LIGHT = 45
const MULTI_TONE_DARK = 65
// why: a near-achromatic seed (e.g. user picked #808080) has no usable hue,
// so multi mode falls back to hue 270 (purple) — matches shadcn's default
// chart palette character. Threshold 5 chroma units is the same MCU uses
// internally for "essentially gray" comparisons.
const MULTI_ACHROMATIC_THRESHOLD = 5
const MULTI_FALLBACK_HUE = 270

// why: chart-color derivation has two shapes by intent (ADR-0024 / ADR-0027).
//   sequential — algorithmic monotonic walk in the seed's primaryPalette: L*
//                spaced evenly between a binary-searched safe edge (3:1 floor
//                against partners) and a brand-presentation prominent edge,
//                with optional per-slot hue rotation. Variant-aware (palette
//                encodes Vibrant / Expressive / Rainbow chroma character).
//                Respects paletteOverrides because the override mutates the
//                primaryPalette in place upstream. Math lives in
//                `chart/sequential.ts`; this branch is the production call.
//                Slice 3 (ADR-0027 c.3) routes chart.hueSpread + chart.hueAnchor
//                through to the algorithm so the multi-hue rotation is
//                user-tunable. Partners arg is the per-mode md surface family
//                argbs the algorithm bisects against.
//   categorical — synthesizes 5 hue-rotated points via Hct.from() at fixed
//                 chroma+tone. Variant-bypassed by design — hue rotation and
//                 variant tonal-spotting are conflicting goals. Achromatic
//                 seed (chroma < 5) uses fallback hue 270 so a gray seed
//                 still produces a colorful series.
export function buildMdChart(
  seedHct: Hct,
  scheme: DynamicScheme,
  mode: Mode,
  chart: PortableTheme['chart'],
  partners: readonly number[],
): TokenMap {
  const out: TokenMap = {}
  if (chart.scheme === 'sequential') {
    const { argbs } = buildMdChartSequentialSamples(
      scheme.primaryPalette,
      mode,
      partners,
      mode === 'light' ? PROMINENT_EDGE_LIGHT_DEFAULT : PROMINENT_EDGE_DARK_DEFAULT,
      chart.hueSpread,
      chart.hueAnchor,
      MD_CHART_TOKEN_NAMES.length,
      Array(MD_CHART_TOKEN_NAMES.length).fill(null),
    )
    MD_CHART_TOKEN_NAMES.forEach((name, i) => {
      out[name] = argbs[i] as number
    })
    return out
  }
  const baseHue = seedHct.chroma < MULTI_ACHROMATIC_THRESHOLD ? MULTI_FALLBACK_HUE : seedHct.hue
  const tone = mode === 'dark' ? MULTI_TONE_DARK : MULTI_TONE_LIGHT
  MD_CHART_TOKEN_NAMES.forEach((name, i) => {
    const hue = (baseHue + MULTI_HUE_OFFSETS[i]) % 360
    out[name] = Hct.from(hue, MULTI_CHROMA, tone).toInt()
  })
  return out
}

// why: shadcn's chart names are the same 5 values the md side computes, just
// renamed (`--color-chart-1` → `--chart-1`). One source of truth, two
// namespaces — chart character can't drift between layers.
export function rebrandChart(mdChart: TokenMap): TokenMap {
  const out: TokenMap = {}
  SHADCN_CHART_TOKEN_NAMES.forEach((shadcnName, i) => {
    const argb = mdChart[MD_CHART_TOKEN_NAMES[i]]
    if (argb === undefined) {
      throw new Error(`[rebrandChart] missing md chart token at index ${i}`)
    }
    out[shadcnName] = argb
  })
  return out
}
