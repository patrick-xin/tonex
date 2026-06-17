import type { DerivedTheme, TokenMap } from '../derive'
import type { Mode } from '../mode'
import { hexString, oklchString } from '../oklch'
import {
  MD_CORE_TOKEN_NAMES,
  MD_TOKEN_NAMES,
  type PortableTheme,
  type SurfaceAlgo,
} from '../schema'
import { selectSeedHex } from '../seed'
import type { ColorFormat, ContrastBundle, ExportOptions } from './bundle'

// why: the `--to colors` role rendering — tonex's full role set, both modes, that
// an agent READS while mapping roles→slots onto a target with no built-in
// projection. Per ADR-0039 Decision 7 (amendment 2026-06-17) this is a TRANSIENT
// rendering, NOT a manifest: nothing in the toolchain reads it back, so it is
// never committed or treated as a source of truth. The durable artifact is the
// recipe embedded in each DELIVERED file (the foreign sinks below carry it via
// ExportOptions.provenance); this rendering instead carries a structured header
// that re-derives its own values, so it may be regenerated or discarded freely.
// It still diverges from the foreign projection sinks (design-md.ts, json.ts,
// which reshape this same theme INTO a competitor's vocabulary) on three axes:
//   - header = the derivation knobs (seed + variant + contrast + surface + the
//     file's own encoding) → the values are reproducible from the header ALONE.
//   - core roster by default, extended opt-in via `includeExtended` (the same
//     tier knob the paste-targets honor). The roster is a CAPACITY ladder, not a
//     taxonomy: core (28) is the sufficient baseline most projects need; extended
//     (22) adds more roles when core doesn't cover the slots. The default stays
//     lean so an agent maps against the set it actually needs.
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
// partition MD_TOKEN_NAMES disjointly) into one lookup and iterate the requested
// ROSTER so key order is canonical and a missing token is visibly skipped, never
// silently defaulted. `includeExtended` selects the roster tier (core default /
// full opt-in), mirroring design-md.ts and json.ts — the merged lookup always
// holds both tiers, so the roster choice is purely which keys to emit. Roster-only
// (no custom slugs, no chart): every emitted key is a role the header re-derives.
function buildMode(
  theme: DerivedTheme,
  mode: Mode,
  fmt: ColorFormat,
  includeExtended: boolean,
): Record<string, string> {
  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  const lookup: TokenMap = { ...core, ...extended }
  const roster = includeExtended ? MD_TOKEN_NAMES : MD_CORE_TOKEN_NAMES
  const out: Record<string, string> = {}
  for (const name of roster) {
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
  const includeExtended = options.includeExtended ?? false
  const theme = bundle.default
  return {
    seed: selectSeedHex(source),
    variant: source.variant,
    contrast: source.contrastLevel.light,
    surface: { algo: source.surfaceAlgo, level: surfaceLevel(source) },
    format: fmt,
    light: buildMode(theme, 'light', fmt, includeExtended),
    dark: buildMode(theme, 'dark', fmt, includeExtended),
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
