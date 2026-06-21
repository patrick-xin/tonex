// why: `serialize` is the WRITER half of the by-value `colors.json` round-trip
// (issue #219) — it takes the SAME derivation source as `generate` (`--seed` + the
// variant/contrast/surface/custom knobs, via the shared `parseSource`) and prints the
// resulting `PortableTheme` as canonical, version-stamped JSON. That is its whole job:
// it freezes the derivation SOURCE, it does not author overrides/pins/free bindings
// (pass-through scope, deferred to the relative-token-adjust feature), so a
// CLI-constructed theme carries default bindings and empty overrides — still a fully
// valid `PortableTheme`. Projection knobs (`--to`/`--binding`/…) never appear here:
// they choose how a theme is CONSUMED, which is `apply`'s seam, not what it IS.
import { parseArgs } from '../args'
import { type Io, OK, USAGE } from '../io'
import { serializePortableTheme } from '../portable'
import { parseSource } from '../source'
import { SERIALIZE_FLAGS } from '../spec'

export function serialize(argv: readonly string[], io: Io): number {
  const parsed = parseArgs(argv, SERIALIZE_FLAGS)
  if (!parsed.ok) {
    io.err(parsed.message)
    return USAGE
  }
  const args = parsed.args

  // why: a stray projection knob (`--to`/`--binding`/…) on `serialize` is a usage
  // error from the parser (it isn't in SERIALIZE_FLAGS) — the loud did-you-mean is the
  // point: it tells the agent those knobs belong on `apply`, not that they were ignored.
  const source = parseSource(args, io)
  if (typeof source === 'number') return source

  io.out(`${serializePortableTheme(source)}\n`)
  return OK
}
