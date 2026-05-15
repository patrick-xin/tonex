// why: chart-domain schema atoms — token name lists, scheme picklists, hue
// rotation defaults. Lives here (sibling of theme/) so chart-bug grep windows
// stay bounded to chart/. Composition into PortableTheme + DEFAULT_INPUTS +
// PortableThemeSchema validator happens in theme/schema.ts, which imports
// these constants back. The split mirrors the variants/ precedent: domain
// constants live with the domain code that consumes them; the composed theme
// schema stays the central composition seam.

// why: ADR-0021 commitment 2 — chart tokens are derived from the primary
// palette via a fixed 5-tone mapping. Mode-aware (mirrors core role tokens),
// not contrast-invariant. Names match the shadcn convention prefixed with
// `--color-` so they line up with Tailwind v4 utility resolution.
export const MD_CHART_TOKEN_NAMES = [
  '--color-chart-1',
  '--color-chart-2',
  '--color-chart-3',
  '--color-chart-4',
  '--color-chart-5',
] as const
export type MdChartTokenName = (typeof MD_CHART_TOKEN_NAMES)[number]

// why: shadcn-side chart names mirror the prevailing shadcn convention
// (`--chart-1` … `--chart-5`). Values are sourced from the same primary
// palette tones — chart is one underlying domain, surfaced under each
// layer's namespace.
export const SHADCN_CHART_TOKEN_NAMES = [
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
] as const
export type ShadcnChartTokenName = (typeof SHADCN_CHART_TOKEN_NAMES)[number]

// why: chart-color derivation has two shapes by intent (ADR-0024, renamed
// in ADR-0027 c.2 to align with data-viz vocabulary). `sequential` reads
// the scheme's primary palette at fixed tones (variant-aware — Vibrant /
// Expressive / Rainbow flavor flows through; was `mono`). `categorical`
// synthesizes 5 hue-rotated points via Hct.from() at fixed chroma + tone
// (variant-bypassed — hue rotation is the whole point; was `multi`).
// `diverging` is reserved per ADR-0027 c.2 but lands in a future slice —
// picklist starts at two values. shadcn's default is sequential.
export const CHART_SCHEMES = ['sequential', 'categorical'] as const
export type ChartScheme = (typeof CHART_SCHEMES)[number]

// why: ADR-0027 c.3 — slice 3 promotion. Sequential chart axis gained
// multi-hue rotation as the default: chart-1..N rotate hue across hueSpread
// degrees, with the anchor strategy selecting which slot pins to the seed
// hue. `chart-1` (the default) preserves "this series is the same color"
// across modes — chart-1 is always lightest and always carries the brand
// hue. `prominent-edge` pins the deep/bright end (chart-N in light, chart-1
// in dark) to the brand hue instead, at the cost of swapping chart-1's hue
// between modes. Single-hue is the opt-in (chart.hueSpread = 0).
export const HUE_ANCHORS = ['chart-1', 'prominent-edge'] as const
export type HueAnchor = (typeof HUE_ANCHORS)[number]

// why: production defaults for the multi-hue knobs. Imported by both the
// schema (DEFAULT_INPUTS.chart) and chart/sequential.ts so the lab page's
// initial knob position matches what production renders by default. 80° was
// chosen after lab eyeballing — broad enough for visible series separation
// without crossing the categorical-feeling threshold (~120°+). 'chart-1'
// anchor matches ColorBrewer convention; chart-1 = lightest = brand hue.
export const HUE_SPREAD_DEFAULT = 80
export const HUE_ANCHOR_DEFAULT: HueAnchor = 'chart-1'
