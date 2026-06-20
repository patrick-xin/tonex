import { MD_CHART_TOKEN_NAMES } from '../../chart/schema'
import type { TokenMap } from '../derive'
import type { Mode } from '../mode'
import { hexString } from '../oklch'
import { MD_CORE_TOKEN_NAMES, MD_TOKEN_NAMES } from '../schema'
import type { ContrastBundle, ExportOptions } from './bundle'
import { mdBrandPair } from './format'

// why: emits one mode's color surface as a DESIGN.md (@google/design.md)
// `colors:` YAML block — the fragment a user pastes into their own DESIGN.md
// (commonly Stitch-authored), replacing its colors block with tonex's derived
// palette. DESIGN.md enters tonex outbound, color-only — never an inbound source or
// CSS-generation input (ADR-0033). Sibling to json.ts / css.ts, same rules: ADR-0017 —
// pure sink, reshapes what deriveTheme returned, never recomputes a color or a
// role mapping; ADR-0021 c.1 — argb is canonical inside DerivedTheme, projection
// to hex happens here at the seam. Four differences from the JSON / CSS sinks,
// each a property of the DESIGN.md format rather than a choice:
//   1. hex-only — the format's Color type is sRGB hex (`#rrggbb`), so oklch is
//      invalid output; colorFormat is ignored. Lowercase, matching the format's
//      own examples (and lossless today — the pipeline is sRGB-hex-bound).
//   2. single mode — DESIGN.md has no light/dark axis, so the caller picks one
//      and only the (mode, default-tier) projection is read. Contrast tiers in
//      the bundle are likewise out of scope; we read bundle.default.
//   3. flat kebab keys — `--color-on-primary-fixed-variant` → `on-primary-
//      fixed-variant`. No camelCase (json.ts's concern), no `--color-` prefix.
//   4. no separate definition block — DESIGN.md's colors map is flat, so the
//      user's custom colors ride inline as their slugs, not in a sibling
//      `extendedColors` array (json.ts's shape).

// why: the full role roster as a membership set so the custom-color loop can
// tell user slugs (which ride inside md.light/dark) apart from MD roles. Slugs
// are validated never to collide with a roster name (schema.slugifyCustomColor-
// Name guards), so set-membership is an exact partition.
const MD_TOKEN_SET: ReadonlySet<string> = new Set(MD_TOKEN_NAMES)

// why: kebab CSS var → DESIGN.md color key. Strip `--color-` and keep the rest
// verbatim — DESIGN.md keys are kebab role names (matching the format's own
// examples), unlike json.ts which camelCases for MTB parity.
function designKey(tokenName: string): string {
  return tokenName.replace(/^--color-/, '')
}

// why: the flat colors map for one mode, the assertable shape the serializer
// stringifies (mirrors json.ts's build/serialize split). Order is canonical
// roster first (core, or core+extended under includeExtended), then the user's
// custom slugs in store order, then the chart family when toggled — same trailing
// composition json.ts uses so a paste-replace diffs cleanly against the roster.
export function buildDesignMdColors(
  bundle: ContrastBundle,
  mode: Mode,
  options: ExportOptions = {},
): Record<string, string> {
  const theme = bundle.default
  const includeExtended = options.includeExtended ?? false
  const includeChart = options.includeChart ?? false
  const includeBrand = options.includeBrand ?? false

  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  const lookup: TokenMap = { ...core, ...extended }
  const roster = includeExtended ? MD_TOKEN_NAMES : MD_CORE_TOKEN_NAMES

  const out: Record<string, string> = {}
  for (const name of roster) {
    const argb = lookup[name]
    if (argb === undefined) continue
    out[designKey(name)] = hexString(argb)
  }
  // why: the user's own custom colors — the slugs that ride in `core` outside
  // the MD roster. Always emitted (they are deliberate user input, not a
  // toggle), trailing the roster in store order.
  for (const name of Object.keys(core)) {
    if (MD_TOKEN_SET.has(name)) continue
    out[designKey(name)] = hexString(core[name] as number)
  }
  // why: the literal-seed brand pair (ADR-0032), opt-in — `brand` /
  // `brand-foreground` ride inline as flat kebab keys, same shape as a custom
  // slug. Trails the user's customs; mode-invariant, so the single chosen mode is
  // exact. Skip a key a custom color already owns (a custom named "brand" wins),
  // mirroring the CSS sinks' dedup.
  if (includeBrand) {
    for (const [name, argb] of Object.entries(mdBrandPair(theme))) {
      const key = designKey(name)
      if (key in out) continue
      out[key] = hexString(argb)
    }
  }
  // why: chart trails, opt-in — same gate and tail position as json.ts. Chart
  // is its own mode-aware family on md, iterated explicitly (ADR-0027).
  if (includeChart) {
    const chart = mode === 'light' ? theme.md.lightChart : theme.md.darkChart
    for (const name of MD_CHART_TOKEN_NAMES) {
      const argb = chart[name]
      if (argb === undefined) continue
      out[designKey(name)] = hexString(argb)
    }
  }
  return out
}

// why: thin serializer over the builder (ADR-0008 — adding a format stays a pure
// formatting task). A bare `colors:` block (no `---` fences, no other sections)
// is the paste target: the user drops it over the colors block of their existing
// DESIGN.md. Hex values are QUOTED because a bare `#rrggbb` is a YAML comment.
export function exportDesignMd(
  bundle: ContrastBundle,
  mode: Mode,
  options: ExportOptions = {},
): string {
  const colors = buildDesignMdColors(bundle, mode, options)
  const lines = Object.entries(colors).map(([key, hex]) => `  ${key}: "${hex}"`)
  // why: the recipe rides as a leading YAML `#` comment above colors: — valid
  // YAML, travels with the paste (ADR-0039 Decision 7). Each line is prefixed so
  // a multi-line recipe stays a comment; empty when absent (block unchanged).
  const banner = options.provenance
    ? `${options.provenance
        .split('\n')
        .map((line) => `# ${line}`)
        .join('\n')}\n`
    : ''
  return `${banner}colors:\n${lines.join('\n')}\n`
}
