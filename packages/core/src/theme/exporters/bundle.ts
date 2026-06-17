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

// why: the colour-encoding axis as a runtime tuple, not a re-inlined union.
// Every exporter projects the argb-canonical TokenMap to one of these at the
// stringify seam (ADR-0021); a consumer that surfaces the choice as a flag
// (the CLI's `--format`) needs the *values*, not just the type, so per ADR-0016
// the tuple lives in core and callers import it instead of hardcoding
// `['oklch','hex']`. `oklch` first = the default. Type derives from the tuple.
export const COLOR_FORMATS = ['oklch', 'hex'] as const
export type ColorFormat = (typeof COLOR_FORMATS)[number]

// why: ADR-0021 commitment 6 — the dialog options object. All fields are
// optional and default to today's lean output. Shared across
// `buildContrastBundle` (reads includeContrastVariants) and `exportCss`
// (reads everything else). Slice 3 wires `includeContrastVariants` only;
// slice 4 wires `colorFormat` + the include* tier filters.
export interface ExportOptions {
  colorFormat?: ColorFormat
  includeExtended?: boolean
  includePalette?: boolean
  includeChart?: boolean
  // why: opt-in stable brand pair (shadcn layer only). When true, the shadcn
  // exporter emits `--brand` / `--brand-foreground` — the literal seed plus a
  // computed AA on-color, mode-invariant — and registers their `--color-brand`
  // utilities. Off by default so DEFAULT_INPUTS emits nothing new and the baked
  // globals.css drift-guard baseline stays byte-identical. Only the shadcn path
  // reads it; md/CSS/JSON/Dart ignore it (md users get the full custom set).
  includeBrand?: boolean
  includeContrastVariants?: boolean
  // why: shadcn bootstrap toggle. When true, the shadcn exporter prepends
  // the Tailwind v4 incantation (`@import "tailwindcss"`, `@custom-variant
  // dark`) so green-field projects get a complete globals.css. Existing
  // shadcn projects leave this off and paste only :root/.dark. md exports
  // always emit the header (always paste-target globals.css) and ignore
  // this flag.
  includeHeader?: boolean
  // why: native-CSS toggle. When true (the CSS-tab default), exportNativeCss
  // emits system tokens under the spec namespace `--md-sys-color-*` so the
  // output drops into Material Web Components / hand-rolled MD3. Off keeps the
  // bare `--color-*` names. Only the native-CSS path reads it; the Tailwind /
  // shadcn / JSON / Dart paths ignore it.
  mdSysPrefix?: boolean
  // why: an opaque provenance string the producer wants recorded INSIDE the
  // delivered projection — the durable artifact (ADR-0039 Decision 7, amendment
  // 2026-06-17). For the CLI it is the runnable recipe that reproduces this
  // exact theme; another consumer could pass a plain banner. Core only RENDERS
  // it in each format's native syntax — a leading `/* */` (css, native-css),
  // `#` (design.md) or `//` (dart) comment, or the `description` field where
  // comments are illegal (json) — it never builds or interprets the string.
  // Omitted → output is byte-identical to before (the drift-guard baseline).
  provenance?: string
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
