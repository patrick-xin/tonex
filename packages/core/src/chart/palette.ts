// why: the chart-palette TAXONOMY — the intent-named vocabulary
// (single / multi / polychrome) that both the www toggle and the CLI
// `--chart-palette` flag speak, mapped to the underlying `{ scheme, hueSpread }`
// axis core actually derives from. Lives here, beside schema.ts, so the
// label→inputs fact has ONE home: before this, the www toggle hardcoded the
// `0` / HUE_SPREAD_DEFAULT magic numbers inline, and a second consumer (the
// CLI) would have had to duplicate them — drift waiting to happen. The mapping
// is the seam; both surfaces project it, neither owns the constants.
//
// Deliberately NOT a general "chart category framework": it lifts the three
// labels that exist today and nothing speculative. New schemes/counts extend
// this small module when they actually land.
import { type ChartScheme, HUE_SPREAD_DEFAULT } from './schema'

// why: the user-facing palette names, ordered single → multi → polychrome
// (narrowest hue story to widest). The picklist the `--chart-palette` flag's
// `values` and the www toggle both read, so the two can never disagree on the
// set of choices.
export const CHART_PALETTES = ['single', 'multi', 'polychrome'] as const
export type ChartPalette = (typeof CHART_PALETTES)[number]

// why: the agent-facing intent text, mirroring variantTaxonomy()'s role — an
// agent maps a fact it knows about its data (one ramp vs distinct series) to a
// palette from this field alone, with zero skill-doc dependency. Surfaced by
// the CLI's `describe.chart`.
export const CHART_PALETTE_DESCRIPTIONS: Record<ChartPalette, string> = {
  single: 'shades of one hue — ordered magnitude, brand-coherent (sequential, no rotation)',
  multi: 'one hue ramped with a gentle rotation for series separation (sequential, default)',
  polychrome: 'distinct unordered series — hues rotated for maximum separation (categorical)',
}

// why: the forward map label → derivation inputs. Reuses HUE_SPREAD_DEFAULT (no
// new constant) so "multi" tracks the production default automatically. The
// `single` ↔ `multi` split is purely `hueSpread === 0`; `polychrome` switches
// scheme to categorical, which synthesizes its own hue-rotated points and
// ignores hueSpread — we still pin it to the default so the value is explicit
// and the inverse below round-trips. hueAnchor is untouched (the caller merges
// this over DEFAULT_INPUTS.chart, preserving the anchor).
export function chartPaletteToInputs(palette: ChartPalette): {
  scheme: ChartScheme
  hueSpread: number
} {
  switch (palette) {
    case 'single':
      return { scheme: 'sequential', hueSpread: 0 }
    case 'multi':
      return { scheme: 'sequential', hueSpread: HUE_SPREAD_DEFAULT }
    case 'polychrome':
      return { scheme: 'categorical', hueSpread: HUE_SPREAD_DEFAULT }
  }
}

// why: the inverse map inputs → label — the projection the www toggle reads to
// light the active segment, and the CLI's recipe header reads to round-trip a
// derived theme back into a pasteable `--chart-palette <label>`. categorical
// short-circuits to polychrome (it ignores hueSpread), so the forward map's
// `polychrome → hueSpread: DEFAULT` choice is invisible here and the round-trip
// chartInputsToPalette(chartPaletteToInputs(p)) === p holds for all three.
export function chartInputsToPalette(inputs: {
  scheme: ChartScheme
  hueSpread: number
}): ChartPalette {
  if (inputs.scheme === 'categorical') return 'polychrome'
  return inputs.hueSpread === 0 ? 'single' : 'multi'
}

// why: a membership guard for the raw flag string, grouped with the tuple it
// checks (the chart/ sibling of spec.ts's isTarget/isMode). Lets the CLI reject
// an out-of-set --chart-palette value loudly instead of defaulting silently.
export function isChartPalette(value: string): value is ChartPalette {
  return (CHART_PALETTES as readonly string[]).includes(value)
}
