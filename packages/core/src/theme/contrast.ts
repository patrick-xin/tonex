import { contrastRatio } from '@tonex/color-utils'
import type { DerivedTheme, TokenMap } from './derive'
import type { Mode } from './mode'
import { CONTRAST_PAIRS, type ContrastPair } from './schema'

// why: ADR-0025 commitment 8 — `evaluateThemeContrast` is downstream of
// `DerivedTheme`, never on the spine. The spine continues to produce token
// values; analyses are pure functions over those values. This keeps applyDom
// and exporters free of contrast costs they don't pay attention to.

export interface PairResult {
  pair: ContrastPair
  fgArgb: number
  bgArgb: number
  ratio: number
  passes: boolean
}

export interface ContrastReport {
  light: readonly PairResult[]
  dark: readonly PairResult[]
}

// why: WeakMap keyed on the DerivedTheme reference. The derive cache (issue
// #20) returns the same DerivedTheme for the same source, so a re-call from
// any consumer hits this slot — same `===`-stable ContrastReport reference,
// no recomputation of 56 contrastRatio calls per editor keystroke. WeakMap
// auto-collects when the DerivedTheme is evicted from the derive cache.
const reportCache = new WeakMap<DerivedTheme, ContrastReport>()

export function evaluateThemeContrast(theme: DerivedTheme): ContrastReport {
  const cached = reportCache.get(theme)
  if (cached) return cached
  // why: md pairs span both core (`on-X / X`) and extended (`on-X-fixed`,
  // `inverse-on-surface`) tokens — DerivedTheme partitions those by emission
  // policy (ADR-0021 commitment 2), but contrast evaluation is one of the
  // "data-only inspect" consumers and needs the merged view.
  const mdLight = { ...theme.md.light, ...theme.md.lightExtended }
  const mdDark = { ...theme.md.dark, ...theme.md.darkExtended }
  // why: ADR-0027 c.5 — chart pairs read the chart fg from the layer's
  // *Chart map (kept separate by emission policy) and the partner from the
  // layer's main map. Merging once per (layer, mode) here keeps evaluatePair's
  // signature uniform (one TokenMap that contains both sides) and the report
  // shape unchanged.
  const mdChartLight = { ...mdLight, ...theme.md.lightChart }
  const mdChartDark = { ...mdDark, ...theme.md.darkChart }
  const shadcnChartLight = { ...theme.shadcn.light, ...theme.shadcn.lightChart }
  const shadcnChartDark = { ...theme.shadcn.dark, ...theme.shadcn.darkChart }
  const report: ContrastReport = {
    light: CONTRAST_PAIRS.map((pair) =>
      evaluatePair(
        pair,
        layerMapFor(pair, mdLight, mdChartLight, theme.shadcn.light, shadcnChartLight),
        'light',
      ),
    ),
    dark: CONTRAST_PAIRS.map((pair) =>
      evaluatePair(
        pair,
        layerMapFor(pair, mdDark, mdChartDark, theme.shadcn.dark, shadcnChartDark),
        'dark',
      ),
    ),
  }
  reportCache.set(theme, report)
  return report
}

function layerMapFor(
  pair: ContrastPair,
  md: TokenMap,
  mdChart: TokenMap,
  shadcn: TokenMap,
  shadcnChart: TokenMap,
): TokenMap {
  if (pair.layer === 'md') return md
  if (pair.layer === 'md-chart') return mdChart
  if (pair.layer === 'shadcn') return shadcn
  return shadcnChart
}

function evaluatePair(pair: ContrastPair, layer: TokenMap, mode: Mode): PairResult {
  const fgArgb = layer[pair.fg]
  const bgArgb = layer[pair.bg]
  if (fgArgb === undefined || bgArgb === undefined) {
    throw new Error(
      `[evaluateThemeContrast] missing token in ${pair.layer}.${mode}: fg=${pair.fg} bg=${pair.bg}`,
    )
  }
  const ratio = contrastRatio(fgArgb, bgArgb)
  return { pair, fgArgb, bgArgb, ratio, passes: ratio >= pair.threshold }
}
