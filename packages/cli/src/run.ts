// why: the CLI core is a pure `run(argv, io) → exitCode` function so the command
// surface is exercised at a function boundary — deterministic stdout/exit-code
// assertions, no child process. `cli.ts` is the thin bin that wires real
// process streams to this. `generate` takes seed-only input (the settled v0
// contract) plus the format/variant knobs; it builds the contrast bundle and
// prints either shadcn CSS or Material Theme JSON.
import { isValidHex } from '@tonex/color-utils'
import { buildContrastBundle, exportCss, exportJson, hctFromHex } from '@tonex/core'
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

const USAGE = `usage: tonex generate --seed <hex> [--variant <name>] [--format css|json]

  Derive a theme from a seed hex color and print it.

  --seed <hex>       required — the brand seed color.
  --variant <name>   MCU scheme (default: ${DEFAULT_VARIANT}).
                     one of: ${Object.keys(variants).join(', ')}.
  --format css|json  shadcn CSS or Material Theme JSON (default: css).`

export function run(argv: readonly string[], io: Io): number {
  const [command, ...rest] = argv

  if (command !== 'generate') {
    const named = command ? ` "${command}"` : ''
    io.err(`tonex: unknown command${named}\n\n${USAGE}\n`)
    return 1
  }

  const seed = readFlag(rest, '--seed')
  if (seed === undefined) {
    io.err(`tonex: missing required --seed <hex>\n\n${USAGE}\n`)
    return 1
  }
  if (!isValidHex(seed)) {
    io.err(`tonex: invalid seed hex "${seed}"\n`)
    return 1
  }

  const variantArg = readFlag(rest, '--variant')
  if (variantArg !== undefined && !Object.hasOwn(variants, variantArg)) {
    io.err(
      `tonex: unknown variant "${variantArg}"\n  one of: ${Object.keys(variants).join(', ')}\n`,
    )
    return 1
  }
  const variant = (variantArg ?? DEFAULT_VARIANT) as VariantName

  const formatArg = readFlag(rest, '--format')
  if (formatArg !== undefined && !isFormat(formatArg)) {
    io.err(`tonex: unknown format "${formatArg}"\n  one of: ${FORMATS.join(', ')}\n`)
    return 1
  }
  const format: Format = formatArg ?? 'css'

  // why: seed-only input is the settled v0 contract — fold the seed + variant
  // onto the default inputs, preserving the user's exact hex bytes via
  // `exactHex` (ADR-0028) so the printed theme reflects what they pasted.
  const source: PortableTheme = {
    ...DEFAULT_INPUTS,
    variant,
    seed: { ...hctFromHex(seed), exactHex: seed },
  }
  const bundle = buildContrastBundle(source)
  io.out(format === 'json' ? exportJson(source, bundle) : exportCss(bundle, 'shadcn'))
  return 0
}

function isFormat(value: string): value is Format {
  return (FORMATS as readonly string[]).includes(value)
}

// why: a two-token `--flag value` reader — enough for the current surface. If
// the flag set grows past simple value pairs (subcommands, booleans, repeats),
// this is the seam to swap in a real parser; until then it stays
// dependency-free.
function readFlag(args: readonly string[], name: string): string | undefined {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  return args[i + 1]
}
