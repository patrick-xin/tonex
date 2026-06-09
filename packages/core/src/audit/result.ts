import { isDecorative } from './decorative'
import type { EvaluatedPair } from './types'

// why: the result/severity axis is THE source of truth for the audit — the
// gate, the status badge, the summary tally, and the row filter all map from
// these four values, so none can drift into its own vocabulary (the bug issue
// #1 exposed). The values are semantic, NOT presentational: pass = clears the
// bar, fail = text too faint (must fix — the only result that blocks the gate),
// warn = a UI/non-text judgment call (reported, never blocks), none =
// decorative/exempt (no WCAG requirement). The www feature layers presentation
// (RESULT labels/badge classes) on top of this core vocabulary.
export type Result = 'pass' | 'fail' | 'warn' | 'none'

// why: the single classification point — resolves a pair's evaluation into one
// result. Decorative short-circuits (no WCAG requirement); then pass; then a
// fail splits by role — failing text is 'fail' (must fix, the gate-blocking
// outcome), failing non-text is 'warn' (judgment call). Mirrors
// summarizeContrast's textFail/uiFail split so the tally and the per-pair
// verdicts always agree.
export function resultOf(p: EvaluatedPair): Result {
  if (isDecorative(p.pair)) return 'none'
  if (p.effectivePasses) return 'pass'
  return p.pair.intent === 'text' ? 'fail' : 'warn'
}
