// why: schema subpath — types, constants, and pure validators that describe
// the PortableTheme shape. Imported anywhere a caller needs to reason about
// what a theme IS without invoking the engine. Kept distinct from the engine
// barrel so adding a schema field doesn't touch consumers that only need
// engine functions, and vice versa.

export { cmfSecondSourceDisabledReason } from './theme/cmf-second-source'
export { paletteOverrideDisabledReason } from './theme/palette-override'
export {
  CHART_MODES,
  type ChartMode,
  CONTRAST_PAIRS,
  type ContrastPair,
  type CustomColorEntry,
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  isValidHex,
  MD_CHART_TOKEN_NAMES,
  MD_CORE_TOKEN_NAMES,
  MD_EXTENDED_TOKEN_NAMES,
  MD_PALETTE_FAMILY_NAMES,
  MD_PALETTE_TOKEN_NAMES,
  MD_PALETTE_TONE_NAMES,
  MD_TOKEN_NAMES,
  type MdChartTokenName,
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
  SHADCN_CHART_TOKEN_NAMES,
  SHADCN_ROLE_NAMES,
  type ShadcnChartTokenName,
  type ShadcnRoleBindings,
  type ShadcnRoleName,
  STORAGE_KEY,
  SURFACE_ALGOS,
  type SurfaceAlgo,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './theme/schema'
