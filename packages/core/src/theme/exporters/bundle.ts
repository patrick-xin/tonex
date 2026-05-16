import { type DerivedTheme, getDerivedTheme } from '../derive'
import type { PortableTheme } from '../schema'

// why: ADR-0021 commitment 5 — class-scoped contrast variants emit as one
// CSS file with three tiers. `buildContrastBundle` orchestrates the 3×
// deriveTheme call needed when `includeContrastVariants: true`; the resulting
// `ContrastBundle` then flows through `exportCss(bundle, layer, options)` so
// emission code can iterate tiers uniformly.
//
// Edge case (user's preview contrast ≠ 0 + variants on): the `default` tier
// reflects the user's chosen baseline (whatever `source.contrastLevel` is at
// call time); `medium`/`high` are *additions* at canonical 0.5 / 1.0 — they
// don't override the user's preview. The dialog's preview pane reflects the
// same behavior so what users see matches what they paste.

// why: canonical accessibility tiers per WCAG-aligned MCU contrast levels.
// Pinned at module scope so the values are searchable and a future bump
// (e.g. 0.45 / 0.95) is a one-line change with the test file as forcing.
const CANONICAL_MEDIUM_CONTRAST = 0.5
const CANONICAL_HIGH_CONTRAST = 1.0

// why: ContrastBundle uses optional fields rather than a discriminated union
// so consumers can branch on presence (`if (bundle.medium) ...`) without
// type-narrowing ceremony. Single-contrast bundles set only `default`;
// multi-contrast bundles set all three. Adding a fourth tier (e.g. low
// contrast at -0.5) would extend this interface — exportCss already iterates
// over present tiers, so emission would auto-include it.
export interface ContrastBundle {
  default: DerivedTheme
  medium?: DerivedTheme
  high?: DerivedTheme
}

// why: ADR-0021 commitment 6 — the dialog options object. All fields are
// optional and default to today's lean output. Shared across
// `buildContrastBundle` (reads includeContrastVariants) and `exportCss`
// (reads everything else). Slice 3 wires `includeContrastVariants` only;
// slice 4 wires `colorFormat` + the include* tier filters.
export interface ExportOptions {
  colorFormat?: 'oklch' | 'hex'
  includeExtended?: boolean
  includePalette?: boolean
  includeChart?: boolean
  includeContrastVariants?: boolean
  // why: shadcn bootstrap toggle. When true, the shadcn exporter prepends
  // the Tailwind v4 incantation (`@import "tailwindcss"`, `@custom-variant
  // dark`) so green-field projects get a complete globals.css. Existing
  // shadcn projects leave this off and paste only :root/.dark. md exports
  // always emit the header (always paste-target globals.css) and ignore
  // this flag.
  includeHeader?: boolean
}

// why: tier values come from the unified derive cache (issue #20). Each
// `getDerivedTheme(source, level)` call is keyed on the (source-identity,
// contrastLevel) pair, so toggling `includeContrastVariants` off and back on
// with the same source returns the same DerivedTheme references — and the
// default tier shares the same cache slot as `useResolvedTokens` /
// `applyDom`. Bundle wrapper allocation is cheap; the load-bearing work
// (deriveTheme) is what gets memoized.
export function buildContrastBundle(
  source: PortableTheme,
  opts: ExportOptions = {},
): ContrastBundle {
  const defaultTheme = getDerivedTheme(source)
  if (!opts.includeContrastVariants) return { default: defaultTheme }
  return {
    default: defaultTheme,
    medium: getDerivedTheme(source, CANONICAL_MEDIUM_CONTRAST),
    high: getDerivedTheme(source, CANONICAL_HIGH_CONTRAST),
  }
}
