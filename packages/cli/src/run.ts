// why: the CLI core is a pure `run(argv, io) → exitCode` function so the command
// surface is exercised at a function boundary — deterministic stdout/exit-code
// assertions, no child process. `cli.ts` is the thin bin that wires real
// process streams to this. `run` dispatches subcommands; each takes seed-only
// input (the settled v0 contract) resolved through the shared `parseSource`.
import { argbFromHex, contrastRatio, isValidHex } from '@tonex/color-utils'
import { buildContrastBundle, deriveTheme, exportCss, exportJson, hctFromHex } from '@tonex/core'
import { auditTheme, type Level, levelThreshold } from '@tonex/core/audit'
import { DEFAULT_INPUTS, type PortableTheme } from '@tonex/core/schema'
import { DEFAULT_VARIANT, type VariantName, variants } from '@tonex/core/variants'

export interface Io {
  out: (chunk: string) => void
  err: (chunk: string) => void
}

// why: css = the paste-ready shadcn :root/.dark block (v0's primary consumer);
// json = the Material Theme JSON reshape. No `--mode` knob: both formats
// co-emit light AND dark, so mode is a no-op here — it only bites the
// single-mode design.md exporter, where it lands (step D).
const FORMATS = ['css', 'json'] as const
type Format = (typeof FORMATS)[number]

const USAGE = `usage: tonex <command> [options]

commands:
  generate --seed <hex> [--variant <name>] [--format css|json] [--contrast <0..1>]
      Derive a theme from a seed hex color and print it.
  check    --seed <hex> [--variant <name>] [--contrast <0..1>] [--aaa] [--json]
      Audit the derived theme's WCAG contrast. Exit 0 when it passes
      (no text failures), 1 otherwise. --json prints the full report.
  check    <fg> <bg> [--aaa] [--large]
      Verify one ad-hoc fg/bg hex pairing. Exit 0 iff it clears the level.
  check    --pairs '<json>' [--aaa] [--large]
      Batch-verify a JSON array of [fg, bg] hex pairs; exit 1 if any fail,
      enumerating the offenders and their ratios.

  --variant  one of: ${Object.keys(variants).join(', ')} (default: ${DEFAULT_VARIANT}).
  --aaa      raise the WCAG bar to AAA (default AA). --large uses large-text thresholds.
  --contrast MCU palette contrast level, 0..1 (default 0).`

export function run(argv: readonly string[], io: Io): number {
  const [command, ...rest] = argv
  switch (command) {
    case 'generate':
      return generate(rest, io)
    case 'check':
      return check(rest, io)
    default: {
      const named = command ? ` "${command}"` : ''
      io.err(`tonex: unknown command${named}\n\n${USAGE}\n`)
      return 1
    }
  }
}

// why: `generate` derives the theme and prints it — shadcn CSS or Material
// Theme JSON. `buildContrastBundle` routes through the derive cache and feeds
// both exporters.
function generate(args: readonly string[], io: Io): number {
  const source = parseSource(args, io)
  if (typeof source === 'number') return source

  const formatArg = readFlag(args, '--format')
  if (formatArg !== undefined && !isFormat(formatArg)) {
    io.err(`tonex: unknown format "${formatArg}"\n  one of: ${FORMATS.join(', ')}\n`)
    return 1
  }
  const format: Format = formatArg ?? 'css'

  const bundle = buildContrastBundle(source)
  io.out(format === 'json' ? exportJson(source, bundle) : exportCss(bundle, 'shadcn'))
  return 0
}

// why: `check` is the contrast GATE, overloaded across three forms that share one
// exit-code contract (0 = clears the requested level, 1 = a TEXT pair fails):
//   - `--seed <hex>`  audits the whole derived theme (the engine-owned auditTheme
//     gate; passes by construction for seed-only AA input).
//   - `<fg> <bg>`     the pair ORACLE — is this ad-hoc pairing contrast-safe? The
//     agent already holds the hexes, so no theme derive: a raw WCAG-ratio check.
//   - `--pairs <json>` the batch oracle — verify EVERY pairing about to be written
//     in one call; on failure it enumerates the offenders so the next move is
//     targeted. All three honor --aaa (level) and the pair forms --large (size).
function check(args: readonly string[], io: Io): number {
  if (hasFlag(args, '--pairs')) return checkPairs(args, io)
  if (readFlag(args, '--seed') !== undefined) return checkTheme(args, io)
  return checkPair(args, io)
}

// why: the whole-theme gate — derive then auditTheme, mapping the BLESSED verdict
// onto the exit code (0 iff no TEXT pair fails; non-text fails warn, never block).
// `--json` emits the full report, else a one-line tally. --aaa raises the audit to
// the 7.0 text threshold (not guaranteed by construction — the AAA pre-flight).
function checkTheme(args: readonly string[], io: Io): number {
  const source = parseSource(args, io)
  if (typeof source === 'number') return source

  const result = auditTheme(deriveTheme(source), { level: levelOf(args) })
  if (hasFlag(args, '--json')) {
    io.out(`${JSON.stringify(result, null, 2)}\n`)
  } else {
    const { pass, textFail, uiFail, exempt } = result.summary
    const verdict = result.ok ? 'PASS' : 'FAIL'
    io.out(
      `${verdict} — ${result.level.toUpperCase()} contrast: ` +
        `${pass} pass / ${textFail} text-fail / ${uiFail} warn / ${exempt} exempt\n`,
    )
  }
  return result.ok ? 0 : 1
}

// why: the single-pair oracle — two positional hexes, no theme. Computes the raw
// WCAG ratio and compares it to the requested text threshold; prints the ratio so
// a failing answer is actionable, not a bare exit 1.
function checkPair(args: readonly string[], io: Io): number {
  const positionals = args.filter((a) => !a.startsWith('--'))
  if (positionals.length !== 2) {
    io.err(`tonex: check needs <fg> <bg> hex (or --seed / --pairs)\n\n${USAGE}\n`)
    return 1
  }
  const [fg, bg] = positionals
  if (!isValidHex(fg) || !isValidHex(bg)) {
    io.err(`tonex: invalid hex in pair "${fg}" "${bg}"\n`)
    return 1
  }

  const level = levelOf(args)
  const threshold = textThreshold(level, hasFlag(args, '--large'))
  const ratio = contrastRatio(argbFromHex(fg), argbFromHex(bg))
  const ok = ratio >= threshold
  io.out(`${verdictLine(ok, ratio, level, hasFlag(args, '--large'), threshold)}\n`)
  return ok ? 0 : 1
}

// why: the batch oracle — `--pairs '[["#fff","#000"],…]'` verifies every pairing
// the agent is about to write in ONE call (inline JSON keeps `run` pure; file/
// stdin sources are a bin-level convenience deferred past v0). On failure it
// ENUMERATES which pairs fell short + their ratios, so the agent re-rolls only the
// offenders. For tools that FUSE roles onto one slot, the caller must include
// every (fg,bg) that slot touches — this checks each listed pair independently.
function checkPairs(args: readonly string[], io: Io): number {
  const raw = readFlag(args, '--pairs')
  if (raw === undefined) {
    io.err(`tonex: --pairs needs a JSON array of [fg, bg] hex pairs\n`)
    return 1
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    io.err(`tonex: --pairs is not valid JSON\n`)
    return 1
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    io.err(`tonex: --pairs must be a non-empty JSON array of [fg, bg] hex pairs\n`)
    return 1
  }
  const pairs: [string, string][] = []
  for (const p of parsed) {
    if (!Array.isArray(p) || p.length !== 2 || !isValidHex(p[0]) || !isValidHex(p[1])) {
      io.err(`tonex: each --pairs entry must be [fgHex, bgHex]; bad entry ${JSON.stringify(p)}\n`)
      return 1
    }
    pairs.push([p[0], p[1]])
  }

  const level = levelOf(args)
  const large = hasFlag(args, '--large')
  const threshold = textThreshold(level, large)
  const results = pairs.map(([fg, bg]) => {
    const ratio = contrastRatio(argbFromHex(fg), argbFromHex(bg))
    return { fg, bg, ratio, ok: ratio >= threshold }
  })
  const failures = results.filter((r) => !r.ok)
  const label = `${level.toUpperCase()} ${large ? 'large text' : 'text'} (${threshold})`
  if (failures.length === 0) {
    io.out(`PASS — ${results.length}/${results.length} pairs clear ${label}\n`)
    return 0
  }
  const lines = failures.map((r) => `  ${r.fg} on ${r.bg} — ${r.ratio.toFixed(2)}:1`).join('\n')
  io.out(
    `FAIL — ${label}: ${failures.length} of ${results.length} pairs below threshold\n${lines}\n`,
  )
  return 1
}

// why: --aaa is the only level knob (AA is the default and needs no flag), shared
// across every check form so the agent threads one target level end to end.
function levelOf(args: readonly string[]): Level {
  return hasFlag(args, '--aaa') ? 'aaa' : 'aa'
}

// why: WCAG text thresholds — normal text is 4.5 (AA) / 7 (AAA) per 1.4.3; large
// text drops to 3 / 4.5, numerically identical to the non-text tier, so we reuse
// levelThreshold's intent switch rather than re-listing the constants.
function textThreshold(level: Level, large: boolean): number {
  return levelThreshold(large ? 'non-text' : 'text', level)
}

function verdictLine(
  ok: boolean,
  ratio: number,
  level: Level,
  large: boolean,
  threshold: number,
): string {
  const label = `${level.toUpperCase()} ${large ? 'large text' : 'text'} (${threshold})`
  return `${ok ? 'PASS' : 'FAIL'} — ${ratio.toFixed(2)}:1 ${ok ? 'clears' : 'below'} ${label}`
}

// why: the shared seed+variant resolver — every subcommand audits/prints the
// SAME theme `generate` would produce. Returns the PortableTheme, or an exit
// code (after writing the error) so callers `if (typeof x === 'number') return x`.
// Seed-only input is the settled v0 contract; `exactHex` preserves the user's
// exact bytes (ADR-0028) so output reflects what they pasted.
function parseSource(args: readonly string[], io: Io): PortableTheme | number {
  const seed = readFlag(args, '--seed')
  if (seed === undefined) {
    io.err(`tonex: missing required --seed <hex>\n\n${USAGE}\n`)
    return 1
  }
  if (!isValidHex(seed)) {
    io.err(`tonex: invalid seed hex "${seed}"\n`)
    return 1
  }

  const variantArg = readFlag(args, '--variant')
  if (variantArg !== undefined && !Object.hasOwn(variants, variantArg)) {
    io.err(
      `tonex: unknown variant "${variantArg}"\n  one of: ${Object.keys(variants).join(', ')}\n`,
    )
    return 1
  }
  const variant = (variantArg ?? DEFAULT_VARIANT) as VariantName

  // why: --contrast surfaces MCU's existing contrastLevel input — the palette-
  // layer remedy when re-mapping tokens can't reach AAA. One scalar applied
  // uniformly to both modes (the per-mode split is a www-only affordance); the
  // schema bounds it [0,1], so we reject out-of-range here rather than derive a
  // theme the persisted shape would refuse.
  const contrastArg = readFlag(args, '--contrast')
  const contrast = contrastArg === undefined ? 0 : Number(contrastArg)
  if (contrastArg !== undefined && (!Number.isFinite(contrast) || contrast < 0 || contrast > 1)) {
    io.err(`tonex: --contrast must be a number in [0, 1], got "${contrastArg}"\n`)
    return 1
  }

  return {
    ...DEFAULT_INPUTS,
    variant,
    contrastLevel: { light: contrast, dark: contrast },
    seed: { ...hctFromHex(seed), exactHex: seed },
  }
}

function isFormat(value: string): value is Format {
  return (FORMATS as readonly string[]).includes(value)
}

// why: a two-token `--flag value` reader + a boolean `--flag` presence check —
// enough for the current surface. If the flag set grows past this (subcommand
// trees, repeated flags), this is the seam to swap in a real parser; until then
// it stays dependency-free.
function readFlag(args: readonly string[], name: string): string | undefined {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  return args[i + 1]
}

function hasFlag(args: readonly string[], name: string): boolean {
  return args.includes(name)
}
