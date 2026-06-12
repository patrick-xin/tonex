import { describe, expect, it } from 'vitest'
import { resultOf } from './result'
import type { EvaluatedPair } from './types'

// why: minimal EvaluatedPair fixture — resultOf only reads isDecorative(pair),
// effectivePasses, and pair.intent, so argb/hex/ratio are filler. fg/bg default
// to a functional pair; override them to hit the decorative carve-out.
function pair(
  intent: 'text' | 'non-text',
  effectivePasses: boolean,
  fg = '--primary',
  bg = '--background',
): EvaluatedPair {
  return {
    pair: { fg, bg, layer: 'shadcn', intent, threshold: 4.5 },
    fgArgb: 0,
    bgArgb: 0,
    ratio: 5,
    passes: effectivePasses,
    fgHex: '#000000',
    bgHex: '#ffffff',
    effectiveThreshold: 4.5,
    effectivePasses,
  }
}

describe('resultOf', () => {
  it('"pass" when the pair clears its effective threshold', () => {
    expect(resultOf(pair('text', true))).toBe('pass')
    expect(resultOf(pair('non-text', true))).toBe('pass')
  })

  it('"fail" for a failing text pair (must fix — blocks the gate)', () => {
    expect(resultOf(pair('text', false))).toBe('fail')
  })

  it('"warn" for a failing non-text pair (judgment call — never blocks)', () => {
    expect(resultOf(pair('non-text', false))).toBe('warn')
  })

  it('"none" for an exempt outline-variant pair regardless of pass state', () => {
    expect(resultOf(pair('non-text', false, '--color-outline-variant', '--color-surface'))).toBe(
      'none',
    )
  })
})
