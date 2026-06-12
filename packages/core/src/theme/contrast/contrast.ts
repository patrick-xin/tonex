import { contrastRatio } from '@tonex/color-utils'
import type { CustomColorEntry } from '../custom-color/entry'
import type { DerivedTheme, TokenMap } from '../derive'
import type { Mode } from '../mode'
import {
  BRAND_CONTRAST_PAIRS,
  CONTRAST_PAIRS,
  type ContrastPair,
  customColorContrastPairs,
} from './pairs'

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

// why: WeakMap keyed on the DerivedTheme reference, caching ONLY the
// customColors-independent slice — the static CONTRAST_PAIRS tuple (73 pairs
// post issue #47 sweep + link-variant role-as-text addendum). That is the
// per-keystroke hot path: the role-editor
// surfaces call evaluateThemeContrast on every edit, and the derive cache
// (issue #20) hands every consumer the same DerivedTheme for the same
// source, so they share this slot. Custom-color pairs are NOT cached here —
// they depend on the customColors argument, so caching them under the theme
// key alone would let one caller's custom pairs leak into another's. They
// are cheap (≤3 per entry, cold dialog path) and recomputed per call
// instead. WeakMap auto-collects on derive-cache eviction.
const staticReportCache = new WeakMap<DerivedTheme, ContrastReport>()

// why: `customColors` must be the same source's that produced `theme` — the
// derive cache keys DerivedTheme on source identity and source.customColors is
// part of source, so a given theme reference has exactly one valid customColors
// set. The www contrast dialog reads both from one store render, so the
// invariant holds; a mismatched call throws in evaluatePair (missing token)
// rather than returning a wrong number. Defaults to [] so the role-editor
// surfaces keep seeing exactly the static spec list.
// why: `opts.includeBrand` opt-in mirrors the customColors append — the brand
// pair (ADR-0032) is always derivable but only the contrast dialog (driven by
// the editor's single brand toggle) wants it audited; the 14 role-editor
// surfaces call with neither arg and keep seeing exactly the static spec list.
// Brand pairs are cheap (5) and recomputed per call like custom pairs, so the
// theme-keyed static cache stays brand-free and can't leak a brand-aware report
// into a plain caller.
export function evaluateThemeContrast(
  theme: DerivedTheme,
  customColors: readonly CustomColorEntry[] = [],
  opts: { includeBrand?: boolean } = {},
): ContrastReport {
  const staticReport = getStaticReport(theme)
  const extraPairs: ContrastPair[] = [
    ...customColorContrastPairs(customColors),
    ...(opts.includeBrand ? BRAND_CONTRAST_PAIRS : []),
  ]
  if (extraPairs.length === 0) return staticReport
  const extraReport = buildReport(theme, extraPairs)
  return {
    light: [...staticReport.light, ...extraReport.light],
    dark: [...staticReport.dark, ...extraReport.dark],
  }
}

function getStaticReport(theme: DerivedTheme): ContrastReport {
  const cached = staticReportCache.get(theme)
  if (cached) return cached
  const report = buildReport(theme, CONTRAST_PAIRS)
  staticReportCache.set(theme, report)
  return report
}

// why: maps a pair list to a ContrastReport against `theme`. Static and custom
// pairs run the identical path — custom md tokens live in the core
// md.{light,dark} bucket (ADR-0021 c.3) and custom shadcn tokens in
// shadcn.{light,dark}, so layerMapFor routes the *-custom layers to the same
// merged maps the static md/shadcn pairs use. Exported (not just module-private)
// so the `./audit` primitive `auditPairs` can score an ARBITRARY pair list off
// the same scorer — `evaluateThemeContrast` keeps its WeakMap cache for the
// static set and is NOT routed through here.
export function buildReport(theme: DerivedTheme, pairs: readonly ContrastPair[]): ContrastReport {
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
  // why: ADR-0032 — brand pairs read --brand / --brand-foreground from the
  // mode-invariant theme.shadcn.brand map, and the neutral-surface partners
  // (--background, --card) from the per-mode shadcn map. Merging both into one
  // map per mode keeps evaluatePair's one-TokenMap signature; brand wins key
  // collisions on its own tokens, the surfaces carry their per-mode values.
  const shadcnBrandLight = { ...theme.shadcn.light, ...theme.shadcn.brand }
  const shadcnBrandDark = { ...theme.shadcn.dark, ...theme.shadcn.brand }
  return {
    light: pairs.map((pair) =>
      evaluatePair(
        pair,
        layerMapFor(
          pair,
          mdLight,
          mdChartLight,
          theme.shadcn.light,
          shadcnChartLight,
          shadcnBrandLight,
        ),
        'light',
      ),
    ),
    dark: pairs.map((pair) =>
      evaluatePair(
        pair,
        layerMapFor(pair, mdDark, mdChartDark, theme.shadcn.dark, shadcnChartDark, shadcnBrandDark),
        'dark',
      ),
    ),
  }
}

function layerMapFor(
  pair: ContrastPair,
  md: TokenMap,
  mdChart: TokenMap,
  shadcn: TokenMap,
  shadcnChart: TokenMap,
  shadcnBrand: TokenMap,
): TokenMap {
  // why: md-custom slugs land in the core md.{light,dark} bucket (ADR-0021
  // c.3) that `md` already merges; shadcn-custom slugs land in
  // shadcn.{light,dark}, which `shadcn` is.
  if (pair.layer === 'md' || pair.layer === 'md-custom') return md
  if (pair.layer === 'md-chart') return mdChart
  if (pair.layer === 'shadcn' || pair.layer === 'shadcn-custom') return shadcn
  if (pair.layer === 'shadcn-brand') return shadcnBrand
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
