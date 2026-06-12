// why: the arg layer is SCHEMA-AS-DATA. One `FlagSpec` list per command feeds
// three consumers — this parser (tokenize, `--flag=value`, reject unknown flags
// with a did-you-mean), the `describe` introspection surface, and `--help`. The
// hand-rolled two-token reader this replaces silently dropped typo'd flags
// (`--varinat vibrant` ran the DEFAULT theme, exit 0, no signal) and misread the
// `--seed=#fff` form agents emit constantly. Declaring the flags as data closes
// both at the seam instead of leaving each call site to re-derive them.

export type FlagType = 'hex' | 'enum' | 'unit' | 'boolean' | 'json'

export interface FlagSpec {
  readonly name: string
  readonly type: FlagType
  readonly description: string
  readonly required?: boolean
  readonly values?: readonly string[]
}

export interface ParsedArgs {
  // why: boolean flags map to `true`, value flags to their string. A value flag's
  // coercion (hex/unit/enum) stays in the handler that owns its error message.
  readonly flags: ReadonlyMap<string, string | true>
  readonly positionals: readonly string[]
}

export type ParseResult = { ok: true; args: ParsedArgs } | { ok: false; message: string }

// why: tokenize argv against the command's declared flags. Unknown `--flags` are a
// usage error (not silently dropped); `--flag=value` and `--flag value` both work;
// a value flag with no value (or another `--flag` next) reports "needs a value"
// rather than swallowing the following token. The error `message` is stderr-ready
// (trailing newline) and the caller maps it to exit code 2.
export function parseArgs(argv: readonly string[], specs: readonly FlagSpec[]): ParseResult {
  const byName = new Map(specs.map((s) => [s.name, s]))
  const flags = new Map<string, string | true>()
  const positionals: string[] = []

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      positionals.push(token)
      continue
    }

    const eq = token.indexOf('=')
    const name = eq === -1 ? token : token.slice(0, eq)
    const inline = eq === -1 ? undefined : token.slice(eq + 1)

    const spec = byName.get(name)
    if (!spec) {
      const near = suggest(name, specs)
      const did = near ? ` (did you mean ${near}?)` : ''
      return { ok: false, message: `tonex: unknown flag "${name}"${did}\n` }
    }

    if (spec.type === 'boolean') {
      if (inline !== undefined) {
        return { ok: false, message: `tonex: ${name} is a flag and takes no value\n` }
      }
      flags.set(name, true)
      continue
    }

    let value: string
    if (inline !== undefined) {
      value = inline
    } else {
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) {
        return { ok: false, message: `tonex: ${name} needs a value\n` }
      }
      value = next
      i++
    }
    flags.set(name, value)
  }

  return { ok: true, args: { flags, positionals } }
}

// why: a value flag's string (undefined when absent or boolean-shaped).
export function flagValue(p: ParsedArgs, name: string): string | undefined {
  const v = p.flags.get(name)
  return typeof v === 'string' ? v : undefined
}

// why: presence, for boolean flags AND for value flags whose mere presence picks a
// dispatch branch (`--pairs`, `--seed` in the overloaded `check`).
export function hasFlag(p: ParsedArgs, name: string): boolean {
  return p.flags.has(name)
}

// why: did-you-mean for a mistyped flag — design.md does the same on unknown keys.
// Only suggest a near miss (edit distance < 3) so we never point an agent at an
// unrelated flag.
function suggest(unknown: string, specs: readonly FlagSpec[]): string | undefined {
  let best: string | undefined
  let bestDist = 3
  for (const s of specs) {
    const d = levenshtein(unknown, s.name)
    if (d < bestDist) {
      bestDist = d
      best = s.name
    }
  }
  return best
}

function levenshtein(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}
