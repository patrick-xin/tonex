// why: the tonex command surface AS DATA. These `FlagSpec` lists are the single
// source the parser validates against AND `describe` serializes — add a flag here
// and it is enforced, introspectable, and self-documented from one place. This is
// the borrow from `@google/design.md`, whose one `RuleDescriptor` registry feeds
// both its runner and its `spec` command; tonex's analogue exposes the WHOLE
// surface (flags + the contrast verdict policy) so an agent learns what blocks vs.
// warns BEFORE running, with zero dependency on the skill doc.
import { COLOR_FORMATS, type ColorFormat, MODES, type Mode } from '@tonex/core'
import { type Level, levelThreshold } from '@tonex/core/audit'
import { NEUTRAL_PALETTE_NAMES, type NeutralPaletteName } from '@tonex/core/data'
import { SHADCN_BINDING_PRESETS, type ShadcnBindingPresetName } from '@tonex/core/schema'
import { DEFAULT_VARIANT, VARIANT_GROUPS_ORDERED, variants } from '@tonex/core/variants'
import type { FlagSpec } from './args'

// why: the output TARGET — which document `generate` prints. `colors` is the
// transient role rendering an agent READS while mapping roles→slots (recipe
// header + both-mode role values, ADR-0039 Decision 7, amendment 2026-06-17 — a
// transient read, not a committed manifest); the rest are DELIVERED projections
// into a vocabulary, each carrying its runnable recipe: `shadcn` the paste-ready
// :root/.dark block (oklch, both modes), `yaml` the single-mode design.md
// `colors:` block (hex), `json` the Material Theme JSON reshape (a www-shaped
// export reused as-is for this phase). Named by DESTINATION, never by encoding.
export const TARGETS = ['colors', 'shadcn', 'yaml', 'json'] as const
export type Target = (typeof TARGETS)[number]

const seed: FlagSpec = {
  name: '--seed',
  type: 'color',
  required: true,
  description: 'seed color: a 6-digit hex (#3b82f6) or a canonical oklch(L C H) string',
}
const variant: FlagSpec = {
  name: '--variant',
  type: 'enum',
  values: Object.keys(variants),
  default: DEFAULT_VARIANT,
  description: 'color scheme',
}
// why: cmf's second source color (core's cmfSecondSourceHex). CMF is the only MCU
// variant that reads a second source — it rebuilds the TERTIARY palette from this
// color's hue+chroma and shifts the ERROR hue, leaving primary/secondary untouched.
// Same color firewall as --seed (hex or oklch). A usage error on any non-cmf variant
// (it would be a silent no-op there); gated by core's cmfSecondSourceDisabledReason.
const secondColor: FlagSpec = {
  name: '--second-color',
  type: 'color',
  description:
    'cmf only: a second source color (hex or oklch) that reshapes the tertiary palette + error hue; not the MD3 secondary role',
}
const to: FlagSpec = {
  name: '--to',
  type: 'enum',
  values: TARGETS,
  default: 'shadcn',
  description:
    'output target: colors (the role set to read while binding), shadcn :root/.dark block, design.md colors: block (yaml), or Material Theme JSON',
}
const mode: FlagSpec = {
  name: '--mode',
  type: 'enum',
  values: MODES,
  default: 'light',
  description: 'which mode yaml emits; colors/shadcn/json co-emit both and ignore it',
}
// why: check's `--mode` is the SAME axis as generate's but scopes the AUDIT rather
// than the emitted block — narrows the verdict to one mode so a single-mode yaml
// artifact is gated at its own granularity. Absent = both modes (the stricter
// union). Separate spec so `describe` documents the check-side meaning.
const checkMode: FlagSpec = {
  name: '--mode',
  type: 'enum',
  values: MODES,
  default: 'both',
  description: 'scope the audit to one mode; absent = both modes (the stricter union)',
}
// why: `apply`'s `--mode` serves BOTH its forms, so its meaning is form-dependent and
// it carries no single default — project form: which mode yaml emits (default light,
// like generate); gate form (`--check`): scope the audit to one mode (default both,
// like check). The describe `forms` strings carry the per-form shape; the flag itself
// documents the dual meaning rather than asserting one default that lies about the other.
const applyMode: FlagSpec = {
  name: '--mode',
  type: 'enum',
  values: MODES,
  description:
    'project form: which mode yaml emits (light default; other targets co-emit both and ignore it). gate form (--check): scope the audit to one mode (both default, the stricter union)',
}
// why: `apply --check` flips the reader from the projection form to the contrast GATE
// — the same whole-theme verdict as `check --seed`, run over the LOADED PortableTheme
// (its pins/overrides included). A boolean switch, mirroring how `--find-contrast`
// picks check's oracle form; absent = the default projection form.
const check: FlagSpec = {
  name: '--check',
  type: 'boolean',
  description:
    'gate the loaded theme’s WCAG contrast instead of projecting it — exit 1 if a text pair fails (the same gate as `check --seed`, honoring any pins in the file)',
}
// why: the color ENCODING for the emitted block — `oklch` (default) or `hex`.
// Values come from core's `COLOR_FORMATS` tuple (ADR-0016: a runtime tuple the
// CLI consumes lives in core, not re-inlined here), so adding a format in core
// surfaces it here for free. shadcn and json honor it; yaml (design.md) is
// always hex and ignores it.
const format: FlagSpec = {
  name: '--format',
  type: 'enum',
  values: COLOR_FORMATS,
  default: 'oklch',
  description:
    'color encoding for color values in output: oklch or hex. generate: shadcn/json/colors honor it, yaml is always hex. check/adjust: --json output honors it, text output is always hex.',
}
const contrast: FlagSpec = {
  name: '--contrast',
  type: 'unit',
  default: 0,
  description: 'MCU palette contrast level 0..1 for both modes — the palette-layer AAA remedy',
}
const contrastLight: FlagSpec = {
  name: '--contrast-light',
  type: 'unit',
  description: 'contrast level 0..1 for light mode only; overrides --contrast for light',
}
const contrastDark: FlagSpec = {
  name: '--contrast-dark',
  type: 'unit',
  description: 'contrast level 0..1 for dark mode only; overrides --contrast for dark',
}
// why: the roster TIER — a capacity ladder, not a taxonomy. Core (28 roles) is the
// sufficient baseline most projects need; --extended widens to core + extended (50)
// when core doesn't cover the target's slots (fixed/inverse/dim/scrim roles). Maps
// to core's `ExportOptions.includeExtended`; honored by colors/yaml/json, a no-op
// for shadcn (its roster is fixed by the bindings). A further rung — raw palette
// tones 0..100 — is unbuilt; this flag stays boolean until that lands.
const extended: FlagSpec = {
  name: '--extended',
  type: 'boolean',
  description:
    'widen the roster from core (28 roles, the sufficient baseline) to core + extended (50); reach for it only when core does not cover the target slots. colors/yaml/json honor it; shadcn is unaffected',
}
// why: the shadcn role→md-token routing preset. Only consumed by --to shadcn;
// ignored (with a note) for other targets. The binding is pure routing — it does
// not touch the recipe (variant/surface/contrast), so the same seed+recipe can
// be projected into different shadcn slot arrangements without re-deriving.
const binding: FlagSpec = {
  name: '--binding',
  type: 'enum',
  values: Object.keys(SHADCN_BINDING_PRESETS),
  default: 'default',
  description: 'shadcn role→md-token routing preset (only consumed by --to shadcn)',
}
// why: re-asserts the soft edge token onto the three shadcn edge roles in both
// modes, layered ON TOP of whatever --binding/default map is in play (core's
// withSoftEdges, ADR-0035). Consumed identically to --binding — only by --to
// shadcn, noted-and-ignored for other targets — so the two stay consistent.
const softBorders: FlagSpec = {
  name: '--soft-borders',
  type: 'boolean',
  description:
    'soften the shadcn edge roles (--border/--input/--sidebar-border) to the outline-variant tone for faint, shadcn-style borders (only consumed by --to shadcn)',
}
const tint: FlagSpec = {
  name: '--tint',
  type: 'unit',
  description:
    'surface tint strength 0..1 for both modes; 0 = max neutral (exclusive with --desaturate)',
}
const tintLight: FlagSpec = {
  name: '--tint-light',
  type: 'unit',
  description:
    'surface tint strength 0..1 for light mode only; overrides --tint for light (exclusive with --desaturate)',
}
const tintDark: FlagSpec = {
  name: '--tint-dark',
  type: 'unit',
  description:
    'surface tint strength 0..1 for dark mode only; overrides --tint for dark (exclusive with --desaturate)',
}
const tintPalette: FlagSpec = {
  name: '--tint-palette',
  type: 'enum',
  values: NEUTRAL_PALETTE_NAMES,
  default: 'zinc',
  description:
    'neutral palette the tint algo repaints surfaces with (only consumed when --tint is set)',
}
const desaturate: FlagSpec = {
  name: '--desaturate',
  type: 'unit',
  description: 'surface desaturate strength 0..1 for both modes; 0 = no-op (exclusive with --tint)',
}
const desaturateLight: FlagSpec = {
  name: '--desaturate-light',
  type: 'unit',
  description:
    'surface desaturate strength 0..1 for light mode only; overrides --desaturate for light (exclusive with --tint)',
}
const desaturateDark: FlagSpec = {
  name: '--desaturate-dark',
  type: 'unit',
  description:
    'surface desaturate strength 0..1 for dark mode only; overrides --desaturate for dark (exclusive with --tint)',
}
// why: surfaceTintTextLevel was previously unreachable from the CLI (issue #218). It
// applies a brand-accent tint to on-surface/on-surface-variant text, decoupled from
// surfaceTintLevel so "neutral surfaces + brand text" is achievable with any surface algo.
const tintText: FlagSpec = {
  name: '--tint-text',
  type: 'unit',
  description:
    'brand-accent tint strength 0..1 on on-surface/on-surface-variant text for both modes; decoupled from --tint',
}
const tintTextLight: FlagSpec = {
  name: '--tint-text-light',
  type: 'unit',
  description:
    'brand-accent text tint strength 0..1 for light mode only; overrides --tint-text for light',
}
const tintTextDark: FlagSpec = {
  name: '--tint-text-dark',
  type: 'unit',
  description:
    'brand-accent text tint strength 0..1 for dark mode only; overrides --tint-text for dark',
}
// why: the user color(s) added ON TOP of the seed-derived palette. Agent-first
// JSON batch (the --pairs/--shifts precedent), each entry {name, hex, blend?,
// shadcnSource?}: MCU harmonizes the hex toward the seed (blend, default true)
// and emits a contrast-GUARANTEED 4-role md group (--color-{slug} + on/container)
// plus a shadcn pair (--{slug}/--{slug}-foreground; shadcnSource picks which md
// pair feeds it, default 'color'). hex takes the --seed contract (hex or oklch).
// Validation is core's (validateCustomColorEntry: reserved-name / slug-collision
// / hex) — surfaced, never reimplemented. Carried in EVERY output (the shadcn pair,
// plus the derived roles in yaml/json/colors) and gated by `check`; --to colors and
// --to json also carry the definitions (colors' `custom` block / json's
// extendedColors), the re-derivation input that keeps both self-describing.
const custom: FlagSpec = {
  name: '--custom',
  type: 'json',
  description:
    'JSON array of {name, hex, blend?, shadcnSource?} custom-color entries added on top of the seed palette — each emits a harmonized 4-role md group + a shadcn pair (--{slug}/--{slug}-foreground), contrast-gated by check. blend defaults true (harmonize toward seed); shadcnSource picks which md pair the single shadcn slot binds — "color" (default) = the vivid fill (like --primary), "container" = the muted background tone (only affects --to shadcn); hex is a 6-digit hex or oklch. In every output: the shadcn pair, and the derived roles in yaml/json/colors (colors also lists the definitions in a "custom" block).',
}
// why: core derives 5 chart tokens/mode (theme.md.lightChart/darkChart) on every
// run but the exporters emit them only behind ExportOptions.includeChart, which the
// CLI never set — so a tonex shadcn block shipped WITHOUT the --chart-1..5 every real
// shadcn theme has (issue #201, Gap 2). This flag flips includeChart; the chart axis
// (scheme/hueSpread/hueAnchor) stays at its derived default for now. Emission-only —
// chart tokens are non-text, so they carry no contrast gate. shadcn/yaml/json honor it.
const withChart: FlagSpec = {
  name: '--with-chart',
  type: 'boolean',
  description:
    'emit the data-viz chart tokens (--chart-1..5) every real shadcn theme carries, derived from the primary palette; honored by shadcn/yaml/json',
}
// why: the seed/brand pair (--brand/--brand-foreground, ADR-0032) — the literal seed
// bytes plus an AA-safe foreground — is derived on every run but emitted only behind
// ExportOptions.includeBrand, unreachable from the CLI (issue #201, Gap 3). This flag
// flips it for generate (emission) AND for check, where the brand text pair joins the
// gate so an unsafe seed/brand pairing blocks like any other failing text pair.
const withBrand: FlagSpec = {
  name: '--with-brand',
  type: 'boolean',
  description:
    'emit the seed/brand pair (--brand/--brand-foreground, the literal seed + its AA-safe foreground); generate emits it (shadcn/yaml/json), check gates its text pair',
}
const aaa: FlagSpec = {
  name: '--aaa',
  type: 'boolean',
  description: 'raise the WCAG bar to AAA (default AA)',
}
const large: FlagSpec = {
  name: '--large',
  type: 'boolean',
  description: 'use large-text thresholds',
}
const json: FlagSpec = {
  name: '--json',
  type: 'boolean',
  description: 'emit machine-readable JSON',
}
const pairs: FlagSpec = {
  name: '--pairs',
  type: 'json',
  description:
    'JSON array of [fg, bg] pairs to batch-verify; theme-free pairs are hex or canonical oklch(L C H), or token names with --seed (resolved against the derived theme)',
}
const findContrast: FlagSpec = {
  name: '--find-contrast',
  type: 'boolean',
  description:
    'with --seed: report the minimum --contrast level that clears the target level, in one call (no manual search)',
}
// why: the GENERATOR form — given one literal fill (a brand swatch, a tool's
// hardcoded hex), derive its AA-safe foreground via core's deriveForeground rather
// than verify a pairing. A flag (not a 1-positional overload) so the form is loud:
// the 2-positional path VERIFIES, this one GENERATES. Same color contract as --seed
// (hex or oklch). HONEST about the luminance crossover — a mid-tone fill that no
// foreground can lift to the threshold returns the max-contrast pick and GATEs.
const foreground: FlagSpec = {
  name: '--foreground',
  type: 'color',
  description:
    'derive the AA-safe foreground for one literal fill (hex or oklch) — prints the on-color + achieved ratio + verdict; --aaa/--large set the target ratio. Exit 0 clears it, 1 if no foreground can reach the ratio (a mid-tone fill against a raised --aaa bar) — the max-contrast pick is still returned',
}
// why: `adjust`'s only command-specific flag — a JSON batch of shift requests,
// mirroring core's `adjustTokens` shape and the existing `--pairs` precedent. The
// per-request mode lives INSIDE each entry, so `adjust` needs no `--mode` flag (the
// theme is mode-agnostic; both modes are derived). Token-domain validity is core's
// gate; the CLI only shape-checks the entries (ADR-0039 c.1 — agent-first JSON).
const shifts: FlagSpec = {
  name: '--shifts',
  type: 'json',
  description:
    'JSON array of {mode, token, dTone?, dChroma?} ±HCT shift requests (at least one axis per entry)',
}

export const GENERATE_FLAGS = [
  seed,
  variant,
  secondColor,
  to,
  binding,
  softBorders,
  mode,
  format,
  extended,
  contrast,
  contrastLight,
  contrastDark,
  tint,
  tintLight,
  tintDark,
  tintPalette,
  desaturate,
  desaturateLight,
  desaturateDark,
  tintText,
  tintTextLight,
  tintTextDark,
  custom,
  withChart,
  withBrand,
] as const

// why: `check` is overloaded across three forms (--seed / <fg> <bg> / --pairs); the
// parser validates against the UNION so a typo'd flag is still caught, while each
// form reads only the flags it honors. The `forms` strings in `describe` carry the
// per-form shape (e.g. --seed is required only for the whole-theme form).
export const CHECK_FLAGS = [
  seed,
  variant,
  secondColor,
  contrast,
  contrastLight,
  contrastDark,
  checkMode,
  tint,
  tintLight,
  tintDark,
  tintPalette,
  desaturate,
  desaturateLight,
  desaturateDark,
  tintText,
  tintTextLight,
  tintTextDark,
  custom,
  withBrand,
  aaa,
  large,
  format,
  json,
  pairs,
  findContrast,
  foreground,
] as const

// why: `adjust` reuses the shared seed→theme knobs (parseSource reads them) plus its
// own `--shifts` batch and `--json`. No `--mode` (per-request mode is inside each
// shift entry). Feeding this tuple to parseArgs makes a typo'd adjust flag a loud
// did-you-mean usage error for free.
export const ADJUST_FLAGS = [
  seed,
  variant,
  secondColor,
  contrast,
  contrastLight,
  contrastDark,
  tint,
  tintLight,
  tintDark,
  tintPalette,
  desaturate,
  desaturateLight,
  desaturateDark,
  tintText,
  tintTextLight,
  tintTextDark,
  shifts,
  format,
  json,
] as const

// why: `serialize` is the WRITER — it consumes ONLY the derivation-source knobs (the
// exact set `parseSource` reads, so it inherits #218's per-mode flags automatically)
// and emits the resulting PortableTheme. No projection knobs (`--to`/`--binding`/…):
// those choose how a theme is consumed (`apply`'s seam), not what it IS. A projection
// flag here is therefore an unknown flag → a loud did-you-mean usage error.
export const SERIALIZE_FLAGS = [
  seed,
  variant,
  secondColor,
  contrast,
  contrastLight,
  contrastDark,
  tint,
  tintLight,
  tintDark,
  tintPalette,
  desaturate,
  desaturateLight,
  desaturateDark,
  tintText,
  tintTextLight,
  tintTextDark,
  custom,
] as const

// why: `apply` is the READER — it takes NO derivation knobs (the theme is loaded, not
// derived) and instead the projection surface (`--to`/`--binding`/`--soft-borders`/
// `--format`/`--extended`/`--mode`, shared with generate) plus the `--check` gate
// switch and its verdict flags (`--aaa`/`--large`/`--json`). The parser validates
// against this union so a flag valid only for the other form is still parsed; each
// form reads only what it honors (the same overloaded-union pattern as CHECK_FLAGS).
export const APPLY_FLAGS = [
  to,
  binding,
  softBorders,
  extended,
  withChart,
  withBrand,
  format,
  applyMode,
  check,
  aaa,
  large,
  json,
] as const

// why: the membership guards that validate a raw flag string against its enum
// tuple — grouped with the tuples they check (sibling to the FlagSpec `values`).
// The command handlers call these so an out-of-set value is a loud usage error,
// not a silent default; `isMode` is shared by both commands (generate's emitted
// block, check's audit scope), so it lives here once rather than in either.
export function isTarget(value: string): value is Target {
  return (TARGETS as readonly string[]).includes(value)
}

export function isMode(value: string): value is Mode {
  return (MODES as readonly string[]).includes(value)
}

export function isColorFormat(value: string): value is ColorFormat {
  return (COLOR_FORMATS as readonly string[]).includes(value)
}

export function isTintPalette(value: string): value is NeutralPaletteName {
  return (NEUTRAL_PALETTE_NAMES as readonly string[]).includes(value)
}

export function isBinding(value: string): value is ShadcnBindingPresetName {
  return Object.hasOwn(SHADCN_BINDING_PRESETS, value)
}

// why: the machine-readable surface — commands+flags (from the same specs the
// parser uses), the exit-code taxonomy, and the contrast verdict policy/thresholds
// (sourced from `levelThreshold`, never re-listed). One `tonex describe` call and
// an agent knows the whole contract, including which findings block the exit code.
export function describePayload() {
  return {
    tool: 'tonex',
    exitCodes: {
      '0': 'clean — gate passed (or output produced)',
      '1': 'contrast gate failure — the artifact is wrong; apply a color remedy (raise --contrast / re-pair tokens)',
      '2': 'usage or input error — the call is wrong; fix the flags or inputs',
    },
    commands: {
      generate: {
        summary:
          'Derive a theme from a seed hex and print it for one --to target: colors (the role set to read while binding roles→slots), the shadcn :root/.dark block, a design.md colors: block, or Material Theme JSON. Each delivered target (shadcn/yaml/json) embeds its runnable recipe so the theme is reproducible.',
        flags: GENERATE_FLAGS.map(flagInfo),
      },
      check: {
        summary: 'Audit WCAG contrast. Exit 0 clears the level; exit 1 means a text pair fails.',
        forms: [
          'check --seed <hex> [--variant] [--contrast] [--mode] [--aaa] [--json]  — gate the derived theme (both modes unless --mode)',
          'check --seed <hex> [--variant] [--mode] [--aaa] --find-contrast [--json] — min --contrast that clears the level',
          'check <fg> <bg> [--aaa] [--large] [--json]                    — one ad-hoc fg/bg pairing, hex or oklch (theme-free)',
          'check --foreground <fill> [--aaa] [--large] [--json]          — derive the AA-safe foreground for one literal fill, hex or oklch (theme-free); exit 1 if no foreground can reach the level',
          'check --pairs <json> [--aaa] [--large] [--json]               — batch of [fg,bg] pairs, hex or oklch (theme-free)',
          'check --seed <hex> --pairs <json> [--variant] [--mode] [--aaa] [--json] — batch of [fg,bg] TOKEN-NAME pairs against the derived theme',
        ],
        flags: CHECK_FLAGS.map(flagInfo),
      },
      adjust: {
        summary:
          'Shift named md tokens by a relative ±HCT delta (tone+chroma) and print before/after facts plus the gamut-clamped achieved delta. Exits 0 (clean) or 2 (bad call); never gates contrast — run `check` for that.',
        flags: ADJUST_FLAGS.map(flagInfo),
      },
      serialize: {
        summary:
          'Freeze a derived theme into the canonical by-value colors.json (a SCHEMA_VERSION-stamped PortableTheme) and print it to stdout. Takes the same derivation source as generate (--seed + variant/contrast/surface/custom); no projection knobs — `apply` chooses how the theme is consumed. Pipes into `apply`.',
        flags: SERIALIZE_FLAGS.map(flagInfo),
      },
      apply: {
        summary:
          'Load a serialized colors.json (file path, or stdin via `-`/pipe) and either project it or gate it, honoring every pin/binding/override in the file. A malformed / schema-invalid / version-mismatched artifact exits 2.',
        forms: [
          'apply [<file>|-] [--to <target>] [--binding] [--soft-borders] [--format] [--extended] [--mode] — project the loaded theme into a target (default --to shadcn), like generate',
          'apply [<file>|-] --check [--aaa] [--mode] [--json] — gate the loaded theme’s contrast, like `check --seed` (exit 1 on a text-pair failure)',
        ],
        flags: APPLY_FLAGS.map(flagInfo),
      },
      describe: {
        summary:
          'Print this machine-readable surface (commands, flags, contrast policy, exit codes).',
        flags: [],
      },
    },
    contrast: {
      policy: {
        'text-pair': 'block (moves exit code to 1)',
        'non-text': 'warn (advisory, never blocks)',
        decorative: 'exempt (not evaluated)',
      },
      levels: ['aa', 'aaa'] satisfies Level[],
      thresholds: {
        aa: { text: levelThreshold('text', 'aa'), large: levelThreshold('non-text', 'aa') },
        aaa: { text: levelThreshold('text', 'aaa'), large: levelThreshold('non-text', 'aaa') },
      },
    },
    variants: variantTaxonomy(),
    targets: [...TARGETS],
    bindings: bindingCatalog(),
  }
}

// why: the flat variant NAMES already ride on the --variant flag's `values`, so
// describe.variants instead projects what the enum can't — the engine's group
// taxonomy (group → names, groups in VARIANT_GROUPS_ORDERED, names in registry
// order). An agent picks a feel ("more vivid" → expressive) and resolves it to a
// concrete variant from one field, never guessing the look it can't see. The tag
// is owned by core (`VariantStrategy.group`); this is a pure projection of it.
function bindingCatalog(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(SHADCN_BINDING_PRESETS).map(([name, p]) => [name, p.description]),
  )
}

function variantTaxonomy(): Record<string, string[]> {
  const taxonomy: Record<string, string[]> = {}
  for (const group of VARIANT_GROUPS_ORDERED) taxonomy[group] = []
  for (const [name, strategy] of Object.entries(variants)) taxonomy[strategy.group].push(name)
  return taxonomy
}

function flagInfo(s: FlagSpec) {
  return {
    name: s.name,
    type: s.type,
    ...(s.required ? { required: true } : {}),
    ...(s.values ? { values: [...s.values] } : {}),
    // why: surface the default as its own field (omitted when there is none — `0` is
    // a real default, so guard on undefined, not falsiness) so the value omitting the
    // flag yields is parseable, not buried in `description`.
    ...(s.default !== undefined ? { default: s.default } : {}),
    description: s.description,
  }
}
