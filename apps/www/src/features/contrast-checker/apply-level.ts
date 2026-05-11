import type { PairResult } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { EvaluatedPair, Level } from './types'

// why: AA/AAA toggle is a runtime threshold override on top of the
// per-pair `pair.threshold` baked into CONTRAST_PAIRS. Text pairs use
// 4.5/7 (WCAG 1.4.3), non-text uses 3/4.5 (WCAG 1.4.11).
export function applyLevel(p: PairResult, level: Level): EvaluatedPair {
  const isText = p.pair.intent === 'text'
  const threshold = isText ? (level === 'aaa' ? 7 : 4.5) : level === 'aaa' ? 4.5 : 3
  return {
    ...p,
    fgHex: hexString(p.fgArgb),
    bgHex: hexString(p.bgArgb),
    effectiveThreshold: threshold,
    effectivePasses: p.ratio >= threshold,
  }
}
