#!/usr/bin/env node
// why: the executable bin — the only file that touches process globals. It maps
// the real stdout/stderr/exit onto the pure `run` core, so every command's
// logic stays unit-testable without spawning a process. (Pre-launch this runs
// through tsx; a built JS bin is a publish-time concern, not a v0 one.)
import { readFileSync } from 'node:fs'
import { run } from './run'

process.exit(
  run(process.argv.slice(2), {
    out: (chunk) => process.stdout.write(chunk),
    err: (chunk) => process.stderr.write(chunk),
    // why: `apply`'s input seam — fd 0 (stdin) when no path is given (the piped /
    // `apply -` form), else the named file. Synchronous read keeps `run` pure-ish
    // (one boundary call, no async leaking into the command layer). A read error
    // (missing file, no piped input) returns null → the command exits 2.
    read: (path) => {
      try {
        return readFileSync(path === undefined ? 0 : path, 'utf8')
      } catch {
        return null
      }
    },
  }),
)
