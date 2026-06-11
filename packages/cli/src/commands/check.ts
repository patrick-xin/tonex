// why: `check` is the contrast GATE — the authoritative WCAG verdict, overloaded
// across forms that share one exit-code contract (0 = clears the requested level,
// 1 = a TEXT pair fails). The forms cleave on one seam: theme-FREE (ad-hoc fg/bg
// hexes, `--pairs`) score raw via @tonex/color-utils; theme-AWARE (`--seed`,
// `--find-contrast`) derive then run @tonex/core/audit — the engine owns that
// scorer (the CLI never re-scores). The present flags pick the form.
import { argbFromHex, contrastRatio, isValidHex } from '@tonex/color-utils'
import { deriveTheme, type Mode, MODES } from '@tonex/core'
import {
  type AuditThemeResult,
  auditTheme,
  type EvaluatedAuditPair,
  type Level,
  levelThreshold,
} from '@tonex/core/audit'
import { DEFAULT_VARIANT } from '@tonex/core/variants'
import { flagValue, hasFlag, type ParsedArgs, parseArgs } from '../args'
import { HELP } from '../help'
import { GATE, type Io, OK, USAGE } from '../io'
import { parseSource, uniform } from '../source'
import { CHECK_FLAGS, isMode } from '../spec'

// why: `check` is the contrast GATE, overloaded across forms that share one
// exit-code contract (0 = clears the requested level, 1 = a TEXT pair fails). The
// flags are parsed once against the union schema (so a typo is caught here, not
// silently dropped); the present flags then pick the form.
export function check(argv: readonly string[], io: Io): number {
  const parsed = parseArgs(argv, CHECK_FLAGS)
  if (!parsed.ok) {
    io.err(parsed.message)
    return USAGE
  }
  const args = parsed.args

  if (hasFlag(args, '--find-contrast')) return findMinContrast(args, io)
  if (hasFlag(args, '--pairs')) return checkPairs(args, io)
  if (hasFlag(args, '--seed')) return checkTheme(args, io)
  return checkPair(args, io)
}

// why: the minimum-contrast ORACLE — answers "what --contrast level clears this
// level?" in ONE call. Without it an agent binary-searches by hand across many
// `check --aaa` runs (the baton's documented AAA remedy loop). Raising MCU's
// contrastLevel lifts the on-X/X tonal gaps monotonically, so we BISECT [0,1] for
// the fail→pass flip rather than scan. Three honest answers: already clears at the
// floor (no remedy), clears at a found level, or structurally unreachable even at
// max contrast (some container/large pairs can't reach AAA — fall back to AA).
function findMinContrast(args: ParsedArgs, io: Io): number {
  if (!hasFlag(args, '--seed')) {
    io.err(`tonex: --find-contrast needs --seed <hex>\n\n${HELP}\n`)
    return USAGE
  }
  const source = parseSource(args, io)
  if (typeof source === 'number') return source

  const mode = modeOf(args, io)
  if (typeof mode === 'number') return mode

  const level = levelOf(args)
  const LEVEL = level.toUpperCase()
  const scope = mode ? ` (${mode} only)` : ''
  const wantJson = hasFlag(args, '--json')
  // why: search varies ONLY contrastLevel — every other knob (variant/tint) stays
  // as the user set it, so the answer is the remedy for THIS theme, not a generic
  // one. `--mode` scopes the verdict to one projection (the same audit the gate
  // uses), so the remedy matches the single-mode yaml the agent emits.
  const clears = (c: number): boolean =>
    scopeAudit(auditTheme(deriveTheme({ ...source, contrastLevel: uniform(c) }), { level }), mode)
      .ok

  // already clears at the floor → no remedy needed (the AA seed-only case).
  if (clears(0)) {
    if (wantJson) {
      io.out(
        `${JSON.stringify({ mode: mode ?? 'both', level, reachable: true, minContrast: 0, alreadyClears: true }, null, 2)}\n`,
      )
    } else {
      io.out(`CLEAR — ${LEVEL}${scope} already passes at --contrast 0 (no remedy needed)\n`)
    }
    return OK
  }

  // unreachable → even max contrast leaves text pairs short; report how many.
  const atMax = scopeAudit(
    auditTheme(deriveTheme({ ...source, contrastLevel: uniform(1) }), { level }),
    mode,
  )
  if (!atMax.ok) {
    if (wantJson) {
      io.out(
        `${JSON.stringify({ mode: mode ?? 'both', level, reachable: false, minContrast: null, atMax: { failures: atMax.failures.length } }, null, 2)}\n`,
      )
    } else {
      io.out(
        `UNREACHABLE — ${LEVEL}${scope}: --contrast 1 still leaves ${atMax.failures.length} text pair(s) short\n  fix: gate at AA instead, or accept these as warnings\n`,
      )
    }
    return GATE
  }

  // bisect on the 0.01 GRID the user types into --contrast: find the SMALLEST
  // hundredth that clears. clears(0/100) is false (past the floor check) and
  // clears(100/100) is true (past the unreachable check), so the flip is between.
  // Searching the grid directly is grid-EXACT — no overshoot. (A continuous bisect
  // + Math.ceil reported 0.90 when 0.89 already passes: the ceil rounded a hi that
  // hadn't converged past the .89 boundary up to the next hundredth.)
  let lo = 0 // clears(lo / 100) === false
  let hi = 100 // clears(hi / 100) === true
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (clears(mid / 100)) hi = mid
    else lo = mid
  }
  const min = hi / 100

  if (wantJson) {
    io.out(
      `${JSON.stringify({ mode: mode ?? 'both', level, reachable: true, minContrast: min, alreadyClears: false }, null, 2)}\n`,
    )
    return OK
  }
  const seed = flagValue(args, '--seed')
  const variant = flagValue(args, '--variant') ?? DEFAULT_VARIANT
  const modeFlag = mode ? ` --mode ${mode}` : ''
  io.out(
    `FOUND — ${LEVEL}${scope} clears at --contrast ${min}\n  re-derive: generate --seed ${seed} --variant ${variant}${modeFlag} --contrast ${min}\n`,
  )
  return OK
}

// why: the whole-theme gate — derive then auditTheme, mapping the BLESSED verdict
// onto the exit code (0 iff no TEXT pair fails; non-text fails warn, never block).
// Output is the actionable DELTA, not a dashboard tally. These are tonex's OWN
// derived pairs, so the remedy is palette-layer (raise --contrast), not re-pairing.
function checkTheme(args: ParsedArgs, io: Io): number {
  const source = parseSource(args, io)
  if (typeof source === 'number') return source

  const mode = modeOf(args, io)
  if (typeof mode === 'number') return mode

  const level = levelOf(args)
  const result = scopeAudit(auditTheme(deriveTheme(source), { level }), mode)

  if (hasFlag(args, '--json')) {
    io.out(`${JSON.stringify({ mode: mode ?? 'both', ...leanReport(result) }, null, 2)}\n`)
    return result.ok ? OK : GATE
  }

  const LEVEL = level.toUpperCase()
  const scope = mode ? ` (${mode} only)` : ''
  if (result.ok) {
    io.out(`PASS — ${LEVEL} contrast${scope}\n`)
    return OK
  }

  const lines = result.failures.map(failureLine).join('\n')
  const hint =
    level === 'aaa'
      ? 'raise --contrast, or drop --aaa to gate at AA'
      : 'raise --contrast to strengthen the palette'
  let out = `FAIL — ${LEVEL} text contrast${scope}: ${result.failures.length} pair(s) below threshold\n${lines}\n  fix: ${hint}\n`
  if (result.warnings.length > 0) {
    out += `  (+${result.warnings.length} non-text warnings — advisory, see --json)\n`
  }
  io.out(out)
  return GATE
}

// why: the single-pair oracle — two positional hexes, no theme. Computes the raw
// WCAG ratio and compares it to the requested text threshold; prints the ratio so
// a failing answer is actionable, not a bare exit 1.
function checkPair(args: ParsedArgs, io: Io): number {
  const positionals = args.positionals
  if (positionals.length !== 2) {
    io.err(`tonex: check needs <fg> <bg> hex (or --seed / --pairs)\n\n${HELP}\n`)
    return USAGE
  }
  const [fg, bg] = positionals
  if (!isValidHex(fg) || !isValidHex(bg)) {
    io.err(`tonex: invalid hex in pair "${fg}" "${bg}" — use a 6-digit form, e.g. #ffffff\n`)
    return USAGE
  }

  const level = levelOf(args)
  const large = hasFlag(args, '--large')
  const threshold = textThreshold(level, large)
  const ratio = contrastRatio(argbFromHex(fg), argbFromHex(bg))
  const ok = ratio >= threshold

  if (hasFlag(args, '--json')) {
    io.out(
      `${JSON.stringify({ ok, level, large, threshold, fg, bg, ratio: round2(ratio) }, null, 2)}\n`,
    )
    return ok ? OK : GATE
  }
  io.out(`${verdictLine(ok, ratio, level, large, threshold)}\n`)
  return ok ? OK : GATE
}

// why: the batch oracle — `--pairs '[["#fff","#000"],…]'` verifies every pairing
// the agent is about to write in ONE call (inline JSON keeps `run` pure). On
// failure it ENUMERATES which pairs fell short + their ratios, so the agent re-rolls
// only the offenders. For tools that FUSE roles onto one slot, the caller must
// include every (fg,bg) that slot touches — this checks each listed pair on its own.
function checkPairs(args: ParsedArgs, io: Io): number {
  const raw = flagValue(args, '--pairs')
  if (raw === undefined) {
    io.err(`tonex: --pairs needs a JSON array of [fg, bg] hex pairs\n`)
    return USAGE
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    io.err(`tonex: --pairs is not valid JSON\n`)
    return USAGE
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    io.err(`tonex: --pairs must be a non-empty JSON array of [fg, bg] hex pairs\n`)
    return USAGE
  }
  const pairs: [string, string][] = []
  for (const p of parsed) {
    if (!Array.isArray(p) || p.length !== 2 || !isValidHex(p[0]) || !isValidHex(p[1])) {
      io.err(`tonex: each --pairs entry must be [fgHex, bgHex]; bad entry ${JSON.stringify(p)}\n`)
      return USAGE
    }
    pairs.push([p[0], p[1]])
  }

  const level = levelOf(args)
  const large = hasFlag(args, '--large')
  const threshold = textThreshold(level, large)
  const results = pairs.map(([fg, bg]) => {
    const ratio = contrastRatio(argbFromHex(fg), argbFromHex(bg))
    return { fg, bg, ratio, ok: ratio >= threshold }
  })
  const failures = results.filter((r) => !r.ok)
  const ok = failures.length === 0

  if (hasFlag(args, '--json')) {
    io.out(
      `${JSON.stringify(
        {
          ok,
          level,
          large,
          threshold,
          results: results.map((r) => ({ fg: r.fg, bg: r.bg, ratio: round2(r.ratio), ok: r.ok })),
        },
        null,
        2,
      )}\n`,
    )
    return ok ? OK : GATE
  }

  const label = `${level.toUpperCase()} ${large ? 'large text' : 'text'} (${threshold})`
  if (ok) {
    io.out(`PASS — ${results.length}/${results.length} pairs clear ${label}\n`)
    return OK
  }
  const lines = failures.map((r) => `  ${r.fg} on ${r.bg} — ${r.ratio.toFixed(2)}:1`).join('\n')
  io.out(
    `FAIL — ${label}: ${failures.length} of ${results.length} pairs below threshold\n${lines}\n`,
  )
  return GATE
}

// why: --aaa is the only level knob (AA is the default and needs no flag), shared
// across every check form so the agent threads one target level end to end.
function levelOf(args: ParsedArgs): Level {
  return hasFlag(args, '--aaa') ? 'aaa' : 'aa'
}

// why: --mode optionally scopes a theme audit to ONE projection. Absent → undefined
// (both modes, the stricter union). Validated against MODES; an unknown value is a
// usage error, returned as an exit code (after writing) so callers reuse the
// `typeof x === 'number'` early-return — undefined and the Mode string are not
// numbers, so the three cases stay distinct.
function modeOf(args: ParsedArgs, io: Io): Mode | undefined | number {
  const raw = flagValue(args, '--mode')
  if (raw === undefined) return undefined
  if (!isMode(raw)) {
    io.err(`tonex: unknown mode "${raw}"\n  one of: ${MODES.join(', ')}\n`)
    return USAGE
  }
  return raw
}

// why: narrow a whole-theme audit to one mode — the failures/warnings are already
// mode-tagged, so we filter and recompute `ok` (no TEXT fail in THIS mode). undefined
// keeps both modes (the default union). This is what lets the gate (and the
// find-contrast remedy) match a single-mode yaml artifact's granularity instead of
// over-blocking on a mode the output never carried.
function scopeAudit(result: AuditThemeResult, mode: Mode | undefined): AuditThemeResult {
  if (mode === undefined) return result
  const failures = result.failures.filter((p) => p.mode === mode)
  const warnings = result.warnings.filter((p) => p.mode === mode)
  return { ...result, ok: failures.length === 0, failures, warnings }
}

// why: WCAG text thresholds — normal text is 4.5 (AA) / 7 (AAA) per 1.4.3; large
// text drops to 3 / 4.5, numerically identical to the non-text tier, so we reuse
// levelThreshold's intent switch rather than re-listing the constants.
function textThreshold(level: Level, large: boolean): number {
  return levelThreshold(large ? 'non-text' : 'text', level)
}

function verdictLine(
  ok: boolean,
  ratio: number,
  level: Level,
  large: boolean,
  threshold: number,
): string {
  const label = `${level.toUpperCase()} ${large ? 'large text' : 'text'} (${threshold})`
  return `${ok ? 'PASS' : 'FAIL'} — ${ratio.toFixed(2)}:1 ${ok ? 'clears' : 'below'} ${label}`
}

// why: one failing audit pair as an actionable line — the role pairing (the unit
// the agent re-derives), the mode it failed in, and the gap (actual vs needed).
function failureLine(p: EvaluatedAuditPair): string {
  return `  ${p.mode.padEnd(5)} ${p.pair.fg} on ${p.pair.bg} — ${p.ratio.toFixed(2)}:1 (needs ${p.effectiveThreshold})`
}

// why: the lean --json report — ok/level plus flat, self-contained offender rows.
// An agent acts on what FAILS, not on a tally. failures block (text); warnings are
// advisory (non-text).
function leanReport(result: AuditThemeResult) {
  return {
    ok: result.ok,
    level: result.level,
    failures: result.failures.map(leanRow),
    warnings: result.warnings.map(leanRow),
  }
}

function leanRow(p: EvaluatedAuditPair) {
  return {
    mode: p.mode,
    layer: p.pair.layer,
    fg: p.pair.fg,
    bg: p.pair.bg,
    fgHex: p.fgHex,
    bgHex: p.bgHex,
    ratio: round2(p.ratio),
    threshold: p.effectiveThreshold,
  }
}

function round2(n: number): number {
  return Number(n.toFixed(2))
}
