import type { PairResult } from '@tonex/core'

export type Level = 'aa' | 'aaa'
export type Layer = 'md' | 'shadcn'

export interface EvaluatedPair extends PairResult {
  fgHex: string
  bgHex: string
  effectiveThreshold: number
  effectivePasses: boolean
}
