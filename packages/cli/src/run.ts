// why: the CLI core is a pure `run(argv, io) → exitCode` function so the command
// surface is exercised at a function boundary — deterministic stdout/exit-code
// assertions, no child process. `cli.ts` is the thin bin that wires real
// process streams to this. `run` dispatches subcommands; each takes seed-only
// input (the settled v0 contract) resolved through the shared `parseSource`.
import { isValidHex } from '@tonex/color-utils'
import { buildContrastBundle, deriveTheme, exportCss, exportJson, hctFromHex } from '@tonex/core'
import { auditTheme } from '@tonex/core/audit'
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
  generate --seed <hex> [--variant <name>] [--format css|json]
      Derive a theme from a seed hex color and print it.
  check    --seed <hex> [--variant <name>] [--json]
      Audit the derived theme's WCAG contrast. Exit 0 when it passes
      (no text failures), 1 otherwise. --json prints the full report.

  --variant  one of: ${Object.keys(variants).join(', ')} (default: ${DEFAULT_VARIANT}).`

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

// why: `check` is the contrast GATE — the second consumer of the engine-owned
// `@tonex/core/audit`. It derives the theme and runs `auditTheme`, then maps the
// BLESSED verdict onto the process exit code: 0 iff no TEXT pair fails (non-text
// fails are reported as warnings but never block). `--json` emits the full
// report; otherwise a one-line tally. (For seed-only input tonex's on-X/X pairs
// pass by construction, so the happy path is exit 0 — the failing branch turns
// load-bearing at step E over foreign pairs.)
function check(args: readonly string[], io: Io): number {
  const source = parseSource(args, io)
  if (typeof source === 'number') return source

  const result = auditTheme(deriveTheme(source))
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
    io.err(`tonex: unknown variant "${variantArg}"\n  one of: ${Object.keys(variants).join(', ')}\n`)
    return 1
  }
  const variant = (variantArg ?? DEFAULT_VARIANT) as VariantName

  return {
    ...DEFAULT_INPUTS,
    variant,
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
