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
  const report: ContrastReport = {
    light: CONTRAST_PAIRS.map((pair) =>
      evaluatePair(pair, pair.layer === 'md' ? mdLight : theme.shadcn.light, 'light'),
    ),
    dark: CONTRAST_PAIRS.map((pair) =>
      evaluatePair(pair, pair.layer === 'md' ? mdDark : theme.shadcn.dark, 'dark'),
    ),
  }
  reportCache.set(theme, report)
  return report
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
