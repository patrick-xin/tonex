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
