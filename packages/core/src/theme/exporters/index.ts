// why: exporters/ groups everything that turns a DerivedTheme into a string
// — paste-ready files (css, dart, json, ts), the build-time bake convenience
// (format.ts → globals.css via formatCss/formatLayer), and the export-pipeline
// orchestrator (bundle.ts → ContrastBundle + ExportOptions for the multi-tier
// emission path). ADR-0017 binds every file here: stringify what deriveTheme
// returned, never recompute a color, role mapping, or numeric format. ADR-0021
// pins argb as the wire format; projection to oklch/hex happens at this seam.
// Adding an export format: new file here, register in this barrel, extend
// ExportOptions in bundle.ts if it takes options. Internal cross-file imports
// inside exporters/ stay on direct sibling paths (./format, ./bundle, ./css)
// so the barrel doesn't introduce circular-import risk within the folder.

export {
  buildContrastBundle,
  type ContrastBundle,
  type ExportOptions,
} from './bundle'
export { type ExportLayer, exportCss } from './css'
export { exportDart } from './dart'
export { formatCss, formatLayer } from './format'
export { exportJson } from './json'
export { exportNativeCss } from './native-css'
