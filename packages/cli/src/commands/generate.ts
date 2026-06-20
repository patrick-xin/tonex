// why: `generate` derives the theme and prints it for one output target — the
// transient `--to colors` role set, the shadcn :root/.dark block, the single-mode
// design.md `colors:` yaml, or the Material Theme JSON. It surfaces core's knobs
// (`--to`/`--format`/`--mode`) as flags and projects core's values; it owns no
// color logic of its own. Each DELIVERED projection (shadcn / yaml / json — not
// the transient colors read) carries its runnable recipe, the durable artifact
// (ADR-0039 Decision 7, amendment 2026-06-17).
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
import {
  type CustomColorEntry,
  type PortableTheme,
  SHADCN_BINDING_PRESETS,
  withSoftEdges,
} from '@tonex/core/schema'
import { flagValue, hasFlag, type ParsedArgs, parseArgs } from '../args'
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

// why: the recipe — the runnable command that reproduces THIS projection,
// embedded in the delivered file as the durable artifact (ADR-0039 Decision 7,
// amendment 2026-06-17). Built from RESOLVED values (`source` carries
// variant/contrast/surface after parseSource applied the defaults), never the
// raw typed flags, so a later default change can't silently re-derive a different
// theme. The seed is the projected `exactHex` (shell-safe, single-quoted —
// never a raw oklch the user may have pasted). Mirrors www's formatHeader policy:
// --variant always (the signature knob), contrast/surface only when applied.
// --format and (yaml's) --mode are emitted when they shape the bytes; binding /
// soft-borders shape the shadcn slots.
function recipeCommand(source: PortableTheme, target: Target, args: ParsedArgs): string {
  const parts = [`tonex generate --seed '${source.seed.exactHex}'`, `--variant ${source.variant}`]
  if (source.cmfSecondSourceHex !== null) {
    parts.push(`--second-color '${source.cmfSecondSourceHex}'`)
  }
  if (source.contrastLevel.light > 0) parts.push(`--contrast ${source.contrastLevel.light}`)
  if (source.surfaceAlgo === 'tint') {
    parts.push(
      `--tint ${source.surfaceTintLevel.light}`,
      `--tint-palette ${source.surfacePaletteName}`,
    )
  } else if (source.surfaceDesaturateLevel.light > 0) {
    parts.push(`--desaturate ${source.surfaceDesaturateLevel.light}`)
  }
  // why: custom colors shape the derived theme, so the recipe must carry them to
  // reproduce the projection. Re-serialize the RESOLVED entries (hex already
  // projected to sRGB, blend/shadcnSource defaulted) — never the raw flag — so a
  // later regenerate emits the same custom tokens. Single-quoted for the shell;
  // the JSON's own double quotes nest cleanly inside.
  if (source.customColors.length > 0) {
    parts.push(`--custom '${serializeCustom(source.customColors)}'`)
  }
  if (hasFlag(args, '--extended')) parts.push('--extended')
  const fmt = flagValue(args, '--format')
  if (fmt !== undefined) parts.push(`--format ${fmt}`)
  const binding = flagValue(args, '--binding')
  if (binding !== undefined) parts.push(`--binding ${binding}`)
  if (hasFlag(args, '--soft-borders')) parts.push('--soft-borders')
  parts.push(`--to ${target}`)
  if (target === 'yaml') parts.push(`--mode ${flagValue(args, '--mode') ?? 'light'}`)
  return parts.join(' ')
}

// why: the recipe's custom-color payload — the color-defining fields only (name,
// hex, blend, shadcnSource; description when set, since it surfaces in --to json).
// `id` is dropped: the CLI re-derives it from the slug, so emitting it would be
// noise a later parse just re-synthesizes.
function serializeCustom(entries: readonly CustomColorEntry[]): string {
  return JSON.stringify(
    entries.map((e) => ({
      name: e.name,
      hex: e.hex,
      blend: e.blend,
      shadcnSource: e.shadcnSource,
      ...(e.description !== undefined ? { description: e.description } : {}),
    })),
  )
}

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
    io.out(
      exportDesignMd(bundle, (modeArg ?? 'light') as Mode, {
        ...exportOptions,
        provenance: recipeCommand(source, 'yaml', args),
      }),
    )
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
  // why: colors is the transient `--to colors` role set the agent READS while
  // mapping roles→slots — not a delivered file, so it carries no embedded recipe
  // (its own structured header is its provenance). json is the Material Theme JSON
  // reshape (recipe rides in `description`); shadcn is the paste-ready oklch
  // :root/.dark block (recipe rides in a leading /* */). The recipe is the durable
  // artifact every delivered projection carries (ADR-0039 Decision 7).
  const provenance = recipeCommand(source, target, args)
  io.out(
    target === 'colors'
      ? exportColorsJson(source, bundle, exportOptions)
      : target === 'json'
        ? exportJson(source, bundle, { ...exportOptions, provenance })
        : exportCss(bundle, 'shadcn', { ...exportOptions, provenance }),
  )
  return OK
}
