// why: the `./audit` subpath — the verdict layer lifted out of the www
// contrast-checker so the engine owns the WCAG gate, not the web app. Two
// functions, one scorer:
//   - `auditPairs` is the PRIMITIVE — audit an ARBITRARY ContrastPair list
//     against a derived theme (the foreign-fill / CLI `check` path). It runs
//     `buildReport` (the uncached engine scorer) so any pair list is fair game.
//   - `auditTheme` is the GATE over the canonical CONTRAST_PAIRS (the static
//     spec set), wired through `evaluateThemeContrast`'s WeakMap-cached path
//     and its includeBrand / customColors opt-ins.
//
// BLESSED gate policy (the heart of the contract): `ok` fails on TEXT failures
// ONLY. A failing non-text/UI pair is reported as a `warn` but NEVER blocks —
// `ok` stays true. Decorative pairs (the outline-variant set) are exempt:
// classified 'none', counted in summary.exempt, never in pass/textFail/uiFail.
// Both functions share `resultOf`, whose 'fail' ⇔ failing-text invariant is
// what makes the two gates agree (auditTheme.ok === auditPairs(…).ok over the
// same list) — the single-scorer guarantee, no second classifier.

import {
  buildReport,
  type ContrastPair,
  type ContrastReport,
  evaluateThemeContrast,
} from '../theme/contrast'

// why: bare token-name → ContrastPair resolution lives in contrast/pairs.ts (it
// builds pairs from core's token vocabulary) but is re-exported here so the
// CLI's `check --seed --pairs` form imports the resolver and `auditPairs` from
// the one `@tonex/core/audit` surface — resolve names, then score them through
// the same engine gate as the whole-theme audit.
export {
  type ResolveContrastPairsResult,
  resolveContrastPairs,
} from '../theme/contrast'

import type { CustomColorEntry } from '../theme/custom-color/entry'
import type { DerivedTheme } from '../theme/derive'
import { MODES, type Mode } from '../theme/mode'
import { applyLevel } from './apply-level'
import type { Result } from './result'
import { resultOf } from './result'
import { type ContrastSummary, summarizeContrast } from './summary'
import type { EvaluatedPair, Level } from './types'

// why: the `@tonex/core/audit` public surface re-exports the moved helpers so
// the www contrast-checker (and the future CLI) consume one engine-owned module
// instead of reaching into sibling files. The two audit functions live below.
export { applyLevel, levelThreshold } from './apply-level'
export { isDecorative } from './decorative'
export { type DeriveForegroundOptions, deriveForeground } from './foreground'
export { type Result, resultOf } from './result'
export { type ContrastSummary, summarizeContrast } from './summary'
export type { EvaluatedPair, Level } from './types'

// why: an audited pair = the level-applied evaluation plus the mode it was
// scored in and its resolved verdict. Composed from the moved types — no
// duplicate shape lives here (single source).
export type EvaluatedAuditPair = EvaluatedPair & { mode: Mode; result: Result }

export interface AuditPairsResult {
  ok: boolean
  results: readonly EvaluatedAuditPair[]
}

export interface AuditThemeResult {
  ok: boolean
  level: Level
  failures: readonly EvaluatedAuditPair[]
  warnings: readonly EvaluatedAuditPair[]
  exempt: number
  summary: ContrastSummary
}

// why: flatten a two-mode ContrastReport into one verdict-tagged row list —
// each PairResult is level-applied, mode-stamped, and classified by the shared
// `resultOf`. Both audit functions share this so the per-pair shape and the
// classifier can't diverge between the primitive and the gate.
function flatten(report: ContrastReport, level: Level): EvaluatedAuditPair[] {
  return MODES.flatMap((mode) =>
    report[mode].map((p) => {
      const e = applyLevel(p, level)
      return { ...e, mode, result: resultOf(e) }
    }),
  )
}

// why: the primitive — score any ContrastPair list against `theme` via the
// uncached `buildReport`, then apply the text-only gate. `resultOf` returns
// 'fail' ONLY for a failing text pair, so `every(r => r.result !== 'fail')` is
// exactly "no text pair failed" — a failing non-text pair is a 'warn' and keeps
// `ok` true (BLESSED policy).
export function auditPairs(
  theme: DerivedTheme,
  pairs: readonly ContrastPair[],
  { level = 'aa' }: { level?: Level } = {},
): AuditPairsResult {
  const results = flatten(buildReport(theme, pairs), level)
  const ok = results.every((r) => r.result !== 'fail')
  return { ok, results }
}

// why: the gate over the static spec set — runs `evaluateThemeContrast` (the
// cached path; appends custom/brand pairs per its existing opt-in semantics),
// flattens identically to auditPairs, then partitions exempt ('none') from
// functional rows. `ok` is wired to `summary.textFail === 0` — the same
// text-only policy as auditPairs, expressed through the tally. failures are the
// text fails (block); warnings are the non-text fails (reported, never block).
export function auditTheme(
  theme: DerivedTheme,
  {
    level = 'aa',
    customColors = [],
    includeBrand,
  }: {
    level?: Level
    customColors?: readonly CustomColorEntry[]
    includeBrand?: boolean
  } = {},
): AuditThemeResult {
  const rows = flatten(evaluateThemeContrast(theme, customColors, { includeBrand }), level)
  const exemptRows = rows.filter((r) => r.result === 'none')
  const functional = rows.filter((r) => r.result !== 'none')
  const summary = summarizeContrast(functional, exemptRows.length)
  const ok = summary.textFail === 0
  const failures = functional.filter((r) => r.result === 'fail')
  const warnings = functional.filter((r) => r.result === 'warn')
  return { ok, level, failures, warnings, exempt: summary.exempt, summary }
}
