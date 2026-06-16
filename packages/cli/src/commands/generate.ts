// why: `generate` derives the theme and prints it for one output target — the
// canonical colors.json, the shadcn :root/.dark block, the single-mode design.md
// `colors:` yaml, or the Material Theme JSON. It surfaces core's knobs
// (`--to`/`--format`/`--mode`) as flags and projects core's values; it owns no
// color logic of its own.
import {
  buildContrastBundle,
  COLOR_FORMATS,
  type ExportOptions,
  exportColorsJson,
  exportCss,
  exportDesignMd,
  exportJson,
  MODES,
  type Mode,
} from '@tonex/core'
import { SHADCN_BINDING_PRESETS, withSoftEdges } from '@tonex/core/schema'
import { flagValue, hasFlag, parseArgs } from '../args'
import { type Io, OK, USAGE } from '../io'
import { parseSource } from '../source'
import {
  GENERATE_FLAGS,
  isBinding,
  isColorFormat,
  isMode,
  isTarget,
  TARGETS,
  type Target,
} from '../spec'

// why: `generate` derives the theme and prints it for one output target — the
// shadcn :root/.dark block or the single-mode design.md `colors:` yaml.
// `buildContrastBundle` routes through the derive cache and feeds the exporter.
export function generate(argv: readonly string[], io: Io): number {
  const parsed = parseArgs(argv, GENERATE_FLAGS)
  if (!parsed.ok) {
    io.err(parsed.message)
    return USAGE
  }
  const args = parsed.args

  let source = parseSource(args, io)
  if (typeof source === 'number') return source

  const bindingArg = flagValue(args, '--binding')
  if (bindingArg !== undefined) {
    if (!isBinding(bindingArg)) {
      io.err(
        `tonex: unknown binding "${bindingArg}"\n  one of: ${Object.keys(SHADCN_BINDING_PRESETS).join(', ')}\n`,
      )
      return USAGE
    }
    source = {
      ...source,
      shadcnRoleBindings: SHADCN_BINDING_PRESETS[bindingArg].shadcnRoleBindings,
    }
  }

  // why: --soft-borders layers ON TOP of the binding/default map above — it
  // re-asserts the soft edge token onto the three edge roles in both modes, so it
  // must win regardless of what the binding set. Order matters: binding first, then
  // soft-edges. Consumed identically to --binding (shadcn-only; noted below).
  const softBorders = hasFlag(args, '--soft-borders')
  if (softBorders) {
    source = { ...source, shadcnRoleBindings: withSoftEdges(source.shadcnRoleBindings) }
  }

  const targetArg = flagValue(args, '--to')
  if (targetArg !== undefined && !isTarget(targetArg)) {
    io.err(`tonex: unknown target "${targetArg}"\n  one of: ${TARGETS.join(', ')}\n`)
    return USAGE
  }
  const target: Target = targetArg ?? 'shadcn'

  // why: --format is core's `colorFormat` knob surfaced as a flag — the encoding
  // lives in the exporters (ADR-0021 stringify seam), the CLI only passes it
  // through. Validated against core's COLOR_FORMATS so a bad value is a usage
  // error here, not a silent default. yaml ignores it (design.md is always hex).
  const formatArg = flagValue(args, '--format')
  if (formatArg !== undefined && !isColorFormat(formatArg)) {
    io.err(`tonex: unknown format "${formatArg}"\n  one of: ${COLOR_FORMATS.join(', ')}\n`)
    return USAGE
  }
  // why: --extended is core's `includeExtended` tier knob surfaced as a flag — it
  // widens the emitted roster from core (the sufficient baseline) to core+extended.
  // colors/yaml/json honor it; shadcn's roster is binding-fixed (the note below).
  const exportOptions: ExportOptions = {
    ...(formatArg ? { colorFormat: formatArg } : {}),
    ...(hasFlag(args, '--extended') ? { includeExtended: true } : {}),
  }

  const bundle = buildContrastBundle(source)

  // why: yaml (the design.md colors block) has no light/dark axis, so it alone
  // reads `--mode` to pick which projection to emit. colors, shadcn, and json
  // co-emit BOTH modes; passing `--mode` to them is a no-op, so we say so on
  // stderr (an agent that wanted a single mode would otherwise see plausible
  // output and never notice) — without changing the exit code.
  if (target === 'yaml') {
    const modeArg = flagValue(args, '--mode')
    if (modeArg !== undefined && !isMode(modeArg)) {
      io.err(`tonex: unknown mode "${modeArg}"\n  one of: ${MODES.join(', ')}\n`)
      return USAGE
    }
    io.out(exportDesignMd(bundle, (modeArg ?? 'light') as Mode))
    return OK
  }

  if (flagValue(args, '--mode') !== undefined) {
    io.err(`tonex: note — --mode is ignored for ${target} (it emits both modes)\n`)
  }
  if (bindingArg !== undefined && target !== 'shadcn') {
    io.err(`tonex: note — --binding is only consumed by --to shadcn\n`)
  }
  if (softBorders && target !== 'shadcn') {
    io.err(`tonex: note — --soft-borders is only consumed by --to shadcn\n`)
  }
  if (hasFlag(args, '--extended') && target === 'shadcn') {
    io.err(`tonex: note — --extended is ignored for shadcn (its roster is fixed by the bindings)\n`)
  }
  // why: colors is tonex's canonical colors.json (recipe header + both-mode role
  // values, ADR-0039 Decision 7); json is the Material Theme JSON reshape (a
  // www-oriented export reused as-is for this phase, its shape will likely change
  // for the agent fill path); shadcn is the paste-ready oklch :root/.dark block.
  io.out(
    target === 'colors'
      ? exportColorsJson(source, bundle, exportOptions)
      : target === 'json'
        ? exportJson(source, bundle, exportOptions)
        : exportCss(bundle, 'shadcn', exportOptions),
  )
  return OK
}
