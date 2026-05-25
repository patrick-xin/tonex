import { describe, expect, it } from 'vitest'
import {
  argbComponents,
  argbFromHex,
  argbFromOklch,
  hexFromOklch,
  hexString,
  oklchFromArgb,
  oklchFromHex,
  relativeLuminance,
} from './oklch'

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
    expect(oklchFromHex('#808080')).toMatch(/oklch\([\d.]+ 0 0\)/)
    expect(oklchFromHex('#ffffff')).toMatch(/oklch\([\d.]+ 0 0\)/)
    expect(oklchFromHex('#000000')).toMatch(/oklch\([\d.]+ 0 0\)/)
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

describe('argbFromHex boundary helper', () => {
  // why: ADR-0021/0025 — `argbFromHex` is the hex→argb boundary primitive,
  // re-exported through this oklch surface so www read-sites (swatch
  // luminance, palette previews) route through `@tonex/core/oklch` instead of
  // reaching around it into vendored `@tonex/mcu` (issue #128).
  it('packs a known hex into full-alpha argb', () => {
    expect(argbFromHex('#ff0000')).toBe(0xffff0000)
    expect(argbFromHex('#ffffff')).toBe(0xffffffff)
    expect(argbFromHex('#000000')).toBe(0xff000000)
  })

  it('is the exact inverse of hexString', () => {
    expect(hexString(argbFromHex('#6750a4'))).toBe('#6750a4')
  })
})

describe('argbComponents', () => {
  it('decomposes a known argb into r/g/b bytes', () => {
    expect(argbComponents(0xff112233)).toEqual({ r: 0x11, g: 0x22, b: 0x33 })
  })

  it('alpha byte never leaks into rgb output', () => {
    // why: each channel masks with 0xff, so the high (alpha) byte cannot
    // bleed into r/g/b. Verify by varying alpha while holding rgb constant.
    expect(argbComponents(0x00112233)).toEqual(argbComponents(0xff112233))
  })

  it('round-trips through argbFromHex and manual reassembly', () => {
    const argb = argbFromHex('#3366aa')
    const { r, g, b } = argbComponents(argb)
    const reassembled = ((255 << 24) | (r << 16) | (g << 8) | b) >>> 0
    expect(reassembled).toBe(argb)
  })
})

describe('relativeLuminance', () => {
  it('white is ~1.0', () => {
    expect(relativeLuminance(argbFromHex('#ffffff'))).toBeCloseTo(1, 9)
  })

  it('black is exactly 0', () => {
    expect(relativeLuminance(argbFromHex('#000000'))).toBe(0)
  })

  it('mid-gray #808080 ≈ 0.2159', () => {
    expect(relativeLuminance(argbFromHex('#808080'))).toBeCloseTo(0.2159, 3)
  })

  it('pure red #ff0000 = 0.2126 (WCAG R coefficient)', () => {
    expect(relativeLuminance(argbFromHex('#ff0000'))).toBeCloseTo(0.2126, 9)
  })

  it('pure green #00ff00 = 0.7152 (WCAG G coefficient)', () => {
    expect(relativeLuminance(argbFromHex('#00ff00'))).toBeCloseTo(0.7152, 9)
  })

  it('pure blue #0000ff = 0.0722 (WCAG B coefficient)', () => {
    expect(relativeLuminance(argbFromHex('#0000ff'))).toBeCloseTo(0.0722, 9)
  })
})
