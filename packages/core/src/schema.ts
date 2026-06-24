// why: schema subpath — types, constants, and pure validators that describe
// the PortableTheme shape. Imported anywhere a caller needs to reason about
// what a theme IS without invoking the engine. Kept distinct from the engine
// barrel so adding a schema field doesn't touch consumers that only need
// engine functions, and vice versa.

export {
  CHART_PALETTE_DESCRIPTIONS,
  CHART_PALETTES,
  CHART_SCHEMES,
  type ChartPalette,
  type ChartScheme,
  chartInputsToPalette,
  chartPaletteToInputs,
  HUE_ANCHOR_DEFAULT,
  HUE_ANCHORS,
  HUE_SPREAD_DEFAULT,
  type HueAnchor,
  isChartPalette,
  MD_CHART_TOKEN_NAMES,
  type MdChartTokenName,
  SHADCN_CHART_TOKEN_NAMES,
  type ShadcnChartTokenName,
} from './chart'
export {
  findActiveBindingPreset,
  SHADCN_BINDING_PRESETS,
  type ShadcnBindingPreset,
  type ShadcnBindingPresetName,
} from './theme/binding-presets'
export { CONTRAST_PAIRS, type ContrastPair } from './theme/contrast'
export { isSoftEdgeWeight, SOFT_EDGE_TOKEN, withSoftEdges } from './theme/edge-weight'
export { paletteOverrideDisabledReason } from './theme/palette-override'
export { type PresetAdoptChoices, resolvePresetApply } from './theme/preset-apply'
export {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  MD_CORE_TOKEN_NAMES,
  MD_EXTENDED_TOKEN_NAMES,
  MD_PALETTE_FAMILY_NAMES,
  MD_PALETTE_TOKEN_NAMES,
  MD_PALETTE_TONE_NAMES,
  MD_TOKEN_NAMES,
  type MdCoreTokenName,
  type MdExtendedTokenName,
  type MdPaletteFamilyName,
  type MdPaletteTokenName,
  type MdPaletteToneName,
  type MdTokenName,
  PALETTE_FAMILIES,
  PALETTE_NAMES,
  type PaletteName,
  type PortableTheme,
  PortableThemeSchema,
  parsePortableTheme,
  SCHEMA_VERSION,
  type SchemaVersion,
  type Seed,
  SHADCN_EDGE_ROLES,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  type ShadcnRoleName,
  SURFACE_ALGOS,
  type SurfaceAlgo,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './theme/schema'
export {
  findActivePreset,
  SHADCN_PRESETS,
  type ShadcnPreset,
  type ShadcnPresetName,
} from './theme/shadcn-presets'
export { cmfSecondSourceDisabledReason } from './variants/cmf-second-source'
