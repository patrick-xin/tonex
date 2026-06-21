// why: `apply` is the READER half of the by-value round-trip (issue #219) — it loads
// and validates a serialized `colors.json`, then runs the pipeline on the WHOLE
// `PortableTheme`, honoring every pin/binding/override inside it. Two forms on one
// exit-code contract, cleaved by `--check`:
//   - project (default): `--to <target>` + the generate projection knobs — reuses
//     `project` so `apply file --to T` === `generate --seed X --to T` for a serialized
//     theme (the unification proof), and a www-authored pin shows its pinned value.
//   - gate: `--check` + `--aaa`/`--mode`/`--json` — reuses `gateTheme` so a loaded
//     theme's broken text pair blocks at exit 1, the same verdict as `check --seed`.
// The seam: `apply` owns INPUT (load + validate, exit 2 on a bad artifact) and routes
// to the shared projection/gate; it adds no derivation or color logic of its own.
import { hasFlag, parseArgs } from '../args'
import { type Io, USAGE } from '../io'
import { loadPortableTheme } from '../portable'
import { APPLY_FLAGS } from '../spec'
import { gateTheme } from './check'
import { project } from './generate'

export function apply(argv: readonly string[], io: Io): number {
  const parsed = parseArgs(argv, APPLY_FLAGS)
  if (!parsed.ok) {
    io.err(parsed.message)
    return USAGE
  }
  const args = parsed.args

  // why: the input is a file-path positional, or stdin when omitted or `-` (so
  // `serialize | apply` and `apply theme.json` both work). A read failure (missing
  // file, empty stdin) is a usage error (exit 2) — a bad artifact is a loud call
  // error, never a silent default theme (the `--varinat` trap, applied to input).
  const pathArg = args.positionals[0]
  const raw = io.read(pathArg === '-' ? undefined : pathArg)
  if (raw === null) {
    io.err(
      pathArg !== undefined && pathArg !== '-'
        ? `tonex: cannot read "${pathArg}"\n`
        : `tonex: no input — pass a colors.json path, or pipe one to \`apply\` (or \`apply -\`)\n`,
    )
    return USAGE
  }

  const loaded = loadPortableTheme(raw)
  if (!loaded.ok) {
    io.err(loaded.message)
    return USAGE
  }

  // why: `--check` switches the whole-theme contrast gate ON (the `check --seed` form
  // over a loaded theme); its absence is the default projection form (the `generate`
  // form over a loaded theme). Both consume the same `PortableTheme`, so the loaded
  // pins/bindings/overrides flow into whichever path runs.
  return hasFlag(args, '--check')
    ? gateTheme(loaded.theme, args, io)
    : project(loaded.theme, args, io)
}
