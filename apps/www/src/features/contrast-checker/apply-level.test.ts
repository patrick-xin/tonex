import { hexString } from '@tonex/color-utils'
import type { PairResult } from '@tonex/core'
import type { ContrastPair } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { applyLevel, levelThreshold } from './apply-level'

// why: AA/AAA is a runtime threshold override on top of the per-pair
// `pair.threshold` baked into CONTRAST_PAIRS. levelThreshold encodes the
// WCAG 1.4.3 (text) and 1.4.11 (non-text) thresholds; applyLevel applies it
// to a PairResult and recomputes pass/fail. These tests pin both contracts
// against their spec — not a golden snapshot.

function makePair(intent: 'text' | 'non-text', threshold: number): ContrastPair {
  return { fg: '--fg', bg: '--bg', layer: 'md', intent, threshold }
}

function makeResult(
  intent: 'text' | 'non-text',
  ratio: number,
  bakedThreshold: number,
  passes: boolean,
): PairResult {
  return {
    pair: makePair(intent, bakedThreshold),
    fgArgb: 0xff_00_00_00,
    bgArgb: 0xff_ff_ff_ff,
    ratio,
    passes,
  }
}

describe('levelThreshold', () => {
  it('text@aa is 4.5 (WCAG 1.4.3 minimum)', () => {
    expect(levelThreshold('text', 'aa')).toBe(4.5)
  })

  it('text@aaa is 7 (WCAG 1.4.3 enhanced)', () => {
    expect(levelThreshold('text', 'aaa')).toBe(7)
  })

  it('non-text@aa is 3 (WCAG 1.4.11 minimum)', () => {
    expect(levelThreshold('non-text', 'aa')).toBe(3)
  })

  it('non-text@aaa is 4.5 (one rung up from non-text@aa)', () => {
    expect(levelThreshold('non-text', 'aaa')).toBe(4.5)
  })
})

describe('applyLevel', () => {
  it('preserves all PairResult fields', () => {
    const p = makeResult('text', 5.2, 4.5, true)
    const out = applyLevel(p, 'aa')
    expect(out.pair).toBe(p.pair)
    expect(out.fgArgb).toBe(p.fgArgb)
    expect(out.bgArgb).toBe(p.bgArgb)
    expect(out.ratio).toBe(p.ratio)
    expect(out.passes).toBe(p.passes)
  })

  it('projects fgArgb/bgArgb to hex via the shared hexString helper', () => {
    const p = makeResult('text', 5.2, 4.5, true)
    const out = applyLevel(p, 'aa')
    expect(out.fgHex).toBe(hexString(p.fgArgb))
    expect(out.bgHex).toBe(hexString(p.bgArgb))
  })

  it('overrides the baked pair.threshold with the level-derived threshold', () => {
    // pair was baked at 3 (non-text baseline) but caller asks for aaa — the
    // effective threshold must be 4.5, not 3.
    const p = makeResult('non-text', 4.0, 3, true)
    const out = applyLevel(p, 'aaa')
    expect(out.effectiveThreshold).toBe(4.5)
    expect(out.effectiveThreshold).not.toBe(p.pair.threshold)
  })

  it('recomputes effectivePasses against the override (ratio >= threshold)', () => {
    // Same ratio (4.0), same pair (baked passes=true at 3), but aaa raises
    // the bar to 4.5 — the result must flip to fail.
    const p = makeResult('non-text', 4.0, 3, true)
    expect(applyLevel(p, 'aa').effectivePasses).toBe(true)
    expect(applyLevel(p, 'aaa').effectivePasses).toBe(false)
  })

  it('treats ratio === threshold as passing (>=, not >)', () => {
    const p = makeResult('text', 4.5, 4.5, true)
    expect(applyLevel(p, 'aa').effectivePasses).toBe(true)
  })
})
