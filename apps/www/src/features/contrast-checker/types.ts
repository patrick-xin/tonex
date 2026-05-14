import type { PairResult } from '@tonex/core'

export type Level = 'aa' | 'aaa'
export type Filter = 'all' | 'text' | 'ui'
export type ResultFilter = 'all' | 'passed' | 'fail'

export interface EvaluatedPair extends PairResult {
  fgHex: string
  bgHex: string
  effectiveThreshold: number
  effectivePasses: boolean
}
