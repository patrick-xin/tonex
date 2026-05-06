export { applyDom } from './theme/applyDom'
export {
  type DerivedTheme,
  deriveTheme,
  type ResolvedLayer,
  type TokenMap,
} from './theme/derive'
export { formatCss, formatLayer } from './theme/format'
export type { Mode } from './theme/mode'
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
export { applySurfaceDesaturate, applySurfaceTint } from './theme/surface'
export { useResolvedTokens } from './theme/useResolvedTokens'
export {
  DEFAULT_VARIANT,
  type VariantName,
  type VariantStrategy,
  variants,
} from './variants'
