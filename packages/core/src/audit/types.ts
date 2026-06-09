import type { PairResult } from '../theme/contrast'

// why: the WCAG conformance level and the evaluated-pair shape are the shared
// vocabulary of the audit module — `Level` is the AA/AAA threshold knob,
// `EvaluatedPair` is a `PairResult` projected for a chosen level (hex strings +
// the effective threshold/pass recomputed by applyLevel). Lifted out of the www
// contrast-checker so the engine owns the verdict vocabulary; the www feature's
// presentational types (Filter, ResultFilter) stay in www and re-export `Level`
// + `EvaluatedPair` from here so its UI consumers don't churn.
export type Level = 'aa' | 'aaa'

export interface EvaluatedPair extends PairResult {
  fgHex: string
  bgHex: string
  effectiveThreshold: number
  effectivePasses: boolean
}
