// why: ADR-0025 commitment 4 — color math + canonical emission live in
// `@tonex/color-utils` (the workspace boundary for npm-installed color libs).
// This file remains as a thin re-export so existing imports and the public
// `@tonex/core/oklch` subpath keep working without churn at consumer sites.

export {
  argbComponents,
  argbFromHex,
  argbFromOklch,
  hexFromOklch,
  hexString,
  oklchFromArgb,
  oklchFromHex,
  oklchString,
  relativeLuminance,
} from '@tonex/color-utils'
