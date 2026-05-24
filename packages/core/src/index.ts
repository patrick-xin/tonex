// why: engine subpath — the live theme pipeline. `deriveTheme` is the spine;
// every other export is either a sink that consumes its output (`applyDom`,
// `exportCss`, `formatCss`, `formatLayer`), a React adapter over the source
// store (`useSource`, `useResolvedTokens`, `selectPortable`), a domain
// primitive (`sourceColorHexFromImage`), or a post-MCU transform that derive
// dispatches into (`applySurfaceTint`, `applySurfaceDesaturate`).
//
// Schema types live at `@tonex/core/schema`; static palette data at
// `@tonex/core/data`; oklch conversion at `@tonex/core/oklch`; variant
// strategies at `@tonex/core/variants`. Chart algorithm + chart schema
// fragments live at sibling subpath `chart/`, composed into the engine and
// schema barrels at the boundary. Splitting keeps each subpath's
// reason-to-grow independent — adding a schema field doesn't widen the
// engine surface, adding a variant doesn't touch the schema barrel.

export {
  buildSequentialReport,
  HUE_ANCHOR_DEFAULT,
  HUE_SPREAD_DEFAULT,
  type HueAnchor,
  PROMINENT_EDGE_DARK_DEFAULT,
  PROMINENT_EDGE_LIGHT_DEFAULT,
  type SequentialModeOutput,
  type SequentialOutput,
  type SequentialParams,
} from './chart'
export { applyDom } from './theme/applyDom'
export {
  type ContrastReport,
  evaluateThemeContrast,
  type PairResult,
} from './theme/contrast'
export {
  type CustomColorPreview,
  type CustomColorPreviewRoles,
  previewCustomColor,
} from './theme/custom-color'
export {
  type DerivedTheme,
  deriveTheme,
  type MdLayer,
  type ResolvedLayer,
  type ShadcnLayer,
  type TokenMap,
} from './theme/derive'
export {
  buildContrastBundle,
  type ContrastBundle,
  type ExportLayer,
  type ExportOptions,
  exportCss,
  exportDart,
  exportJson,
  exportNativeCss,
  formatCss,
  formatLayer,
} from './theme/exporters'
export { CHROMA_HUE_LOCK, type HctTriplet, hctFromHex, hexFromHct, maxChroma } from './theme/hct'
export { sourceColorHexFromImage } from './theme/image'
export { MODES, type Mode } from './theme/mode'
export {
  flushPersist,
  type SourceActions,
  type SourceState,
  selectPortable,
  selectSeedHex,
  useSource,
} from './theme/source'
export { applySurfaceDesaturate, applySurfaceTint } from './theme/surface'
export { useResolvedTokens } from './theme/useResolvedTokens'
