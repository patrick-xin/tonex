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

  // why: cmf is the only MCU variant that reads a SECOND source color — it rebuilds
  // the TERTIARY palette from the second color's hue+chroma, leaving primary/secondary
  // untouched (the engine contract; the error-hue shift is bucket-sensitive and pinned
  // in core's derive.test.ts, not re-asserted here). The CLI surfaces it as
  // --second-color (core's cmfSecondSourceHex) through the same color firewall as
  // --seed, and pins it into the recipe so the theme re-derives exactly.
  it('--second-color reshapes the cmf tertiary palette only (not primary/secondary); pins into the recipe', () => {
    const base = JSON.parse(capture(['generate', '--seed', SEED, '--to', 'colors']).out)
    const r = capture(['generate', '--seed', SEED, '--to', 'colors', '--second-color', '#ff8800'])
    expect(r.code).toBe(OK)
    const second = JSON.parse(r.out)
    expect(second.light.tertiary).not.toBe(base.light.tertiary)
    expect(second.light.primary).toBe(base.light.primary)
    expect(second.light.secondary).toBe(base.light.secondary)
    // the recipe pins the second source so a later regenerate re-derives it
    const recipe = capture(['generate', '--seed', SEED, '--second-color', '#ff8800']).out
    expect(recipe).toContain("--second-color '#ff8800'")
  })

  // why: --second-color is a no-op on any non-cmf variant (other strategies ignore the
  // param). The CLI rejects it loudly (exit 2) rather than silently doing nothing — a
  // flag that runs the default theme unchanged is exactly the --varinat trap. A
  // malformed color is the same usage error as a bad --seed (shared color firewall).
  it('--second-color on a non-cmf variant is a usage error (exit 2), not a silent no-op', () => {
    const r = capture([
      'generate',
      '--seed',
      SEED,
      '--variant',
      'vibrant',
      '--second-color',
      '#ff8800',
    ])
    expect(r.code).toBe(USAGE)
    expect(r.err).toMatch(/CMF/i)
    expect(capture(['generate', '--seed', SEED, '--second-color', 'nope']).code).toBe(USAGE)
  })

  it('--to json emits a parseable document; --to yaml a single-mode colors: block', () => {
    const json = capture(['generate', '--seed', SEED, '--to', 'json'])
    expect(json.code).toBe(OK)
    expect(() => JSON.parse(json.out)).not.toThrow()

    const yaml = capture(['generate', '--seed', SEED, '--to', 'yaml'])
    expect(yaml.code).toBe(OK)
    expect(yaml.out).toContain('colors:')
    expect(yaml.out).not.toContain('.dark') // single-mode, not the dual css block
  })

  // why: the durable artifact (ADR-0039 Decision 7, amendment 2026-06-17) — the
  // runnable recipe rides INSIDE each delivered projection so a later agent
  // regenerates from the colors with nothing else to read. It is built from
  // RESOLVED values (--variant cmf appears though it was never typed) so a later
  // default change can't silently re-derive a different theme. --to colors is the
  // transient role read, not a delivered file, so it carries no recipe comment.
  it('embeds the runnable recipe in delivered targets (resolved knobs), not in --to colors', () => {
    const shadcn = capture(['generate', '--seed', SEED]).out
    expect(shadcn.startsWith('/* tonex generate ')).toBe(true)
    expect(shadcn).toContain(`--seed '${SEED}'`)
    expect(shadcn).toContain('--variant cmf') // resolved default, pinned against drift
    expect(shadcn).toContain('--to shadcn')

    const yaml = capture(['generate', '--seed', SEED, '--to', 'yaml', '--mode', 'dark']).out
    expect(yaml.startsWith('# tonex generate ')).toBe(true)
    expect(yaml).toContain('--to yaml --mode dark') // single-mode reproducibility

    const json = JSON.parse(capture(['generate', '--seed', SEED, '--to', 'json']).out)
    expect(json.description).toContain('tonex generate')
    expect(json.description).toContain('--to json')

    const colors = capture(['generate', '--seed', SEED, '--to', 'colors']).out
    expect(colors.startsWith('/*')).toBe(false)
    expect(colors.startsWith('#')).toBe(false)
  })

  it('the recipe pins applied surface knobs (tint + palette) so it re-derives exactly', () => {
    const out = capture([
      'generate',
      '--seed',
      SEED,
      '--to',
      'shadcn',
      '--tint',
      '0.4',
      '--tint-palette',
      'slate',
    ]).out
    expect(out).toContain('--tint 0.4')
    expect(out).toContain('--tint-palette slate')
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

  // why: --soft-borders re-asserts the soft edge token onto the three shadcn edge
  // roles (--border/--input/--sidebar-border) in both modes, layered on top of the
  // binding/default map. Consumed identically to --binding: only by --to shadcn,
  // noted-and-ignored elsewhere. Asserts the three edge values all changed together
  // (the borders softened) without hardcoding the oklch — core owns withSoftEdges.
  it('--soft-borders softens the three shadcn edge roles; cross-refs --color-outline-variant', () => {
    const edge = (out: string, token: string) =>
      out.match(new RegExp(`${token}:\\s*([^;]+);`))?.[1].trim()
    const EDGES = ['--border', '--input', '--sidebar-border'] as const

    const hard = capture(['generate', '--seed', SEED, '--to', 'shadcn'])
    const soft = capture(['generate', '--seed', SEED, '--to', 'shadcn', '--soft-borders'])
    expect(soft.code).toBe(OK)
    for (const token of EDGES) {
      const hardVal = edge(hard.out, token)
      const softVal = edge(soft.out, token)
      expect(hardVal).toBeTruthy()
      expect(softVal).toBeTruthy()
      expect(softVal).not.toBe(hardVal) // each edge actually softened
    }
    // soft maps every edge to --color-outline-variant, so all three now share a value
    const softValues = EDGES.map((t) => edge(soft.out, t))
    expect(new Set(softValues).size).toBe(1)
    // cross-ref: that shared value IS the outline-variant role from --to colors
    const colors = JSON.parse(capture(['generate', '--seed', SEED, '--to', 'colors']).out)
    expect(softValues[0]).toBe(colors.light['outline-variant'])
  })

  // why: --soft-borders is generate-only and shadcn-only — on a non-shadcn target it
  // is noted-and-ignored on stderr without crashing, mirroring --binding exactly. (Use
  // --to json, not yaml: the yaml branch returns before the note for BOTH flags — a
  // pre-existing --binding quirk this flag deliberately matches rather than fixes.)
  it('--soft-borders on a non-shadcn target is noted on stderr, exit 0 (like --binding)', () => {
    const r = capture(['generate', '--seed', SEED, '--to', 'json', '--soft-borders'])
    expect(r.code).toBe(OK)
    expect(r.err).toContain('--soft-borders is only consumed by --to shadcn')
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

// why: --custom adds user color(s) ON TOP of the seed-derived palette — MCU
// harmonizes each toward the seed and emits a contrast-guaranteed 4-role md
// group + a shadcn pair per entry. The agent-first JSON batch mirrors
// --pairs/--shifts. These pin the CLI's responsibility (parse → source →
// recipe → gate), not the engine's MCU math (pinned in core's
// custom-color.test.ts). "success" is a deliberately NON-reserved name.
describe('tonex custom colors', () => {
  const SEED = '#3b82f6'
  const SUCCESS = JSON.stringify([{ name: 'success', hex: '#22c55e' }])

  it('--custom emits the per-entry shadcn pair (--{slug}/--{slug}-foreground) and pins it into the recipe', () => {
    const r = capture(['generate', '--seed', SEED, '--custom', SUCCESS])
    expect(r.code).toBe(OK)
    expect(r.out).toContain('--success:')
    expect(r.out).toContain('--success-foreground:')
    // the recipe re-runs THIS projection — the custom entry rides inside it
    expect(r.out).toContain('--custom')
    expect(r.out).toContain('"name":"success"')
  })

  it('--custom pairs enter the contrast gate — check audits more pairs than the bare seed', () => {
    const passCount = (out: string) => Number(out.match(/(\d+) pairs clear/)?.[1])
    const base = capture(['check', '--seed', SEED])
    const withCustom = capture(['check', '--seed', SEED, '--custom', SUCCESS])
    expect(base.code).toBe(OK)
    expect(withCustom.code).toBe(OK)
    // the success color's on-X/X text pairs are now gated → strictly more pairs
    expect(passCount(withCustom.out)).toBeGreaterThan(passCount(base.out))
  })

  it('rejects a reserved name and malformed --custom as usage errors (exit 2), never a silent no-op', () => {
    const reserved = capture([
      'generate',
      '--seed',
      SEED,
      '--custom',
      JSON.stringify([{ name: 'primary', hex: '#000000' }]),
    ])
    expect(reserved.code).toBe(USAGE)
    expect(reserved.err).toMatch(/reserved/i)
    expect(capture(['generate', '--seed', SEED, '--custom', 'not-json']).code).toBe(USAGE)
    expect(capture(['generate', '--seed', SEED, '--custom', '[]']).code).toBe(USAGE) // empty batch
  })

  it('--custom hex takes the --seed color contract (hex or oklch); --to colors carries it (definition + derived roles)', () => {
    const viaOklch = capture([
      'generate',
      '--seed',
      SEED,
      '--to',
      'colors',
      '--custom',
      JSON.stringify([{ name: 'success', hex: 'oklch(0.72 0.19 150)' }]),
    ])
    expect(viaOklch.code).toBe(OK)
    // colors is self-describing: the DEFINITION rides in the `custom` block (the
    // re-derivation input, with the oklch projected to an sRGB hex) and the DERIVED
    // roles ride inline in both modes — so an agent binds custom values from colors.
    const colors = JSON.parse(viaOklch.out)
    expect(colors.custom).toEqual([
      expect.objectContaining({ name: 'success', blend: true, shadcnSource: 'color' }),
    ])
    expect(colors.custom[0].hex).toMatch(/^#[0-9a-f]{6}$/) // oklch → projected sRGB hex
    expect(colors.light).toHaveProperty('success')
    expect(colors.dark).toHaveProperty('on-success')
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

  // why: the operands accept the SAME color contract as --seed — a 6-digit hex OR a
  // canonical oklch(L C H) — so an agent can paste a shadcn/tweakcn color (oklch is
  // shadcn v4's native form) straight into the oracle without hand-converting. The
  // echoed color is the PROJECTED hex (the gamut-mapped sRGB actually scored), not the
  // raw oklch — the seed precedent: an out-of-gamut oklch is mapped before scoring, so
  // the verdict and the reported color are the same one.
  it('accepts canonical oklch operands like hex — same verdict as its projected hex', () => {
    const fg = 'oklch(0 0 0)' // ≈ black
    const bg = 'oklch(1 0 0)' // ≈ white
    const fgHex = hexFromColorInput(fg)
    const bgHex = hexFromColorInput(bg)
    expect(fgHex).not.toBeNull()
    const viaOklch = capture(['check', fg, bg])
    const viaHex = capture(['check', fgHex as string, bgHex as string])
    expect(viaOklch.code).toBe(OK)
    expect(viaOklch.out).toBe(viaHex.out) // identical verdict AND echoed (projected) color
  })

  it('--pairs accepts oklch entries too — a clean pair clears, a low-contrast one gates', () => {
    expect(
      capture(['check', '--pairs', JSON.stringify([['oklch(0 0 0)', 'oklch(1 0 0)']])]).code,
    ).toBe(OK)
    expect(
      capture(['check', '--pairs', JSON.stringify([['oklch(0.75 0 0)', 'oklch(1 0 0)']])]).code,
    ).toBe(GATE) // a light-grey-on-white pairing still fails the gate
  })
})

// why: `--foreground <fill>` derives the AA-safe on-color for an arbitrary literal
// fill (a brand swatch, a tool's hardcoded hex) via core's deriveForeground — the
// generator form, distinct from the two-positional VERIFY form. The crux is HONESTY:
// EVERY fill clears AA by construction (worst case ~4.58:1 from the better extreme),
// so the honest GATE path only bites at AAA (7:1), where a true mid-tone fill reaches
// neither side's bar; there the tool returns the max-contrast pick and reports
// truthfully (GATE), never claiming a pass it can't deliver.
describe('tonex check — foreground generator', () => {
  it('derives a foreground for an off-mid fill, clears AA (exit 0), and the round-trip verifies', () => {
    const FILL = '#6750a4'
    const { code, out } = capture(['check', '--foreground', FILL, '--json'])
    expect(code).toBe(OK)
    const r = JSON.parse(out)
    expect(r.ok).toBe(true)
    expect(r.ratio).toBeGreaterThanOrEqual(4.5)
    // the derived foreground, fed back through the VERIFY form, must itself pass.
    expect(capture(['check', r.foreground, r.fill]).code).toBe(OK)
  })

  it('a mid-tone fill at the AAA crossover takes the honest GATE path (exit 1) — no foreground can reach 7', () => {
    // why: WCAG math guarantees EVERY sRGB fill reaches 4.5 from black or white, so
    // the true unreachable band only bites at AAA (7): a mid-grey like #808080 tops
    // out near 5.3 from black, short of 7. The tool returns that max-contrast pick
    // and reports honestly rather than claiming a pass it can't deliver.
    const { code, out } = capture(['check', '--foreground', '#808080', '--aaa', '--json'])
    expect(code).toBe(GATE)
    const r = JSON.parse(out)
    expect(r.ok).toBe(false)
    expect(r.threshold).toBe(7)
    expect(r.ratio).toBeLessThan(7) // the max achievable, honestly below the AAA floor
    expect(r.foreground).toBeTruthy() // still returns the best pick, never empty
  })

  it('an invalid fill is a usage error (exit 2), not a silent pass', () => {
    expect(capture(['check', '--foreground', 'not-a-color']).code).toBe(USAGE)
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

  it('accepts bare md role names (the --to colors form) and never echoes the internal --color- id', () => {
    const r = capture([
      'check',
      '--seed',
      SEED,
      '--pairs',
      JSON.stringify([['on-surface', 'surface']]),
      '--json',
    ])
    expect(r.code).toBe(OK)
    const report = JSON.parse(r.out)
    expect(report.results.some((x: { fg: string }) => x.fg === 'on-surface')).toBe(true)
    expect(report.results.every((x: { fg: string }) => !x.fg.includes('--color-'))).toBe(true)
  })

  it('rejects the internal --color- id with a bare did-you-mean (exit 2)', () => {
    const r = capture([
      'check',
      '--seed',
      SEED,
      '--pairs',
      JSON.stringify([['--color-on-surface', '--color-surface']]),
    ])
    expect(r.code).toBe(USAGE)
    expect(r.err).toContain('bare role name')
    expect(r.err).toContain('on-surface')
  })
})

// why: `adjust` surfaces core's adjustTokens — it shifts named md tokens by a ±HCT
// delta and prints before/after FACTS. It never gates contrast, so the exit taxonomy
// is just 0 (clean) / 2 (bad call): a bad token name / malformed --shifts / missing
// --seed is USAGE, never GATE. Core owns the token-domain throw; the CLI maps it to 2.
describe('tonex adjust', () => {
  const SEED = '#3b82f6'
  const SHIFT = JSON.stringify([{ mode: 'light', token: 'primary', dTone: -5, dChroma: 3 }])

  it('shifts a bare-named token and prints before/after at exit 0; --format hex gives hex output', () => {
    const { code, out } = capture(['adjust', '--seed', SEED, '--shifts', SHIFT])
    expect(code).toBe(OK)
    expect(out).toMatch(/\bprimary\b/)
    expect(out).not.toContain('--color-') // output uses the bare public role, not the internal id
    expect(out).toMatch(/oklch\(.*\).*→.*oklch\(.*\)/) // default = oklch
    const hexOut = capture(['adjust', '--seed', SEED, '--shifts', SHIFT, '--format', 'hex'])
    expect(hexOut.out).toMatch(/#[0-9a-f]{6}.*→.*#[0-9a-f]{6}/i)
  })

  it('--json emits a parseable { shifts } report with before/after/achieved; --format controls encoding', () => {
    const { code, out } = capture(['adjust', '--seed', SEED, '--shifts', SHIFT, '--json'])
    expect(code).toBe(OK)
    const report = JSON.parse(out)
    expect(report.shifts).toHaveLength(1)
    expect(report.shifts[0].token).toBe('primary') // bare public role, not --color-primary
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
    const bad = JSON.stringify([{ mode: 'light', token: 'nope', dTone: -5 }])
    const r = capture(['adjust', '--seed', SEED, '--shifts', bad])
    expect(r.code).toBe(USAGE) // core's throw mapped to 2, not GATE
  })

  it('the internal --color- id is rejected with a bare did-you-mean (exit 2)', () => {
    // why: --color-* is the internal token id, not the public surface — adjust
    // takes the bare role name an agent reads from `--to colors`.
    const r = capture([
      'adjust',
      '--seed',
      SEED,
      '--shifts',
      JSON.stringify([{ mode: 'light', token: '--color-primary', dTone: 5 }]),
    ])
    expect(r.code).toBe(USAGE)
    expect(r.err).toContain('bare role name')
    expect(r.err).toContain('primary')
  })

  it('a shadcn role pasted from `generate --to shadcn` points at the md role to use (exit 2)', () => {
    // why: an agent copies --primary out of shadcn output → adjust must name the
    // bound md role (bare `primary`) and still exit 2, not throw a bare unknown.
    const r = capture([
      'adjust',
      '--seed',
      SEED,
      '--shifts',
      JSON.stringify([{ mode: 'light', token: '--primary', dTone: 5 }]),
    ])
    expect(r.code).toBe(USAGE)
    expect(r.err).toContain('--primary is a shadcn role')
    expect(r.err).toContain('did you mean primary') // the bare md role it binds to
  })

  it('bad calls are usage errors (exit 2): missing seed, bad --shifts JSON, no axis', () => {
    expect(capture(['adjust', '--shifts', SHIFT]).code).toBe(USAGE) // missing --seed
    expect(capture(['adjust', '--seed', SEED]).code).toBe(USAGE) // missing --shifts
    expect(capture(['adjust', '--seed', SEED, '--shifts', 'not-json']).code).toBe(USAGE)
    const noAxis = JSON.stringify([{ mode: 'light', token: 'primary' }])
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
