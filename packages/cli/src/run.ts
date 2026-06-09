// why: the CLI core is a pure `run(argv, io) → exitCode` function so the command
// surface is exercised at a function boundary — deterministic stdout/exit-code
// assertions, no child process. `cli.ts` is the thin bin that wires real
// process streams to this. Step A is the walking skeleton: one `generate`
// command, seed-only input, prints the derived shadcn CSS. Richer params land
// in step B against this same surface.
import { isValidHex } from '@tonex/color-utils'
import { buildContrastBundle, exportCss, hctFromHex } from '@tonex/core'
import { DEFAULT_INPUTS, type PortableTheme } from '@tonex/core/schema'

export interface Io {
  out: (chunk: string) => void
  err: (chunk: string) => void
}

const USAGE = `usage: tonex generate --seed <hex>

  Derive a theme from a seed hex color and print its shadcn CSS.`

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

  // why: seed-only input is the settled v0 contract — fold the hex onto the
  // default inputs as the canonical HCT seed, preserving the user's exact bytes
  // via `exactHex` (ADR-0028) so the printed CSS reflects what they pasted.
  const source: PortableTheme = {
    ...DEFAULT_INPUTS,
    seed: { ...hctFromHex(seed), exactHex: seed },
  }
  io.out(exportCss(buildContrastBundle(source), 'shadcn'))
  return 0
}

// why: a two-token `--flag value` reader — enough for the step-A surface. The
// real flag set (`--variant`, `--mode`, `--format`) arrives in step B; this
// stays dependency-free until that shape is known rather than pulling an
// arg-parser the skeleton doesn't yet need.
function readFlag(args: readonly string[], name: string): string | undefined {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  return args[i + 1]
}
