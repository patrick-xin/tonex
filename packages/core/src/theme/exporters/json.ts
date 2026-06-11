import { MD_CHART_TOKEN_NAMES } from '../../chart/schema'
import type { DerivedTheme, TokenMap } from '../derive'
import { hexFromHct } from '../hct'
import { MODES, type Mode } from '../mode'
import { hexString, oklchString } from '../oklch'
import {
  MD_CORE_TOKEN_NAMES,
  MD_PALETTE_FAMILY_NAMES,
  MD_PALETTE_TONE_NAMES,
  MD_TOKEN_NAMES,
  type PortableTheme,
} from '../schema'
import type { ColorFormat, ContrastBundle, ExportOptions } from './bundle'

// why: paste-ready JSON shaped like Material Theme Builder's export, populated
// with tonex's own derived tokens (ADR-0029 — match the target's shape, ship
// our roster, never fabricate a token to fill a competitor's slot). A tool that
// consumes an MTB export consumes ours, and an operator reads ours the way they
// expect. Where our roster is wider — six palettes incl. `error`, the per-family
// `*-dim` / fixed / inverse tokens, the chart family (ADR-0027) — the extra keys
// appear in their natural slot; where MTB carries deprecated tokens we dropped
// (`background`, `onBackground`, `surfaceVariant`) they are simply absent.
// Divergence is visible by construction, never hidden behind fabricated values.
// The "MTB has no slot for chart" reasoning that once dropped it (issue #89)
// applied equally to `error` and the extended tokens — which we emit — so chart
// is no exception: per-mode chart colors have a natural home inside each scheme.
//
// Sibling to css.ts and bound by the same rules: ADR-0017 — this is a sink, it
// reshapes / re-encodes what deriveTheme returned and never recomputes a color
// or infers a role mapping; ADR-0021 c.1 — argb is canonical inside
// DerivedTheme and projection to oklch / hex happens here at the seam. Two
// deliberate differences from css.ts: (1) it returns a plain OBJECT, not a
// string — JSON nesting makes the object the honest, assertable shape and
// exportJson is the thin serializer; (2) it also reads `source` because MTB's
// `seed`, `coreColors`, and `description` provenance have no home in the
// derived bundle.

// why: one custom-color entry as MTB lists it under `extendedColors`. Maps
// 1:1 from tonex's CustomColorEntry: hex → color, blend → harmonized (MTB's
// "harmonize" IS our blend-toward-seed flag), description defaults to ''. Key
// order matches MTB's sample (name, color, description, harmonized).
export interface MaterialExtendedColor {
  name: string
  color: string
  description: string
  harmonized: boolean
}

// why: MTB's top-level shape. `schemes` keys by tier (light / dark plus contrast
// tiers when present); each scheme maps a camelCase token key to an encoded
// color. `palettes` is the optional trailing block (palette toggle).
export interface MaterialThemeJson {
  description: string
  seed: string
  coreColors: { primary: string }
  // why: MTB lists the user's custom colors here as definition entries (source
  // color + harmonize flag), distinct from the derived per-mode tokens those
  // colors emit — which ride in `core` and surface inside each scheme (#85,
  // derive.ts). Empty when the source has no custom colors.
  extendedColors: MaterialExtendedColor[]
  schemes: Record<string, Record<string, string>>
  palettes?: Record<string, Record<string, string>>
}

interface ResolvedOptions {
  colorFormat: ColorFormat
  includeExtended: boolean
  includeChart: boolean
  includePalette: boolean
}

// why: mirrors css.ts's resolveOptions — lean defaults per ADR-0021 c.6 (oklch,
// core tokens, no chart, no palette). includeHeader is dropped (no MTB home —
// it's the shadcn bootstrap incantation) and contrast tiers arrive already
// resolved inside the bundle, so there is no includeContrastVariants knob here.
// includeChart IS honored (issue #89): chart is part of our wider roster, and
// ADR-0029 puts wider-roster tokens in their natural slot — same rule as the
// extended tokens and `error` family MTB also lacks.
function resolveOptions(options: ExportOptions): ResolvedOptions {
  return {
    colorFormat: options.colorFormat ?? 'oklch',
    includeExtended: options.includeExtended ?? false,
    includeChart: options.includeChart ?? false,
    includePalette: options.includePalette ?? false,
  }
}

// why: colorspace projection at the seam (ADR-0021 c.1), as in css.ts. One
// difference from the CSS sink: MTB writes hex UPPERCASE six-digit (#RRGGBB)
// while hexString emits the lowercase CSS-canonical form — so uppercase the hex
// branch only (oklch is already canonical). #85 / ADR-0029 "value encoding".
function projectColor(argb: number, fmt: ColorFormat): string {
  return fmt === 'hex' ? hexString(argb).toUpperCase() : oklchString(argb)
}

// why: MTB scheme keys are camelCase; our tokens are kebab CSS vars. Strip the
// `--color-` prefix and camelCase the rest:
// `--color-on-primary-fixed-variant` → `onPrimaryFixedVariant`. The Red test
// (#85) pins this transform independently so it stays asserted rather than
// asserted-against-itself — the two definitions must move together.
function toSchemeKey(tokenName: string): string {
  const body = tokenName.replace(/^--color-/, '')
  const [head, ...rest] = body.split('-')
  return head + rest.map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1)).join('')
}

type ContrastTier = 'default' | 'medium' | 'high'

// why: enumerate the tiers the bundle carries, in canonical order — mirrors
// css.ts's tiersOf. `default` is always present; medium / high appear only when
// the user requested contrast variants (buildContrastBundle gates them).
function tiersOf(bundle: ContrastBundle): Array<[ContrastTier, DerivedTheme]> {
  const out: Array<[ContrastTier, DerivedTheme]> = [['default', bundle.default]]
  if (bundle.medium !== undefined) out.push(['medium', bundle.medium])
  if (bundle.high !== undefined) out.push(['high', bundle.high])
  return out
}

// why: one scheme is the roster's tokens for a single (tier, mode), camelCased
// and encoded. core + extended partition MD_TOKEN_NAMES disjointly; merge them
// into one lookup and iterate the explicit roster. Iterating the roster (not
// mergeMdEmission) deliberately excludes custom-color slugs that ride in `core`
// — MTB carries custom colors in extendedColors, never inside schemes.
function buildScheme(
  theme: DerivedTheme,
  mode: Mode,
  roster: readonly string[],
  fmt: ColorFormat,
  includeChart: boolean,
): Record<string, string> {
  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  const lookup: TokenMap = { ...core, ...extended }
  const out: Record<string, string> = {}
  for (const name of roster) {
    const argb = lookup[name]
    if (argb === undefined) continue
    out[toSchemeKey(name)] = projectColor(argb, fmt)
  }
  // why: chart trails the roster, mirroring css.ts's `Object.assign(merged,
  // chart)` after core+extended. Iterate the explicit MD_CHART_TOKEN_NAMES
  // (not the merged lookup) — chart is its own mode-aware family on md, never
  // part of MD_TOKEN_NAMES (issue #89, ADR-0027 / ADR-0029).
  if (includeChart) {
    const chart = mode === 'light' ? theme.md.lightChart : theme.md.darkChart
    for (const name of MD_CHART_TOKEN_NAMES) {
      const argb = chart[name]
      if (argb === undefined) continue
      out[toSchemeKey(name)] = projectColor(argb, fmt)
    }
  }
  return out
}

// why: MTB orders schemes mode-major then tier-minor — light,
// light-medium-contrast, light-high-contrast, dark, dark-medium-contrast,
// dark-high-contrast — so loop modes outermost and tiers within. Object
// insertion order is the emitted key order.
function buildSchemes(
  bundle: ContrastBundle,
  roster: readonly string[],
  fmt: ColorFormat,
  includeChart: boolean,
): Record<string, Record<string, string>> {
  const tiers = tiersOf(bundle)
  const schemes: Record<string, Record<string, string>> = {}
  for (const mode of MODES) {
    for (const [tier, theme] of tiers) {
      const key = tier === 'default' ? mode : `${mode}-${tier}-contrast`
      schemes[key] = buildScheme(theme, mode, roster, fmt, includeChart)
    }
  }
  return schemes
}

// why: six MCU families × eighteen tones from the mode/contrast-invariant
// derived palette (deriveTheme pulls it from the light scheme). Tone keys are
// strings to match MTB ("0".."100"). Family order is MD_PALETTE_FAMILY_NAMES,
// which includes `error` — MTB ships five families, we ship six (ADR-0029).
function buildPalettes(
  theme: DerivedTheme,
  fmt: ColorFormat,
): Record<string, Record<string, string>> {
  const palettes: Record<string, Record<string, string>> = {}
  for (const family of MD_PALETTE_FAMILY_NAMES) {
    const tones: Record<string, string> = {}
    for (const tone of MD_PALETTE_TONE_NAMES) {
      const argb = theme.md.palette[`--color-${family}-${tone}`]
      if (argb === undefined) continue
      tones[String(tone)] = projectColor(argb, fmt)
    }
    palettes[family] = tones
  }
  return palettes
}

// why: the user's custom colors as MTB definition entries, in store order.
// `color` is always the entry's source hex (uppercased to MTB's #RRGGBB
// convention, like the seed) — never colorFormat-projected, since this is an
// input color, not a derived token. ADR-0017: pure re-encoding of the source,
// no recompute. The derived md tokens these entries emit live in `schemes`.
function buildExtendedColors(source: PortableTheme): MaterialExtendedColor[] {
  return source.customColors.map((entry) => ({
    name: entry.name,
    color: entry.hex.toUpperCase(),
    description: entry.description ?? '',
    harmonized: entry.blend,
  }))
}

// why: the seed color — the exact bytes the user pasted (seed.exactHex) or the
// canonical projection of the HCT triplet once they have moved an axis. This is
// selectSeedHex's rule (source.ts), inlined here so the exporter stays a pure
// sink (ADR-0017) and never imports the source store. Uppercased to MTB's
// six-digit #RRGGBB convention.
function seedHex(source: PortableTheme): string {
  return (source.seed.exactHex ?? hexFromHct(source.seed)).toUpperCase()
}

// why: provenance trail. `TYPE: CUSTOM` is MTB's marker for a hand-seeded theme;
// the tonex stamp that follows lets an operator read back where and when a file
// came from. Format pinned by the Red test (#85). Date is UTC yyyy-mm-dd
// (sortable, locale-free), captured at build time.
function provenance(source: PortableTheme, seed: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `TYPE: CUSTOM\nTonex export ${date} · seed ${seed} · variant ${source.variant}`
}

export function buildMaterialThemeJson(
  source: PortableTheme,
  bundle: ContrastBundle,
  options: ExportOptions = {},
): MaterialThemeJson {
  const opts = resolveOptions(options)
  const roster = opts.includeExtended ? MD_TOKEN_NAMES : MD_CORE_TOKEN_NAMES
  const seed = seedHex(source)

  const json: MaterialThemeJson = {
    description: provenance(source, seed),
    seed,
    coreColors: { primary: seed },
    extendedColors: buildExtendedColors(source),
    schemes: buildSchemes(bundle, roster, opts.colorFormat, opts.includeChart),
  }
  // why: palettes is the trailing key, present only when toggled. Assigned after
  // schemes (object insertion order = key order, which the Red test asserts) and
  // omitted entirely — not set to undefined — when off.
  if (opts.includePalette) json.palettes = buildPalettes(bundle.default, opts.colorFormat)
  return json
}

// why: thin serializer over the builder (ADR-0008 — adding a format stays a pure
// formatting task). Four-space indent + trailing newline reads cleanly and diffs
// well; the object-builder holds all the shape knowledge, so this wrapper is
// intentionally trivial.
export function exportJson(
  source: PortableTheme,
  bundle: ContrastBundle,
  options: ExportOptions = {},
): string {
  return `${JSON.stringify(buildMaterialThemeJson(source, bundle, options), null, 4)}\n`
}
