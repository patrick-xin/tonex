import { argbFromHex } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { argbFromOklch, hexFromOklch, oklchFromArgb, oklchFromHex } from './oklch'

const OKLCH = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/

describe('oklch conversion', () => {
  it('emits canonical `oklch(L C H)` shape with no alpha and no commas', () => {
    expect(oklchFromHex('#6750a4')).toMatch(OKLCH)
    expect(oklchFromHex('#000000')).toMatch(OKLCH)
    expect(oklchFromHex('#ffffff')).toMatch(OKLCH)
  })

  it('hex → oklch → hex round-trips within ±1 per channel for in-gamut colors', () => {
    // why: 8-bit sRGB quantization is the lower floor on round-trip fidelity.
    // Asserting <=1 byte drift across r/g/b proves the math is correct
    // without baking float noise into the test.
    const samples = [
      '#6750a4',
      '#ff0000',
      '#00ff00',
      '#0000ff',
      '#abcdef',
      '#123456',
      '#fedcba',
      '#808080',
    ]
    for (const hex of samples) {
      const round = hexFromOklch(oklchFromHex(hex))
      const before = argbFromHex(hex)
      const after = argbFromHex(round)
      const dr = Math.abs(((before >> 16) & 0xff) - ((after >> 16) & 0xff))
      const dg = Math.abs(((before >> 8) & 0xff) - ((after >> 8) & 0xff))
      const db = Math.abs((before & 0xff) - (after & 0xff))
      expect(dr).toBeLessThanOrEqual(1)
      expect(dg).toBeLessThanOrEqual(1)
      expect(db).toBeLessThanOrEqual(1)
    }
  })

  it('chromaless colors collapse hue to 0 (canonical neutral)', () => {
    // why: greys have undefined hue; the formatter snaps to 0 so two
    // independently-derived neutrals produce the same string. Without this
    // the drift-guard would be flaky on near-neutral surface tokens.
    expect(oklchFromHex('#808080')).toMatch(/oklch\([\d.]+ 0\.0000 0\.00\)/)
    expect(oklchFromHex('#ffffff')).toMatch(/oklch\([\d.]+ 0\.0000 0\.00\)/)
    expect(oklchFromHex('#000000')).toMatch(/oklch\([\d.]+ 0\.0000 0\.00\)/)
  })

  it('rejects non-canonical input shape (alpha, commas, named alts)', () => {
    expect(() => argbFromOklch('oklch(0.5 0.1 30 / 0.5)')).toThrow()
    expect(() => argbFromOklch('oklch(0.5, 0.1, 30)')).toThrow()
    expect(() => argbFromOklch('#6750a4')).toThrow()
    expect(() => argbFromOklch('rgb(100, 50, 50)')).toThrow()
  })

  it('argb → oklch is deterministic', () => {
    const a = oklchFromArgb(argbFromHex('#6750a4'))
    const b = oklchFromArgb(argbFromHex('#6750a4'))
    expect(a).toBe(b)
  })
})
