import type { PairResult } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { describe, expect, it } from 'vitest'
import { toContrastWarning } from './warning'

const textPair: PairResult = {
  pair: {
    fg: '--foreground',
    bg: '--background',
    layer: 'shadcn',
    intent: 'text',
    threshold: 4.5,
  },
  fgArgb: 0xff000000,
  bgArgb: 0xffffffff,
  ratio: 21,
  passes: true,
}

const nonTextPair: PairResult = {
  pair: {
    fg: '--border',
    bg: '--background',
    layer: 'shadcn',
    intent: 'non-text',
    threshold: 3,
  },
  fgArgb: 0xffaaaaaa,
  bgArgb: 0xffffffff,
  ratio: 2.0,
  passes: false,
}

const decorativePair: PairResult = {
  pair: {
    fg: '--color-outline-variant',
    bg: '--color-surface',
    layer: 'md',
    intent: 'non-text',
    threshold: 3,
  },
  fgArgb: 0xffe0e0e0,
  bgArgb: 0xffffffff,
  ratio: 1.4,
  passes: false,
}

describe('toContrastWarning', () => {
  it('extracts threshold 3 from non-text pair', () => {
    const w = toContrastWarning(nonTextPair)
    expect(w.threshold).toBe(3)
    expect(w.intent).toBe('non-text')
  })

  it('extracts threshold 4.5 from text pair', () => {
    const w = toContrastWarning(textPair)
    expect(w.threshold).toBe(4.5)
    expect(w.intent).toBe('text')
  })

  it('preserves ratio and passes from PairResult', () => {
    const w = toContrastWarning(nonTextPair)
    expect(w.ratio).toBe(2.0)
    expect(w.passes).toBe(false)
  })

  it('defaults partner to bg when role is omitted (role-is-fg perspective)', () => {
    const w = toContrastWarning(nonTextPair)
    expect(w.partner).toBe('--background')
    expect(w.partnerHex).toBe(hexString(nonTextPair.bgArgb))
  })

  it('uses role parameter to flip perspective when role is bg', () => {
    const w = toContrastWarning(nonTextPair, '--background')
    expect(w.partner).toBe('--border')
    expect(w.partnerHex).toBe(hexString(nonTextPair.fgArgb))
  })

  it('keeps default perspective when role matches fg', () => {
    const w = toContrastWarning(nonTextPair, '--border')
    expect(w.partner).toBe('--background')
    expect(w.partnerHex).toBe(hexString(nonTextPair.bgArgb))
  })

  it('flags decorative pairs via isDecorative', () => {
    const w = toContrastWarning(decorativePair)
    expect(w.decorative).toBe(true)
  })

  it('non-decorative pair has decorative=false', () => {
    const w = toContrastWarning(nonTextPair)
    expect(w.decorative).toBe(false)
  })
})
