// why: ADR-0037 — this is the PURE engine barrel. `deriveTheme` is the spine;
// every other export is either an exporter sink that consumes its output
// (`exportCss`, `formatCss`, `formatLayer`), a domain primitive
// (`sourceColorHexFromImage`, `selectSeedHex`), or a post-MCU transform that
// derive dispatches into (`applySurfaceTint`, `applySurfaceDesaturate`). Zero
// React, zero zustand, zero DOM — the editor runtime (the source store,
// `useResolvedTokens`, `applyDom`, persistence) lives in @tonex/core-react.
// The cache-backed `getDerivedTheme` sits on a dedicated
// `@tonex/core/derive-cache` subpath, not here, so module-global cache state
// isn't advertised as part of the pure front door.
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
  buildColorsJson,
  buildContrastBundle,
  buildDesignMdColors,
  COLOR_FORMATS,
  type ColorFormat,
  type ColorsJson,
  type ContrastBundle,
  type ExportLayer,
  type ExportOptions,
  exportColorsJson,
  exportCss,
  exportDart,
  exportDesignMd,
  exportJson,
  exportNativeCss,
  formatCss,
  formatLayer,
} from './theme/exporters'
export { CHROMA_HUE_LOCK, type HctTriplet, hctFromHex, hexFromHct, maxChroma } from './theme/hct'
export { sourceColorHexFromImage } from './theme/image'
export { MODES, type Mode } from './theme/mode'
export { selectSeedHex } from './theme/seed'
export { applySurfaceDesaturate, applySurfaceTint } from './theme/surface'
