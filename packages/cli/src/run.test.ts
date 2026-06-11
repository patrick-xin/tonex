import { describe, expect, it } from 'vitest'
import { run } from './run'

// why: the v0 CLI acceptance contract. These pin OBSERVABLE behaviour — exit code
// + what is printed — at the pure `run(argv, io)` boundary, not the exact CSS/JSON
// bytes, so re-tuning a palette doesn't churn the suite. The exit-code taxonomy is
// load-bearing and asserted directly: 0 = clean, 1 = a contrast TEXT pair failed
// (fix the artifact), 2 = a usage/input error (fix the call). Kept minimal per
// [[feedback_minimal_robust_tests]]: one case per load-bearing branch, not a matrix.

const OK = 0
const GATE = 1
const USAGE = 2

function capture(argv: string[]) {
  const out: string[] = []
  const err: string[] = []
  const code = run(argv, { out: (c) => out.push(c), err: (c) => err.push(c) })
  return { code, out: out.join(''), err: err.join('') }
}

describe('tonex generate', () => {
  const SEED = '#3b82f6'

  it('derives a theme from --seed and prints the shadcn :root/.dark block at exit 0', () => {
    const { code, out } = capture(['generate', '--seed', SEED])
    expect(code).toBe(OK)
    expect(out).toContain('--primary')
    expect(out).toContain('.dark')
  })

  it('routes the seed through the engine — different seeds give different output', () => {
    const a = capture(['generate', '--seed', SEED])
    const b = capture(['generate', '--seed', '#ef4444'])
    expect(a.out).not.toBe(b.out)
  })

  it('--variant reaches the engine — a different scheme yields different output', () => {
    const cmf = capture(['generate', '--seed', SEED, '--variant', 'cmf'])
    const mono = capture(['generate', '--seed', SEED, '--variant', 'monochrome'])
    expect(mono.code).toBe(OK)
    expect(mono.out).not.toBe(cmf.out)
  })

  it('--to json emits a parseable document; --to yaml a single-mode colors: block', () => {
    const json = capture(['generate', '--seed', SEED, '--to', 'json'])
    expect(json.code).toBe(OK)
    expect(() => JSON.parse(json.out)).not.toThrow()

    const yaml = capture(['generate', '--seed', SEED, '--to', 'yaml'])
    expect(yaml.code).toBe(OK)
    expect(yaml.out.startsWith('colors:')).toBe(true)
    expect(yaml.out).not.toContain('.dark') // single-mode, not the dual css block
  })

  it('--mode picks which mode yaml emits (light default; dark differs); a bad mode is exit 2', () => {
    const light = capture(['generate', '--seed', SEED, '--to', 'yaml'])
    const dark = capture(['generate', '--seed', SEED, '--to', 'yaml', '--mode', 'dark'])
    expect(dark.code).toBe(OK)
    expect(dark.out).not.toBe(light.out)
    expect(capture(['generate', '--seed', SEED, '--to', 'yaml', '--mode', 'sideways']).code).toBe(
      USAGE,
    )
  })

  it('--tint / --desaturate reach the engine and are mutually exclusive (exit 2)', () => {
    const base = capture(['generate', '--seed', SEED])
    const desat = capture(['generate', '--seed', SEED, '--desaturate', '0.5'])
    expect(desat.code).toBe(OK)
    expect(desat.out).not.toBe(base.out)
    expect(capture(['generate', '--seed', SEED, '--tint', '0.5', '--desaturate', '0.5']).code).toBe(
      USAGE,
    )
  })

  it('--format picks the shadcn color encoding (oklch default; hex on request); a bad format is exit 2', () => {
    expect(capture(['generate', '--seed', SEED]).out).toContain('oklch(') // default
    const hex = capture(['generate', '--seed', SEED, '--format', 'hex'])
    expect(hex.code).toBe(OK)
    expect(hex.out).not.toContain('oklch(')
    expect(hex.out).toMatch(/#[0-9a-f]{6}/i)
    expect(capture(['generate', '--seed', SEED, '--format', 'rgb']).code).toBe(USAGE)
  })

  it('--contrast reaches the engine; an out-of-range level is a usage error (exit 2)', () => {
    const base = capture(['generate', '--seed', SEED])
    const high = capture(['generate', '--seed', SEED, '--contrast', '1'])
    expect(high.code).toBe(OK)
    expect(high.out).not.toBe(base.out)
    expect(capture(['generate', '--seed', SEED, '--contrast', '5']).code).toBe(USAGE)
  })

  it('bad inputs are usage errors (exit 2): missing seed, invalid hex, unknown flag/command', () => {
    expect(capture(['generate']).code).toBe(USAGE) // missing --seed
    expect(capture(['generate']).err).toMatch(/seed/i)
    expect(capture(['generate', '--seed', 'not-a-hex']).code).toBe(USAGE)
    expect(capture(['generate', '--seed', 'not-a-hex']).err).toMatch(/invalid/i)
    expect(capture(['generate', '--seed', SEED, '--varinat', 'cmf']).code).toBe(USAGE) // typo'd flag
    expect(capture(['frobnicate']).code).toBe(USAGE)
  })
})

// why: `check` is the contrast gate, overloaded across forms that share one
// exit-code contract (0 clears the level, 1 a text pair fails, 2 a bad call).
describe('tonex check — whole-theme gate', () => {
  const SEED = '#6750a4'

  it('audits the derived theme and exits 0 when it passes; --json carries the ok verdict', () => {
    expect(capture(['check', '--seed', '#3b82f6']).code).toBe(OK)
    const report = JSON.parse(capture(['check', '--seed', '#3b82f6', '--json']).out)
    expect(report.ok).toBe(true)
  })

  it('--find-contrast reports the minimum passing --contrast in one call', () => {
    const { code, out } = capture(['check', '--seed', SEED, '--aaa', '--find-contrast'])
    expect(code).toBe(OK)
    expect(out).toMatch(/FOUND/)
    expect(out).toMatch(/--contrast 0\.89/) // verified boundary for this seed
  })

  it('--mode scopes the gate to one projection — dark clears where the both-mode union fails', () => {
    // at AAA contrast 0.8 the light projection still fails, so the default gate blocks…
    expect(capture(['check', '--seed', SEED, '--aaa', '--contrast', '0.8']).code).toBe(GATE)
    // …but dark already clears, so scoping to it passes (matches a --mode dark yaml).
    expect(
      capture(['check', '--seed', SEED, '--aaa', '--contrast', '0.8', '--mode', 'dark']).code,
    ).toBe(OK)
  })

  it('--mode narrows the find-contrast remedy — dark needs less contrast than the union', () => {
    const both = JSON.parse(
      capture(['check', '--seed', SEED, '--aaa', '--find-contrast', '--json']).out,
    )
    const dark = JSON.parse(
      capture(['check', '--seed', SEED, '--aaa', '--find-contrast', '--mode', 'dark', '--json'])
        .out,
    )
    expect(both.reachable).toBe(true)
    expect(dark.reachable).toBe(true)
    expect(dark.minContrast).toBeLessThan(both.minContrast)
  })
})

// why: the pair oracle — the in-loop "does this fg/bg clear contrast?" answer that
// stops an agent mis-pairing tokens. Theme-free (the agent holds the hexes). A
// contrast failure is exit 1 (the artifact); a malformed hex is exit 2 (the call).
describe('tonex check — pair oracle', () => {
  it('verdicts a single pair: clears → 0, fails → 1 with the ratio reported', () => {
    expect(capture(['check', '#000000', '#ffffff']).code).toBe(OK)
    const fail = capture(['check', '#949494', '#ffffff']) // ~3.03
    expect(fail.code).toBe(GATE)
    expect(fail.out).toMatch(/3\.0/) // the failing ratio, not a bare exit 1
  })

  it('--aaa raises the bar and --large relaxes it', () => {
    const mid = ['check', '#5b5b5b', '#ffffff'] // ~6.79
    expect(capture(mid).code).toBe(OK) // clears AA text
    expect(capture([...mid, '--aaa']).code).toBe(GATE) // but not AAA text
    const lo = ['check', '#ff0000', '#ffffff'] // ~4.0
    expect(capture(lo).code).toBe(GATE) // fails normal text
    expect(capture([...lo, '--large']).code).toBe(OK) // clears large text
  })

  it('--pairs batches the check and names which pair failed', () => {
    const { code, out } = capture([
      'check',
      '--pairs',
      JSON.stringify([
        ['#000000', '#ffffff'],
        ['#949494', '#ffffff'], // the offender
      ]),
    ])
    expect(code).toBe(GATE)
    expect(out).toContain('#949494')
    expect(capture(['check', '--pairs', JSON.stringify([['#000000', '#ffffff']])]).code).toBe(OK)
  })

  it('a malformed hex is a usage error (exit 2), not a silent pass', () => {
    expect(capture(['check', '#000000', 'not-a-hex']).code).toBe(USAGE)
    expect(capture(['check', '--pairs', '[["#000000","nope"]]']).code).toBe(USAGE)
  })
})

// why: help and describe are first-class discovery surfaces — exit 0 on stdout so an
// agent's reflexive probe doesn't read as a failure, and `describe` is parseable.
describe('tonex — discovery surface', () => {
  it('help (bare / help / --help) prints usage to stdout at exit 0', () => {
    for (const argv of [[], ['help'], ['--help']]) {
      const { code, out } = capture(argv)
      expect(code).toBe(OK)
      expect(out).toMatch(/usage: tonex/)
    }
  })

  it('describe emits the parseable machine surface with the exit-code taxonomy', () => {
    const { code, out } = capture(['describe'])
    expect(code).toBe(OK)
    const payload = JSON.parse(out)
    expect(payload.exitCodes['2']).toBeDefined()
    expect(payload.commands.check).toBeDefined()
  })
})
