#!/usr/bin/env node
// why: the executable bin — the only file that touches process globals. It maps
// the real stdout/stderr/exit onto the pure `run` core, so every command's
// logic stays unit-testable without spawning a process. (Pre-launch this runs
// through tsx; a built JS bin is a publish-time concern, not a v0 one.)
import { run } from './run'

process.exit(
  run(process.argv.slice(2), {
    out: (chunk) => process.stdout.write(chunk),
    err: (chunk) => process.stderr.write(chunk),
  }),
)
