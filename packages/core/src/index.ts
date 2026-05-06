// why: engine subpath — the live theme pipeline. `deriveTheme` is the spine;
// every other export is either a sink that consumes its output (`applyDom`,
// `exportCss`, `formatCss`, `formatLayer`), a React adapter over the source
// store (`useSource`, `useResolvedTokens`, `selectPortable`), a domain
// primitive (`sourceColorHexFromImage`), or a post-MCU transform that derive
// dispatches into (`applySurfaceTint`, `applySurfaceDesaturate`).
//
// Schema types live at `@tonex/core/schema`; static palette data at
// `@tonex/core/data`; oklch conversion at `@tonex/core/oklch`; variant
// strategies at `@tonex/core/variants`. Splitting keeps each subpath's
// reason-to-grow independent — adding a schema field doesn't widen the
// engine surface, adding a variant doesn't touch the schema barrel.
export { applyDom } from './theme/applyDom'
export {
  type DerivedTheme,
  deriveTheme,
  type ResolvedLayer,
  type TokenMap,
} from './theme/derive'
export { type ExportLayer, exportCss } from './theme/exporters/css'
export { formatCss, formatLayer } from './theme/format'
export { sourceColorHexFromImage } from './theme/image'
export type { Mode } from './theme/mode'
export { type SourceActions, type SourceState, selectPortable, useSource } from './theme/source'
export { applySurfaceDesaturate, applySurfaceTint } from './theme/surface'
export { useResolvedTokens } from './theme/useResolvedTokens'
