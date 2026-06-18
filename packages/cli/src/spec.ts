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
  description: 'MCU palette contrast level 0..1 — the palette-layer AAA remedy',
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
  description: 'surface tint strength 0..1; 0 = max neutral (exclusive with --desaturate)',
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
  description: 'surface desaturate strength 0..1; 0 = no-op (exclusive with --tint)',
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
  tint,
  tintPalette,
  desaturate,
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
  checkMode,
  tint,
  tintPalette,
  desaturate,
  aaa,
  large,
  format,
  json,
  pairs,
  findContrast,
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
  tint,
  tintPalette,
  desaturate,
  shifts,
  format,
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
