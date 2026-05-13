import type { PairResult } from '@tonex/core'

export type Level = 'aa' | 'aaa'

export interface EvaluatedPair extends PairResult {
  fgHex: string
  bgHex: string
  effectiveThreshold: number
  effectivePasses: boolean
}
