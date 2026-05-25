import { describe, expect, it } from 'vitest'
import { dualIntent } from './dual-intent'
import type { EvaluatedPair } from './types'

// why: minimal EvaluatedPair fixture — dualIntent only reads pair.intent and
// effectivePasses, so the argb/hex/ratio fields are filler.
function pair(
  intent: 'text' | 'non-text',
  effectivePasses: boolean,
  effectiveThreshold: number,
): EvaluatedPair {
  return {
    pair: {
      fg: '--destructive',
      bg: '--card',
      layer: 'shadcn',
      intent,
      threshold: effectiveThreshold,
    },
    fgArgb: 0,
    bgArgb: 0,
    ratio: 5,
    passes: effectivePasses,
    fgHex: '#000000',
    bgHex: '#ffffff',
    effectiveThreshold,
    effectivePasses,
  }
}

describe('dualIntent', () => {
  it('returns null for a single-intent bundle', () => {
    expect(dualIntent([pair('text', true, 4.5)])).toBeNull()
    expect(dualIntent([pair('non-text', true, 3)])).toBeNull()
  })

  it('tier "pass" when the stricter text bar is cleared', () => {
    const result = dualIntent([pair('text', true, 4.5), pair('non-text', true, 3)])
    expect(result?.tier).toBe('pass')
  })

  it('tier "fills-only" when text fails but non-text passes', () => {
    const result = dualIntent([pair('text', false, 4.5), pair('non-text', true, 3)])
    expect(result?.tier).toBe('fills-only')
  })

  it('tier "fail" when neither bar is cleared', () => {
    const result = dualIntent([pair('text', false, 4.5), pair('non-text', false, 3)])
    expect(result?.tier).toBe('fail')
  })

  it('exposes both pairs for the collapsed row to read targets from', () => {
    const result = dualIntent([pair('text', true, 4.5), pair('non-text', true, 3)])
    expect(result?.text.effectiveThreshold).toBe(4.5)
    expect(result?.nonText.effectiveThreshold).toBe(3)
  })
})
