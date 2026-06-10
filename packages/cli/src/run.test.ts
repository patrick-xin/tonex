import { describe, expect, it } from 'vitest'
import { run } from './run'

// why: the Slice 1 step A acceptance contract — the walking skeleton. It pins
// the command's OBSERVABLE behaviour (exit code + what it prints), not the
// exact CSS bytes: a clean seed derives a theme and prints shadcn CSS at exit
// 0; a bad/missing seed or unknown command exits 1 with a message. This proves
// the whole wire is live — package, arg parse, `@tonex/core` import, derive,
// print — without spawning a process. Richer params (`--variant`, `--mode`,
// `--format`) land in step B against this same `run` surface.

function capture(argv: string[]) {
  const out: string[] = []
  const err: string[] = []
  const code = run(argv, { out: (c) => out.push(c), err: (c) => err.push(c) })
  return { code, out: out.join(''), err: err.join('') }
}

describe('tonex generate — the walking skeleton', () => {
  it('derives a theme from --seed and prints shadcn CSS at exit 0', () => {
    const { code, out } = capture(['generate', '--seed', '#3b82f6'])
    expect(code).toBe(0)
    expect(out).toContain('--primary')
    expect(out).toContain('.dark')
  })

  it('routes the seed through the engine — different seeds give different CSS', () => {
    const a = capture(['generate', '--seed', '#3b82f6'])
    const b = capture(['generate', '--seed', '#ef4444'])
    expect(a.code).toBe(0)
    expect(b.code).toBe(0)
    expect(a.out).not.toBe(b.out)
  })

  it('missing --seed exits 1 with a message naming the seed flag', () => {
    const { code, err } = capture(['generate'])
    expect(code).toBe(1)
    expect(err).toMatch(/seed/i)
  })

  it('an invalid seed hex exits 1', () => {
    const { code, err } = capture(['generate', '--seed', 'not-a-hex'])
    expect(code).toBe(1)
    expect(err).toMatch(/invalid/i)
  })

  it('an unknown command exits 1 and points at the usage', () => {
    const { code, err } = capture(['frobnicate'])
    expect(code).toBe(1)
    expect(err).toMatch(/generate/i)
  })
})

// why: step B adds `--variant` (default cmf) and `--format json|css` (default
// css). Kept deliberately small — two cases that pin the load-bearing
// behaviour (the format switch works; a param actually reaches the engine)
// without over-specifying every default/error per flag, so adjusting one param
// later doesn't churn a wall of tests. (`--mode` is absent on purpose: css/json
// co-emit both modes, so mode only bites the single-mode design.md exporter at
// step D.)
describe('tonex generate — params (step B)', () => {
  const SEED = '#3b82f6'

  it('--format picks the output language (css by default, json on request)', () => {
    const css = capture(['generate', '--seed', SEED])
    expect(css.code).toBe(0)
    expect(css.out).toContain('--primary')

    const json = capture(['generate', '--seed', SEED, '--format', 'json'])
    expect(json.code).toBe(0)
    expect(() => JSON.parse(json.out)).not.toThrow()
  })

  it('--variant reaches the engine — a different scheme yields different output', () => {
    const cmf = capture(['generate', '--seed', SEED, '--variant', 'cmf'])
    const mono = capture(['generate', '--seed', SEED, '--variant', 'monochrome'])
    expect(mono.code).toBe(0)
    expect(mono.out).not.toBe(cmf.out)
  })
})

// why: step C wires Slice 0's `auditTheme` into a process gate — the second
// consumer of @tonex/core/audit. Small surface: the gate maps onto the exit
// code, and `--json` carries the verdict. (A failing gate isn't reachable via
// seed-only input — tonex passes by construction — so that branch is exercised
// at step E over foreign pairs, not here.)
describe('tonex check — the contrast gate (step C)', () => {
  it('audits the derived theme and exits 0 when it passes', () => {
    expect(capture(['check', '--seed', '#3b82f6']).code).toBe(0)
  })

  it('--json emits a parseable report carrying the ok verdict', () => {
    const { code, out } = capture(['check', '--seed', '#3b82f6', '--json'])
    expect(code).toBe(0)
    const report = JSON.parse(out)
    expect(report.ok).toBe(true)
    expect(report.summary).toBeDefined()
  })
})

// why: step C.5 adds the pair-check ORACLE — the in-loop machine answer to "does
// this fg/bg pairing clear contrast?" that stops an agent mis-pairing tokens when
// it projects our raw values into a foreign tool's slots. Theme-free (the agent
// already holds the hexes), so `check` overloads onto two new forms: a single
// positional pair and a batch `--pairs`, both honoring --aaa (level) and --large
// (text size). Kept small per [[feedback_minimal_robust_tests]] — one case per
// load-bearing branch (verdict+exit, level, size, batch enumeration), not a matrix.
describe('tonex check — the pair oracle (step C.5)', () => {
  it('verdicts a single fg/bg pair: clears AA → exit 0, fails AA → exit 1 with the ratio', () => {
    expect(capture(['check', '#000000', '#ffffff']).code).toBe(0)
    const fail = capture(['check', '#949494', '#ffffff']) // ~3.03
    expect(fail.code).toBe(1)
    expect(fail.out).toMatch(/3\.0/) // the failing ratio is reported, not a bare exit 1
  })

  it('--aaa raises the bar: a mid pair clears AA but fails AAA', () => {
    const pair = ['check', '#5b5b5b', '#ffffff'] // ~6.79
    expect(capture(pair).code).toBe(0) // clears AA text (4.5)
    expect(capture([...pair, '--aaa']).code).toBe(1) // but not AAA text (7)
  })

  it('--large relaxes to the large-text threshold', () => {
    const pair = ['check', '#ff0000', '#ffffff'] // ~4.0
    expect(capture(pair).code).toBe(1) // fails normal text (4.5)
    expect(capture([...pair, '--large']).code).toBe(0) // clears large text (3.0)
  })

  it('--pairs batch fails on any offender and names which pair failed', () => {
    const pairs = JSON.stringify([
      ['#000000', '#ffffff'],
      ['#949494', '#ffffff'], // ~3.03, the offender
    ])
    const { code, out } = capture(['check', '--pairs', pairs])
    expect(code).toBe(1)
    expect(out).toContain('#949494') // enumerated, so the agent's next move is targeted

    const allPass = capture(['check', '--pairs', JSON.stringify([['#000000', '#ffffff']])])
    expect(allPass.code).toBe(0)
  })

  it('rejects a malformed pair instead of silently passing', () => {
    expect(capture(['check', '#000000', 'not-a-hex']).code).toBe(1)
    expect(capture(['check', '--pairs', '[["#000000","nope"]]']).code).toBe(1)
  })
})

// why: step C.5 also exposes MCU's existing `contrastLevel` as a `--contrast
// <0..1>` flag — the palette-LAYER remedy (raise contrast, re-derive) for AAA
// pairs that re-mapping can't fix. Pure flag-plumbing through the shared
// parseSource (so `check --seed` honors it too); two cases — it reaches the
// engine, and the [0,1] bound is enforced.
describe('tonex generate — --contrast (step C.5)', () => {
  const SEED = '#3b82f6'

  it('--contrast reaches the engine — a raised level shifts the output', () => {
    const base = capture(['generate', '--seed', SEED])
    const high = capture(['generate', '--seed', SEED, '--contrast', '1'])
    expect(high.code).toBe(0)
    expect(high.out).not.toBe(base.out)
  })

  it('rejects an out-of-range contrast level', () => {
    expect(capture(['generate', '--seed', SEED, '--contrast', '5']).code).toBe(1)
  })
})
