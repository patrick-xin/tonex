// why: re-export the MCU primitives that the editor needs (image-derived seed,
// argb→hex conversion). Keeps www→core as the only allowed layer boundary so
// the editor doesn't reach into @tonex/mcu directly.
export { hexFromArgb, sourceColorFromImage } from '@tonex/mcu'
export { applyDom } from './theme/applyDom'
export {
  type DerivedTheme,
  deriveTheme,
  type ResolvedLayer,
  type TokenMap,
} from './theme/derive'
export { type ExportLayer, exportCss } from './theme/exporters/css'
export { formatCss, formatLayer } from './theme/format'
export type { Mode } from './theme/mode'
export { hexFromOklch } from './theme/oklch'
export {
  type CustomColorEntry,
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  MD_TOKEN_NAMES,
  type MdTokenName,
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
export { type SourceState, selectPortable, useSource } from './theme/source'
export {
  applySurfaceDesaturate,
  applySurfaceTint,
  NEUTRAL_PALETTE_NAMES,
  type NeutralPaletteName,
} from './theme/surface'
export { TAILWIND_PALETTE_OKLCH } from './theme/surface/tailwind-colors'
export { useResolvedTokens } from './theme/useResolvedTokens'
export {
  DEFAULT_VARIANT,
  type VariantGroup,
  type VariantName,
  type VariantStrategy,
  variants,
} from './variants'
