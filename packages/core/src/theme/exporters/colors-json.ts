import type { DerivedTheme, TokenMap } from '../derive'
import type { Mode } from '../mode'
import { hexString, oklchString } from '../oklch'
import { MD_TOKEN_NAMES, type PortableTheme, type SurfaceAlgo } from '../schema'
import { selectSeedHex } from '../seed'
import type { ColorFormat, ContrastBundle, ExportOptions } from './bundle'

// why: the canonical `colors.json` artifact (ADR-0039 Decision 7) — tonex's OWN
// color record, the one the skill projects FROM, distinct from the foreign
// projection sinks (design-md.ts, json.ts) which reshape this same theme INTO a
// competitor's vocabulary. Decision 7 makes it recipe-canonical and value-
// disposable: a header that re-derives the values + a flat per-role value map,
// both modes. So it diverges from the foreign sinks on three axes by design:
//   - header = the full recipe (seed + variant + contrast + surface + the file's
//     own encoding) → the values are reproducible from the header ALONE, so the
//     file may be regenerated or discarded freely (the Decision-7 consequence).
//   - complete roster by default — core + extended (MD_TOKEN_NAMES), never the
//     lean core-only the paste-targets default to: a lossy canonical would force
//     downstream re-derivation when the skill projects an extended role.
//   - both modes, mode-major, kebab role keys (`--color-` stripped) so a
//     design.md `colors:` projection is a pure key pass-through.
// Same sink rules as siblings: ADR-0017 (reshape what deriveTheme returned, never
// recompute), ADR-0021 c.1 (argb → one encoding at the seam, selected by
// colorFormat). Reads `source` for the recipe header (selectSeedHex / variant /
// contrast / surface have no home in the derived bundle) and `bundle.default` for
// the values — contrast tiers are out of scope here, this is the user's baseline.

// why: the recipe header — every derivation knob the CLI exposes (source.ts:
// seed / variant / contrast / tint|desaturate), plus `format` so the file self-
// declares which encoding its values carry. Completeness is the contract: the
// header alone must re-derive the values (Decision 7). `contrast` and
// `surface.level` are read from the light mode because the CLI applies both
// uniformly across modes (source.ts `uniform`) — the only producer in v1; a
// future per-mode producer would widen these to a {light,dark} pair.
export interface ColorsJson {
  seed: string
  variant: string
  contrast: number
  surface: { algo: SurfaceAlgo; level: number }
  format: ColorFormat
  light: Record<string, string>
  dark: Record<string, string>
}

// why: kebab role key — strip the `--color-` CSS-var prefix and keep the role
// name verbatim (`--color-on-surface-variant` → `on-surface-variant`). The same
// transform design-md.ts uses, so projecting this file into a design.md `colors:`
// block is a key-for-key pass-through, no rename.
function roleKey(tokenName: string): string {
  return tokenName.replace(/^--color-/, '')
}

// why: the single encoding at the stringify seam (ADR-0021 c.1). hex is the
// lowercase CSS-canonical form (not MTB's uppercase — this is our format, not a
// competitor's); oklch is already canonical.
function projectColor(argb: number, fmt: ColorFormat): string {
  return fmt === 'hex' ? hexString(argb) : oklchString(argb)
}

// why: the flat role→value map for one mode — merge core + extended (they
// partition MD_TOKEN_NAMES disjointly) into one lookup and iterate the explicit
// roster so key order is canonical and a missing token is visibly skipped, never
// silently defaulted. Roster-only (no custom slugs, no chart): every emitted key
// is a role the header recipe re-derives.
function buildMode(theme: DerivedTheme, mode: Mode, fmt: ColorFormat): Record<string, string> {
  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  const lookup: TokenMap = { ...core, ...extended }
  const out: Record<string, string> = {}
  for (const name of MD_TOKEN_NAMES) {
    const argb = lookup[name]
    if (argb === undefined) continue
    out[roleKey(name)] = projectColor(argb, fmt)
  }
  return out
}

// why: the active algo's level. surfaceAlgo is single-valued, so the recipe
// records only the level in force — the other algo's stored level is inert and
// would mislead a re-derivation if emitted.
function surfaceLevel(source: PortableTheme): number {
  return source.surfaceAlgo === 'tint'
    ? source.surfaceTintLevel.light
    : source.surfaceDesaturateLevel.light
}

export function buildColorsJson(
  source: PortableTheme,
  bundle: ContrastBundle,
  options: ExportOptions = {},
): ColorsJson {
  const fmt: ColorFormat = options.colorFormat ?? 'oklch'
  const theme = bundle.default
  return {
    seed: selectSeedHex(source),
    variant: source.variant,
    contrast: source.contrastLevel.light,
    surface: { algo: source.surfaceAlgo, level: surfaceLevel(source) },
    format: fmt,
    light: buildMode(theme, 'light', fmt),
    dark: buildMode(theme, 'dark', fmt),
  }
}

// why: thin serializer over the builder (ADR-0008 — adding a format stays a pure
// formatting task). Two-space indent + trailing newline is the prevailing JSON
// convention and what a hand-editor expects; the builder holds all the shape.
export function exportColorsJson(
  source: PortableTheme,
  bundle: ContrastBundle,
  options: ExportOptions = {},
): string {
  return `${JSON.stringify(buildColorsJson(source, bundle, options), null, 2)}\n`
}
