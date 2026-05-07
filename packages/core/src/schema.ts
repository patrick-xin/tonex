// why: schema subpath — types, constants, and pure validators that describe
// the PortableTheme shape. Imported anywhere a caller needs to reason about
// what a theme IS without invoking the engine. Kept distinct from the engine
// barrel so adding a schema field doesn't touch consumers that only need
// engine functions, and vice versa.

export { cmfSecondSourceDisabledReason } from './theme/cmf-second-source'
export { paletteOverrideDisabledReason } from './theme/palette-override'
export {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  isValidHex,
  MD_TOKEN_NAMES,
  type MdTokenName,
  PALETTE_NAMES,
  type PaletteName,
  type PortableTheme,
  SCHEMA_VERSION,
  type SchemaVersion,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  type ShadcnRoleName,
  STORAGE_KEY,
  SURFACE_ALGOS,
  type SurfaceAlgo,
  slugifyCustomColorName,
  validateCustomColorEntry,
} from './theme/schema'
