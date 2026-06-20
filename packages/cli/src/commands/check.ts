// why: `check` is the contrast GATE — the authoritative WCAG verdict, overloaded
// across forms that share one exit-code contract (0 = clears the requested level,
// 1 = a TEXT pair fails). The forms cleave on one seam: theme-FREE (ad-hoc fg/bg
// hexes, `--pairs`) score raw via @tonex/color-utils; theme-AWARE (`--seed`,
// `--find-contrast`) derive then run @tonex/core/audit — the engine owns that
// scorer (the CLI never re-scores). The present flags pick the form.
import {
  argbFromHex,
  contrastRatio,
  hexFromColorInput,
  hexString,
  oklchString,
} from '@tonex/color-utils'
import { bareMdName, type ColorFormat, deriveTheme, MODES, type Mode } from '@tonex/core'
import {
  type AuditThemeResult,
  auditPairs,
  auditTheme,
  deriveForeground,
  type EvaluatedAuditPair,
  type Level,
  levelThreshold,
  resolveContrastPairs,
} from '@tonex/core/audit'
import { DEFAULT_VARIANT } from '@tonex/core/variants'
import { flagValue, hasFlag, type ParsedArgs, parseArgs } from '../args'
import { HELP } from '../help'
import { GATE, type Io, OK, USAGE } from '../io'
import { parseSource, uniform } from '../source'
import { CHECK_FLAGS, isColorFormat, isMode } from '../spec'

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
  if (hasFlag(args, '--foreground')) return checkForeground(args, io)
  // why: --pairs has two forms on one flag — without --seed the entries are raw
  // hexes scored theme-free; WITH --seed they are token NAMES resolved against
  // the derived theme and scored through the engine gate. Presence of --seed is
  // the switch (the agent copied token names out of `generate` output).
  if (hasFlag(args, '--pairs')) {
    return hasFlag(args, '--seed') ? checkNamedPairs(args, io) : checkPairs(args, io)
  }
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
    scopeAudit(
      auditTheme(deriveTheme({ ...source, contrastLevel: uniform(c) }), {
        level,
        customColors: source.customColors,
      }),
      mode,
    ).ok

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
    auditTheme(deriveTheme({ ...source, contrastLevel: uniform(1) }), {
      level,
      customColors: source.customColors,
    }),
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
  const fmt = formatOf(args, io)
  if (typeof fmt === 'number') return fmt
  // why: pass source.customColors so the gate appends each entry's text pairs
  // (on-color/color, on-container/container, shadcn -foreground/root) — the
  // contrast GUARANTEE is the whole point of adding a custom color, so an unsafe
  // user hex blocks at exit 1 like any other failing text pair.
  const result = scopeAudit(
    auditTheme(deriveTheme(source), { level, customColors: source.customColors }),
    mode,
  )

  if (hasFlag(args, '--json')) {
    io.out(`${JSON.stringify({ mode: mode ?? 'both', ...leanReport(result, fmt) }, null, 2)}\n`)
    return result.ok ? OK : GATE
  }

  const LEVEL = level.toUpperCase()
  const scope = mode ? ` (${mode} only)` : ''
  if (result.ok) {
    // why: a silent PASS leaves the agent no trace it gated — so the substantive
    // count goes on the line (the agent cites a number, not a bare verdict, which
    // makes a later "I checked" claim self-consistent). summary is the BOTH-modes
    // tally (scopeAudit spreads it through unchanged), so the count is only truthful
    // unscoped; when --mode narrows the audit we keep the scope tag and drop the
    // number rather than report a both-mode count under a one-mode label.
    const cleared = mode === undefined ? ` — ${result.summary.pass} pairs clear` : ''
    let out = `PASS — ${LEVEL} contrast${scope}${cleared}\n`
    // warnings ARE scope-correct (scopeAudit filters them), so a passing theme that
    // still carries non-text warnings says so — the PASS isn't "everything's clean".
    if (result.warnings.length > 0) {
      out += `  (+${result.warnings.length} non-text warning(s) — advisory, see --json)\n`
    }
    io.out(out)
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

// why: the single-pair oracle — two positional colors, no theme. Computes the raw
// WCAG ratio and compares it to the requested text threshold; prints the ratio so
// a failing answer is actionable, not a bare exit 1. Operands accept the same color
// contract as --seed (6-digit hex OR canonical oklch); hexFromColorInput projects
// both to the sRGB hex actually scored (an out-of-gamut oklch is gamut-mapped), so
// the echoed color matches the verdict.
function checkPair(args: ParsedArgs, io: Io): number {
  const positionals = args.positionals
  if (positionals.length !== 2) {
    io.err(`tonex: check needs <fg> <bg> color (or --seed / --pairs)\n\n${HELP}\n`)
    return USAGE
  }
  const fg = hexFromColorInput(positionals[0])
  const bg = hexFromColorInput(positionals[1])
  if (fg === null || bg === null) {
    io.err(
      `tonex: invalid color in pair "${positionals[0]}" "${positionals[1]}" — use a 6-digit hex (#ffffff) or canonical oklch(L C H)\n`,
    )
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

// why: the GENERATOR form — derive the AA-safe foreground for one literal fill
// (a brand swatch, a tool's hardcoded hex) via core's deriveForeground, then SCORE
// the result back. Distinct from the 2-positional VERIFY form: that proves a pairing,
// this MANUFACTURES one. The fill takes the same color contract as --seed (hex or
// canonical oklch); hexFromColorInput projects to the scored sRGB hex.
//
// HONESTY (the crux, mirroring findMinContrast's UNREACHABLE answer): for a fill at
// the luminance crossover (~mid-tone) NO foreground — not even pure black/white —
// can reach 4.5:1, so we never claim "AA by construction". deriveForeground always
// returns the MAX-contrast pick; here we score it and tell the truth — clears →
// PASS/exit 0, falls short → FAIL/exit 1 with the achieved ratio, the pick still
// printed so the caller has the best available color either way.
function checkForeground(args: ParsedArgs, io: Io): number {
  const raw = flagValue(args, '--foreground')
  const fill = raw === undefined ? null : hexFromColorInput(raw)
  if (fill === null) {
    io.err(
      `tonex: invalid --foreground fill "${raw ?? ''}" — use a 6-digit hex (#6750a4) or canonical oklch(L C H)\n`,
    )
    return USAGE
  }

  const level = levelOf(args)
  const large = hasFlag(args, '--large')
  const threshold = textThreshold(level, large)
  const fmt = formatOf(args, io)
  if (typeof fmt === 'number') return fmt

  const fillArgb = argbFromHex(fill)
  const fgArgb = deriveForeground(fillArgb, { ratio: threshold })
  const ratio = contrastRatio(fgArgb, fillArgb)
  const ok = ratio >= threshold
  const encode = fmt === 'oklch' ? oklchString : hexString
  const foreground = encode(fgArgb)

  if (hasFlag(args, '--json')) {
    io.out(
      `${JSON.stringify({ ok, level, large, threshold, fill, foreground, ratio: round2(ratio) }, null, 2)}\n`,
    )
    return ok ? OK : GATE
  }

  const label = `${level.toUpperCase()} ${large ? 'large text' : 'text'} (${threshold})`
  if (ok) {
    io.out(`PASS — foreground ${foreground} on ${fill} — ${ratio.toFixed(2)}:1 clears ${label}\n`)
    return OK
  }
  // honest UNREACHABLE: the returned foreground is the MAX-contrast pick; say so.
  io.out(
    `FAIL — foreground ${foreground} on ${fill} — ${ratio.toFixed(2)}:1 below ${label}\n  no foreground can reach ${threshold}:1 on this fill (its tone tops out at ${ratio.toFixed(2)}:1 from black/white); this is the max-contrast pick\n`,
  )
  return GATE
}

// why: the batch oracle — `--pairs '[["#fff","#000"],…]'` verifies every pairing
// the agent is about to write in ONE call (inline JSON keeps `run` pure). On
// failure it ENUMERATES which pairs fell short + their ratios, so the agent re-rolls
// only the offenders. For tools that FUSE roles onto one slot, the caller must
// include every (fg,bg) that slot touches — this checks each listed pair on its own.
// Each operand accepts a 6-digit hex OR a canonical oklch (the --seed contract);
// hexFromColorInput projects to the scored sRGB hex, so the rows echo what was scored.
function checkPairs(args: ParsedArgs, io: Io): number {
  const entries = parsePairsArray(flagValue(args, '--pairs'), io)
  if (typeof entries === 'number') return entries
  const pairs: [string, string][] = []
  for (const p of entries) {
    if (
      !Array.isArray(p) ||
      p.length !== 2 ||
      typeof p[0] !== 'string' ||
      typeof p[1] !== 'string'
    ) {
      io.err(`tonex: each --pairs entry must be [fg, bg]; bad entry ${JSON.stringify(p)}\n`)
      return USAGE
    }
    const fg = hexFromColorInput(p[0])
    const bg = hexFromColorInput(p[1])
    if (fg === null || bg === null) {
      io.err(
        `tonex: each --pairs entry must be [fg, bg] as 6-digit hex or canonical oklch(L C H); bad entry ${JSON.stringify(p)}\n`,
      )
      return USAGE
    }
    pairs.push([fg, bg])
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

// why: the token-NAME batch — `check --seed <hex> --pairs '[["--fg","--bg"],…]'`.
// The entries are token names the agent copied from `generate` output; --seed
// flips --pairs from the theme-FREE raw-hex path to this theme-AWARE one. We
// resolve the bare names to layer-tagged pairs in core (resolveContrastPairs —
// an unrecognized name comes back as a did-you-mean USAGE error, not a deep
// scorer throw), then score them through the SAME engine gate as the whole-theme
// audit (auditPairs), so a named-pair verdict and the gate can't disagree.
// Checked as TEXT (the legibility question); the canonical non-text pairs are the
// whole-theme gate's job, so --large doesn't apply here and is noted if passed.
function checkNamedPairs(args: ParsedArgs, io: Io): number {
  const entries = parsePairsArray(flagValue(args, '--pairs'), io)
  if (typeof entries === 'number') return entries
  const names: [string, string][] = []
  for (const p of entries) {
    if (
      !Array.isArray(p) ||
      p.length !== 2 ||
      typeof p[0] !== 'string' ||
      typeof p[1] !== 'string'
    ) {
      io.err(
        `tonex: each --pairs entry must be [fg, bg] token names; bad entry ${JSON.stringify(p)}\n`,
      )
      return USAGE
    }
    names.push([p[0], p[1]])
  }

  const source = parseSource(args, io)
  if (typeof source === 'number') return source
  const mode = modeOf(args, io)
  if (typeof mode === 'number') return mode

  if (hasFlag(args, '--large')) {
    io.err(`tonex: note — --large is ignored for token-name --pairs (checked as text)\n`)
  }

  const resolved = resolveContrastPairs(names)
  if (!resolved.ok) {
    io.err(`tonex: ${resolved.errors.join('\n       ')}\n`)
    return USAGE
  }

  const level = levelOf(args)
  const fmt = formatOf(args, io)
  if (typeof fmt === 'number') return fmt
  // why: auditPairs scores BOTH modes; a named pair fails if it fails in either
  // (unless --mode scopes the verdict to one). 'fail' ⇔ a failing TEXT pair, so
  // ok ⇔ every listed pair is legible in the audited mode(s).
  let results = auditPairs(deriveTheme(source), resolved.pairs, { level }).results
  if (mode) results = results.filter((r) => r.mode === mode)
  const failures = results.filter((r) => r.result === 'fail')
  const ok = failures.length === 0

  const scope = mode ? ` (${mode} only)` : ''
  if (hasFlag(args, '--json')) {
    io.out(
      `${JSON.stringify({ mode: mode ?? 'both', ok, level, results: results.map((r) => leanRow(r, fmt)) }, null, 2)}\n`,
    )
    return ok ? OK : GATE
  }

  const LEVEL = level.toUpperCase()
  if (ok) {
    io.out(`PASS — ${LEVEL} text contrast${scope}: ${names.length} named pair(s) clear\n`)
    return OK
  }
  // why: count the agent's INPUT pairs (deduped across modes), not the mode-rows
  // — they gave a short explicit list and think in those terms; the enumerated
  // lines below carry the per-mode detail.
  const failingPairs = new Set(failures.map((r) => `${r.pair.fg} ${r.pair.bg}`)).size
  const lines = failures.map(failureLine).join('\n')
  io.out(
    `FAIL — ${LEVEL} text contrast${scope}: ${failingPairs} of ${names.length} named pair(s) below threshold\n${lines}\n  fix: pair against a higher-contrast token, or raise --contrast\n`,
  )
  return GATE
}

// why: the shared --pairs reader — JSON parse + non-empty 2-tuple ARRAY shape,
// the part both forms share. The per-ENTRY check differs (hex vs token name) and
// stays in each caller so the error names what that form expects. Returns the
// raw entries or an exit code (already written to stderr).
function parsePairsArray(raw: string | undefined, io: Io): unknown[] | number {
  if (raw === undefined) {
    io.err(`tonex: --pairs needs a JSON array of [fg, bg] pairs\n`)
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
    io.err(`tonex: --pairs must be a non-empty JSON array of [fg, bg] pairs\n`)
    return USAGE
  }
  return parsed
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
// Token names are projected to the PUBLIC surface (bare md role, shadcn slot
// verbatim) so the agent can paste a named pair straight back into `--pairs`;
// the internal `--color-` id never reaches the output.
function failureLine(p: EvaluatedAuditPair): string {
  return `  ${p.mode.padEnd(5)} ${bareMdName(p.pair.fg)} on ${bareMdName(p.pair.bg)} — ${p.ratio.toFixed(2)}:1 (needs ${p.effectiveThreshold})`
}

// why: --format scopes the color encoding for the JSON rows — oklch (default) or
// hex. Validated here so check's JSON output follows the same contract as generate.
// Text output (token names + ratio) is always hex-free and unaffected.
function formatOf(args: ParsedArgs, io: Io): ColorFormat | number {
  const raw = flagValue(args, '--format')
  if (raw === undefined) return 'oklch'
  if (!isColorFormat(raw)) {
    io.err(`tonex: unknown format "${raw}"\n  one of: oklch, hex\n`)
    return USAGE
  }
  return raw
}

// why: the lean --json report — ok/level plus flat, self-contained offender rows.
// An agent acts on what FAILS, not on a tally. failures block (text); warnings are
// advisory (non-text).
function leanReport(result: AuditThemeResult, format: ColorFormat) {
  return {
    ok: result.ok,
    level: result.level,
    failures: result.failures.map((p) => leanRow(p, format)),
    warnings: result.warnings.map((p) => leanRow(p, format)),
  }
}

function leanRow(p: EvaluatedAuditPair, format: ColorFormat) {
  const encode = format === 'oklch' ? oklchString : hexString
  return {
    mode: p.mode,
    layer: p.pair.layer,
    // public token names (bare md role / shadcn slot) — never the internal --color- id
    fg: bareMdName(p.pair.fg),
    bg: bareMdName(p.pair.bg),
    fgColor: encode(p.fgArgb),
    bgColor: encode(p.bgArgb),
    ratio: round2(p.ratio),
    threshold: p.effectiveThreshold,
  }
}

function round2(n: number): number {
  return Number(n.toFixed(2))
}
