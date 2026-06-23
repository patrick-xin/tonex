// why: chart/ internal barrel — the single entry point used by everything
// outside chart/. Theme imports schema fragments and build helpers from
// here; the engine and schema barrels re-export the public-surface subset.
// Internal cross-file imports inside chart/ stay on direct sibling paths
// (./schema, ./sequential, ./build) so the barrel doesn't introduce
// circular import risk within the folder.

export {
  applyShadcnChartOverrides,
  buildMdChart,
  rebrandChart,
} from './build'
export {
  CHART_PALETTE_DESCRIPTIONS,
  CHART_PALETTES,
  type ChartPalette,
  chartInputsToPalette,
  chartPaletteToInputs,
  isChartPalette,
} from './palette'
export {
  CHART_SCHEMES,
  type ChartScheme,
  HUE_ANCHOR_DEFAULT,
  HUE_ANCHORS,
  HUE_SPREAD_DEFAULT,
  type HueAnchor,
  MD_CHART_TOKEN_NAMES,
  type MdChartTokenName,
  SHADCN_CHART_TOKEN_NAMES,
  type ShadcnChartTokenName,
} from './schema'
export {
  buildSequentialReport,
  PROMINENT_EDGE_DARK_DEFAULT,
  PROMINENT_EDGE_LIGHT_DEFAULT,
  type SequentialModeOutput,
  type SequentialOutput,
  type SequentialParams,
} from './sequential'
