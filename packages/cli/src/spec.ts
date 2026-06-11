// why: the tonex command surface AS DATA. These `FlagSpec` lists are the single
// source the parser validates against AND `describe` serializes — add a flag here
// and it is enforced, introspectable, and self-documented from one place. This is
// the borrow from `@google/design.md`, whose one `RuleDescriptor` registry feeds
// both its runner and its `spec` command; tonex's analogue exposes the WHOLE
// surface (flags + the contrast verdict policy) so an agent learns what blocks vs.
// warns BEFORE running, with zero dependency on the skill doc.
import { COLOR_FORMATS, type ColorFormat, MODES, type Mode } from '@tonex/core'
import { type Level, levelThreshold } from '@tonex/core/audit'
import { DEFAULT_VARIANT, variants } from '@tonex/core/variants'
import type { FlagSpec } from './args'

// why: the output TARGET — which document `generate` prints. `shadcn` is the
// paste-ready :root/.dark block (oklch, both modes); `yaml` is the single-mode
// design.md `colors:` block (hex); `json` is the Material Theme JSON reshape (a
// www-shaped export reused as-is for this phase). Named by DESTINATION, never by
// encoding.
export const TARGETS = ['shadcn', 'yaml', 'json'] as const
export type Target = (typeof TARGETS)[number]

const seed: FlagSpec = {
  name: '--seed',
  type: 'hex',
  required: true,
  description: 'seed hex color, 6-digit (e.g. #3b82f6)',
}
const variant: FlagSpec = {
  name: '--variant',
  type: 'enum',
  values: Object.keys(variants),
  description: `color scheme (default ${DEFAULT_VARIANT})`,
}
const to: FlagSpec = {
  name: '--to',
  type: 'enum',
  values: TARGETS,
  description:
    'output target: shadcn :root/.dark block, design.md colors: block (yaml), or Material Theme JSON (default shadcn)',
}
const mode: FlagSpec = {
  name: '--mode',
  type: 'enum',
  values: MODES,
  description: 'which mode yaml emits (default light); shadcn co-emits both and ignores it',
}
// why: check's `--mode` is the SAME axis as generate's but scopes the AUDIT rather
// than the emitted block — narrows the verdict to one mode so a single-mode yaml
// artifact is gated at its own granularity. Absent = both modes (the stricter
// union). Separate spec so `describe` documents the check-side meaning.
const checkMode: FlagSpec = {
  name: '--mode',
  type: 'enum',
  values: MODES,
  description: 'scope the audit to one mode (default both, the stricter union)',
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
  description: 'color encoding for shadcn/json output: oklch (default) or hex; yaml is always hex',
}
const contrast: FlagSpec = {
  name: '--contrast',
  type: 'unit',
  description: 'MCU palette contrast level 0..1 (default 0) — the palette-layer AAA remedy',
}
const tint: FlagSpec = {
  name: '--tint',
  type: 'unit',
  description: 'surface tint strength 0..1; 0 = max neutral (exclusive with --desaturate)',
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
  description: 'JSON array of [fg, bg] hex pairs to batch-verify',
}
const findContrast: FlagSpec = {
  name: '--find-contrast',
  type: 'boolean',
  description:
    'with --seed: report the minimum --contrast level that clears the target level, in one call (no manual search)',
}

export const GENERATE_FLAGS = [seed, variant, to, mode, format, contrast, tint, desaturate] as const

// why: `check` is overloaded across three forms (--seed / <fg> <bg> / --pairs); the
// parser validates against the UNION so a typo'd flag is still caught, while each
// form reads only the flags it honors. The `forms` strings in `describe` carry the
// per-form shape (e.g. --seed is required only for the whole-theme form).
export const CHECK_FLAGS = [
  seed,
  variant,
  contrast,
  checkMode,
  tint,
  desaturate,
  aaa,
  large,
  json,
  pairs,
  findContrast,
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
          'Derive a theme from a seed hex and print it (shadcn :root/.dark, or a design.md colors: block).',
        flags: GENERATE_FLAGS.map(flagInfo),
      },
      check: {
        summary: 'Audit WCAG contrast. Exit 0 clears the level; exit 1 means a text pair fails.',
        forms: [
          'check --seed <hex> [--variant] [--contrast] [--mode] [--aaa] [--json]  — gate the derived theme (both modes unless --mode)',
          'check --seed <hex> [--variant] [--mode] [--aaa] --find-contrast [--json] — min --contrast that clears the level',
          'check <fg> <bg> [--aaa] [--large] [--json]                    — one ad-hoc fg/bg pairing',
          'check --pairs <json> [--aaa] [--large] [--json]               — batch of [fg,bg] pairs',
        ],
        flags: CHECK_FLAGS.map(flagInfo),
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
    variants: Object.keys(variants),
    targets: [...TARGETS],
  }
}

function flagInfo(s: FlagSpec) {
  return {
    name: s.name,
    type: s.type,
    ...(s.required ? { required: true } : {}),
    ...(s.values ? { values: [...s.values] } : {}),
    description: s.description,
  }
}
