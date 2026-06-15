// why: `adjust` surfaces core's `adjustTokens` — it shifts named md tokens by a
// relative ±HCT delta (tone+chroma together, no hue axis) and prints before/after
// FACTS plus the gamut-clamped ACHIEVED delta. It is a pure READER: it never gates
// contrast (that stays a separate `tonex check` step — ADR-0039 c.5) and never
// persists (applyAdjustments is a later slice). So its exit taxonomy is just 0
// (clean) / 2 (bad call) — never 1. The CLI is the boundary that catches core's
// domain throws (unknown token / invalid mode / no-axis request) and maps them to
// exit 2; it does NOT re-validate the token domain (surface, don't reimplement).
import { argbFromHex, hexString, oklchString } from '@tonex/color-utils'
import { type ColorFormat } from '@tonex/core'
import { adjustTokens, type AdjustRequest, type AdjustResult } from '@tonex/core/adjust'
import { flagValue, hasFlag, parseArgs, type ParsedArgs } from '../args'
import { type Io, OK, USAGE } from '../io'
import { parseSource } from '../source'
import { ADJUST_FLAGS, isColorFormat } from '../spec'

// why: the batch surface mirrors core's `adjustTokens` shape and the existing
// `--pairs` JSON precedent — the caller is an agent that emits JSON, not a human
// typing scalars (ADR-0039 c.1). One flag (`--shifts`), one code path; no scalar
// `--token/--tone/--chroma` form to keep the input contract single.
export function adjust(argv: readonly string[], io: Io): number {
  const parsed = parseArgs(argv, ADJUST_FLAGS)
  if (!parsed.ok) {
    io.err(parsed.message)
    return USAGE
  }
  const args = parsed.args

  // why: the same seed→theme resolver every command uses — `adjust` shifts off the
  // theme `generate` would produce. Returns an exit code (already written) on a bad
  // seed/variant/surface flag, all exit 2.
  const source = parseSource(args, io)
  if (typeof source === 'number') return source

  const requests = parseShifts(flagValue(args, '--shifts'), io)
  if (typeof requests === 'number') return requests

  // why: catch core's domain throws (unknown token, invalid mode, no-axis) at the
  // CLI boundary and map them to exit 2 — the call is wrong, fix the --shifts entry.
  // adjustTokens never returns a failing-contrast verdict, so there is no GATE path.
  let results: AdjustResult[]
  try {
    results = adjustTokens(source, requests)
  } catch (e) {
    io.err(`tonex: ${e instanceof Error ? e.message : String(e)}\n`)
    return USAGE
  }

  const fmt = formatOf(args, io)
  if (typeof fmt === 'number') return fmt

  if (hasFlag(args, '--json')) {
    io.out(`${JSON.stringify({ shifts: results.map((r) => leanRow(r, fmt)) }, null, 2)}\n`)
    return OK
  }

  io.out(`${results.map((r) => line(r, fmt)).join('\n')}\n`)
  return OK
}

// why: --format scopes the color encoding for before/after values — oklch (default)
// or hex. Matches generate and check so a recipe runs through one encoding consistently.
function formatOf(args: ParsedArgs, io: Io): ColorFormat | number {
  const raw = flagValue(args, '--format')
  if (raw === undefined) return 'oklch'
  if (!isColorFormat(raw)) {
    io.err(`tonex: unknown format "${raw}"\n  one of: oklch, hex\n`)
    return USAGE
  }
  return raw
}

// why: the --shifts reader — JSON parse + non-empty ARRAY shape, then a per-ENTRY
// SHAPE check (string token + string mode + finite dTone/dChroma, at least one
// axis). This is the "malformed delta" guard: JSON can carry anything, so a bad
// SHAPE is a usage error caught here. The DOMAIN validity of token/mode is core's
// job (adjustTokens throws → exit 2), so we only cast to the typed AdjustRequest.
// Returns the typed requests or an exit code (already written to stderr).
function parseShifts(raw: string | undefined, io: Io): AdjustRequest[] | number {
  if (raw === undefined) {
    io.err(`tonex: --shifts needs a JSON array of {mode, token, dTone?, dChroma?} objects\n`)
    return USAGE
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    io.err(`tonex: --shifts is not valid JSON\n`)
    return USAGE
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    io.err(`tonex: --shifts must be a non-empty JSON array of shift objects\n`)
    return USAGE
  }

  const requests: AdjustRequest[] = []
  for (const entry of parsed) {
    if (typeof entry !== 'object' || entry === null) {
      io.err(`tonex: each --shifts entry must be an object; bad entry ${JSON.stringify(entry)}\n`)
      return USAGE
    }
    const e = entry as Record<string, unknown>
    if (typeof e.token !== 'string' || typeof e.mode !== 'string') {
      io.err(
        `tonex: each --shifts entry needs a string "token" and "mode"; bad entry ${JSON.stringify(entry)}\n`,
      )
      return USAGE
    }
    if (e.dTone !== undefined && !Number.isFinite(e.dTone)) {
      io.err(`tonex: --shifts dTone must be a finite number; bad entry ${JSON.stringify(entry)}\n`)
      return USAGE
    }
    if (e.dChroma !== undefined && !Number.isFinite(e.dChroma)) {
      io.err(`tonex: --shifts dChroma must be a finite number; bad entry ${JSON.stringify(entry)}\n`)
      return USAGE
    }
    if (e.dTone === undefined && e.dChroma === undefined) {
      io.err(
        `tonex: each --shifts entry needs at least one of dTone / dChroma; bad entry ${JSON.stringify(entry)}\n`,
      )
      return USAGE
    }
    // why: cast mode/token to their types — the DOMAIN validity (is this a real md
    // token / a valid mode?) is core's gate, not ours. Shape is what we own here.
    requests.push({
      mode: e.mode as AdjustRequest['mode'],
      token: e.token as AdjustRequest['token'],
      ...(e.dTone !== undefined ? { dTone: e.dTone as number } : {}),
      ...(e.dChroma !== undefined ? { dChroma: e.dChroma as number } : {}),
    })
  }
  return requests
}

// why: one shift as a scannable line — mode, token, before → after, and the
// requested vs ACHIEVED delta side by side (so a gamut-clamped divergence is
// visible in the numbers, no separate warning needed). Signed, 1-decimal deltas.
function line(r: AdjustResult, format: ColorFormat): string {
  const encode = format === 'oklch' ? oklchString : hexString
  const before = encode(argbFromHex(r.before))
  const after = encode(argbFromHex(r.after))
  return `${r.mode.padEnd(5)} ${r.token}  ${before} → ${after}   req ${delta(r.requested)}   got ${delta(r.achieved)}`
}

function delta(d: { dTone: number; dChroma: number }): string {
  return `t${signed(d.dTone)} c${signed(d.dChroma)}`
}

function signed(n: number): string {
  const v = round2(n)
  return v >= 0 ? `+${v}` : `${v}`
}

// why: the lean --json row — before/after encoded per --format + requested verbatim
// (the exact ask), achieved rounded for readability (the honest gamut-clamped truth).
// Mirrors `check --json`'s round2-for-display shape.
function leanRow(r: AdjustResult, format: ColorFormat) {
  const encode = format === 'oklch' ? oklchString : hexString
  return {
    mode: r.mode,
    token: r.token,
    before: encode(argbFromHex(r.before)),
    after: encode(argbFromHex(r.after)),
    requested: r.requested,
    achieved: { dTone: round2(r.achieved.dTone), dChroma: round2(r.achieved.dChroma) },
  }
}

function round2(n: number): number {
  return Number(n.toFixed(2))
}
