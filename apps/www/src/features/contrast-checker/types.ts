import type { PairResult } from '@tonex/core'

export type Level = 'aa' | 'aaa'
export type Filter = 'all' | 'text' | 'ui'
// why: mirrors Result minus 'none' (decorative is exempt, never a triaged
// outcome) so the filter matches with `resultOf(p) === resultFilter` — the same
// classifier the row badge reads. Keeps filter ⇄ badge from drifting (issue #1).
export type ResultFilter = 'all' | 'pass' | 'fail' | 'warn'

export interface EvaluatedPair extends PairResult {
  fgHex: string
  bgHex: string
  effectiveThreshold: number
  effectivePasses: boolean
}
