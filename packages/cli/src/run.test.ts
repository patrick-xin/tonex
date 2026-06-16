import { hexFromColorInput } from '@tonex/color-utils'
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

  it('--to colors emits the canonical colors.json: recipe header + both-mode role values; --format sets the encoding', () => {
    const colors = capture(['generate', '--seed', SEED, '--to', 'colors'])
    expect(colors.code).toBe(OK)
    const doc = JSON.parse(colors.out)
    // header is the re-derivable recipe; values are both modes, mode-major
    expect(doc.seed).toBe(SEED)
    expect(doc).toMatchObject({ variant: 'cmf', format: 'oklch' })
    expect(doc.light).toHaveProperty('primary')
    expect(doc.dark).toHaveProperty('primary')
    expect(doc.light.primary).toMatch(/^oklch\(/)
    // --format flips the encoding AND the file's self-declared format field
    const hex = JSON.parse(
      capture(['generate', '--seed', SEED, '--to', 'colors', '--format', 'hex']).out,
    )
    expect(hex.format).toBe('hex')
    expect(hex.light.primary).toMatch(/^#[0-9a-f]{6}$/)
  })

  // why: the roster is a capacity ladder — core (the sufficient baseline) is the
  // default, --extended widens to core + extended when a target needs more roles
  // than core covers (fixed/inverse/scrim, etc). colors honors the tier; shadcn's
  // roster is binding-fixed, so --extended is a no-op there (noted on stderr).
  it('--extended widens colors.json from the core baseline to the full roster', () => {
    const core = JSON.parse(capture(['generate', '--seed', SEED, '--to', 'colors']).out)
    expect(core.light).toHaveProperty('primary') // core role present
    expect(core.light).not.toHaveProperty('inverse-surface') // extended role absent by default
    expect(core.light).not.toHaveProperty('primary-fixed-dim')

    const wide = JSON.parse(
      capture(['generate', '--seed', SEED, '--to', 'colors', '--extended']).out,
    )
    expect(wide.light).toHaveProperty('inverse-surface') // extended role now present
    expect(wide.light).toHaveProperty('primary-fixed-dim')
    expect(Object.keys(wide.light).length).toBeGreaterThan(Object.keys(core.light).length)
  })

  it('--extended is a no-op for shadcn (binding-fixed roster), noted on stderr', () => {
    const r = capture(['generate', '--seed', SEED, '--to', 'shadcn', '--extended'])
    expect(r.code).toBe(OK)
    expect(r.err).toContain('--extended is ignored for shadcn')
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

  // why: --binding selects the shadcn role→md-token map (only applies to --to shadcn).
  // clean has card=surface (flat), layered has card=surface-container (elevated) — they differ.
  it('--binding changes the shadcn slot routing — clean differs from default', () => {
    const def = capture(['generate', '--seed', SEED, '--to', 'shadcn'])
    const clean = capture(['generate', '--seed', SEED, '--to', 'shadcn', '--binding', 'clean'])
    expect(clean.code).toBe(OK)
    expect(clean.out).not.toBe(def.out)
    expect(capture(['generate', '--seed', SEED, '--to', 'shadcn', '--binding', 'nope']).code).toBe(
      USAGE,
    )
  })

  // why: --tint-palette selects which Tailwind neutral the tint algo repaints surfaces
  // with — zinc and slate differ in hue so tint=0 (pure neutral) produces distinct
  // surface ramps. An unknown palette name is a usage error, not a silent zinc fallback.
  it('--tint-palette changes the neutral base — slate gives different surfaces than zinc at tint 0', () => {
    const zinc = capture(['generate', '--seed', SEED, '--tint', '0', '--tint-palette', 'zinc'])
    const slate = capture(['generate', '--seed', SEED, '--tint', '0', '--tint-palette', 'slate'])
    expect(zinc.code).toBe(OK)
    expect(slate.code).toBe(OK)
    expect(slate.out).not.toBe(zinc.out)
    expect(
      capture(['generate', '--seed', SEED, '--tint', '0', '--tint-palette', 'neon']).code,
    ).toBe(USAGE)
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

  // why: the seed accepts core's full color-input contract, not just hex — an agent
  // can paste a shadcn/tweakcn brand color (canonical `oklch(L C H)`) straight in.
  // Pins that the oklch is accepted AND routed through the seed (identical theme to
  // its hex projection), and that the colors.json header records the projected hex
  // (exactHex is the sRGB bytes, never the raw oklch — the seed is a lossy input).
  it('--seed accepts a canonical oklch, projecting it to the same theme as its hex', () => {
    const OKLCH = 'oklch(0.62 0.19 259)'
    const hex = hexFromColorInput(OKLCH)
    expect(hex).not.toBeNull()
    const viaOklch = capture(['generate', '--seed', OKLCH, '--to', 'colors'])
    expect(viaOklch.code).toBe(OK)
    const viaHex = capture(['generate', '--seed', hex as string, '--to', 'colors'])
    expect(viaOklch.out).toBe(viaHex.out)
    expect(JSON.parse(viaOklch.out).seed).toBe(hex) // header is the projected hex, not the oklch
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

  // why: a silent PASS leaves the agent no trace it ran the gate — so the next step
  // has no recollection of it. The PASS line carries the cleared-pair count so the
  // agent cites a substantive verdict (the count), not a bare "PASS".
  it('the PASS line carries the cleared-pair count as a citeable trace', () => {
    const out = capture(['check', '--seed', '#3b82f6']).out
    expect(out).toMatch(/PASS — AA contrast/)
    expect(out).toMatch(/\d+ pairs clear/)
  })

  // why: when a theme is derived from colors.json --format oklch, the agent holds
  // oklch values. --format on check/adjust controls fgColor/bgColor encoding (default
  // oklch) so the agent can correlate failure rows with the file without decoding hex.
  it('--format controls fgColor/bgColor encoding in JSON failures (default oklch)', () => {
    // --aaa on this seed has failures without --contrast raise
    const defaultOut = JSON.parse(capture(['check', '--seed', SEED, '--aaa', '--json']).out)
    const hexOut = JSON.parse(
      capture(['check', '--seed', SEED, '--aaa', '--json', '--format', 'hex']).out,
    )
    expect(defaultOut.failures.length).toBeGreaterThan(0)
    for (const r of defaultOut.failures) expect(r.fgColor).toMatch(/^oklch\(/) // default = oklch
    for (const r of hexOut.failures) expect(r.fgColor).toMatch(/^#[0-9a-f]{6}$/i)
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

// why: with --seed, --pairs entries are token NAMES the agent copied from
// `generate` output — resolved against the derived theme and scored through the
// engine gate (not raw hex). The exit taxonomy splits cleanly: a failing named
// pair is GATE (the artifact), an unrecognized name is USAGE (the call).
describe('tonex check — token-name pairs (theme-aware --pairs)', () => {
  const SEED = '#3b82f6'

  it('--seed flips --pairs to token names: a designed text pair clears, a subtle one fails by name', () => {
    const pass = capture([
      'check',
      '--seed',
      SEED,
      '--pairs',
      JSON.stringify([['--foreground', '--background']]),
    ])
    expect(pass.code).toBe(OK)
    const fail = capture([
      'check',
      '--seed',
      SEED,
      '--pairs',
      JSON.stringify([['--muted', '--background']]), // a subtle surface read as text
    ])
    expect(fail.code).toBe(GATE)
    expect(fail.out).toContain('--muted')
  })

  it('an unknown token name is a usage error (exit 2) with a did-you-mean, not a silent pass', () => {
    const r = capture([
      'check',
      '--seed',
      SEED,
      '--pairs',
      JSON.stringify([['--foregroundd', '--background']]),
    ])
    expect(r.code).toBe(USAGE)
    expect(r.err).toContain('did you mean')
    expect(r.err).toContain('"--foreground"') // the suggested token
  })
})

// why: `adjust` surfaces core's adjustTokens — it shifts named md tokens by a ±HCT
// delta and prints before/after FACTS. It never gates contrast, so the exit taxonomy
// is just 0 (clean) / 2 (bad call): a bad token name / malformed --shifts / missing
// --seed is USAGE, never GATE. Core owns the token-domain throw; the CLI maps it to 2.
describe('tonex adjust', () => {
  const SEED = '#3b82f6'
  const SHIFT = JSON.stringify([{ mode: 'light', token: '--color-primary', dTone: -5, dChroma: 3 }])

  it('shifts a named token and prints before/after at exit 0; --format hex gives hex output', () => {
    const { code, out } = capture(['adjust', '--seed', SEED, '--shifts', SHIFT])
    expect(code).toBe(OK)
    expect(out).toContain('--color-primary')
    expect(out).toMatch(/oklch\(.*\).*→.*oklch\(.*\)/) // default = oklch
    const hexOut = capture(['adjust', '--seed', SEED, '--shifts', SHIFT, '--format', 'hex'])
    expect(hexOut.out).toMatch(/#[0-9a-f]{6}.*→.*#[0-9a-f]{6}/i)
  })

  it('--json emits a parseable { shifts } report with before/after/achieved; --format controls encoding', () => {
    const { code, out } = capture(['adjust', '--seed', SEED, '--shifts', SHIFT, '--json'])
    expect(code).toBe(OK)
    const report = JSON.parse(out)
    expect(report.shifts).toHaveLength(1)
    expect(report.shifts[0].before).toMatch(/^oklch\(/) // default = oklch
    expect(report.shifts[0].after).toMatch(/^oklch\(/)
    expect(report.shifts[0].achieved).toBeDefined()
    const hex = JSON.parse(
      capture(['adjust', '--seed', SEED, '--shifts', SHIFT, '--json', '--format', 'hex']).out,
    )
    expect(hex.shifts[0].before).toMatch(/^#[0-9a-f]{6}$/i)
    expect(hex.shifts[0].after).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('an unknown token name is a usage error (exit 2), never a gate', () => {
    const bad = JSON.stringify([{ mode: 'light', token: '--color-nope', dTone: -5 }])
    const r = capture(['adjust', '--seed', SEED, '--shifts', bad])
    expect(r.code).toBe(USAGE) // core's throw mapped to 2, not GATE
  })

  it('a shadcn role pasted from `generate --to shadcn` points at the md token to use (exit 2)', () => {
    // why: an agent copies --primary out of shadcn output → adjust must name the
    // bound md token (--color-primary) and still exit 2, not throw a bare unknown.
    const r = capture([
      'adjust',
      '--seed',
      SEED,
      '--shifts',
      JSON.stringify([{ mode: 'light', token: '--primary', dTone: 5 }]),
    ])
    expect(r.code).toBe(USAGE)
    expect(r.err).toContain('--primary is a shadcn role')
    expect(r.err).toContain('--color-primary') // the md token it binds to
  })

  it('bad calls are usage errors (exit 2): missing seed, bad --shifts JSON, no axis', () => {
    expect(capture(['adjust', '--shifts', SHIFT]).code).toBe(USAGE) // missing --seed
    expect(capture(['adjust', '--seed', SEED]).code).toBe(USAGE) // missing --shifts
    expect(capture(['adjust', '--seed', SEED, '--shifts', 'not-json']).code).toBe(USAGE)
    const noAxis = JSON.stringify([{ mode: 'light', token: '--color-primary' }])
    expect(capture(['adjust', '--seed', SEED, '--shifts', noAxis]).code).toBe(USAGE)
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
    expect(payload.commands.adjust).toBeDefined() // surfaced from the same specs
  })

  // why: describe is the MACHINE surface, so a flag's default must be a citeable
  // field — an agent shouldn't have to regex "(default shadcn)" out of prose to know
  // what omitting the flag yields. Value flags carry it (contrast as a number, honest);
  // booleans don't (absence = off, implied by the type); check's --mode default is the
  // out-of-enum "both", which the field captures where the values list can't.
  it('flags expose the default as a structured field, not buried in the description', () => {
    const { out } = capture(['describe'])
    const payload = JSON.parse(out)
    const byName = (flags: Array<{ name: string; description: string }>) =>
      new Map(flags.map((f) => [f.name, f]))
    const gen = byName(payload.commands.generate.flags)

    expect(gen.get('--to')).toMatchObject({ default: 'shadcn' })
    expect(gen.get('--variant')).toMatchObject({ default: 'cmf' })
    expect(gen.get('--contrast')).toMatchObject({ default: 0 }) // numeric, not "0"

    // the value is gone from the prose — the field is the single source now
    expect(gen.get('--to')?.description).not.toMatch(/default/i)
    expect(gen.get('--contrast')?.description).not.toMatch(/default/i)

    // check's --mode default is "both" — outside the light|dark enum, still citeable
    expect(byName(payload.commands.check.flags).get('--mode')).toMatchObject({ default: 'both' })

    // booleans carry no default field (absence = off)
    expect(gen.get('--extended')).not.toHaveProperty('default')
  })

  // why: the flat variant NAMES already ride on the --variant flag's `values`; what
  // describe.variants must carry instead is the taxonomy the flag enum can't — group
  // → names in canonical order, so an agent picks a feel ("more vivid") and resolves
  // it to a variant without guessing. Pins the shape + that the group tag is wired.
  it('describe.variants is the group taxonomy, not a flat name list', () => {
    const { out } = capture(['describe'])
    const { variants } = JSON.parse(out)
    expect(Object.keys(variants)).toEqual(['cmf', 'standard', 'expressive', 'subdued'])
    expect(variants.cmf).toContain('cmf')
    expect(variants.expressive).toContain('vibrant')
  })
})
