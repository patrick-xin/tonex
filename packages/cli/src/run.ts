// why: the CLI core is a pure `run(argv, io) → exitCode` function so the command
// surface is exercised at a function boundary — deterministic stdout/exit-code
// assertions, no child process. `cli.ts` is the thin bin that wires real process
// streams to this. This file is JUST the dispatcher: it routes a subcommand to its
// handler and owns nothing else. Each command lives in `commands/`; the shared
// seed→theme resolver in `source.ts`; the flag schema (parsed + introspected) in
// `spec.ts`; the IO seam + exit codes in `io.ts`; the usage text in `help.ts`.
import { adjust } from './commands/adjust'
import { apply } from './commands/apply'
import { check } from './commands/check'
import { generate } from './commands/generate'
import { serialize } from './commands/serialize'
import { HELP } from './help'
import { type Io, OK, USAGE } from './io'
import { describePayload } from './spec'

export function run(argv: readonly string[], io: Io): number {
  // why: help is first-class — discoverable on stdout with exit 0, so an agent's
  // reflexive `tonex` / `tonex --help` probe doesn't read as a failure. A bare
  // invocation is the same friendly surface, not an error.
  const [command, ...rest] = argv
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h') || command === 'help') {
    io.out(`${HELP}\n`)
    return OK
  }

  switch (command) {
    case 'generate':
      return generate(rest, io)
    case 'check':
      return check(rest, io)
    case 'adjust':
      return adjust(rest, io)
    case 'serialize':
      return serialize(rest, io)
    case 'apply':
      return apply(rest, io)
    case 'describe':
      io.out(`${JSON.stringify(describePayload(), null, 2)}\n`)
      return OK
    default:
      io.err(`tonex: unknown command "${command}"\n\n${HELP}\n`)
      return USAGE
  }
}
