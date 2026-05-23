import { argbFromHex } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { hexFromOklch, oklchString } from './oklch'

const OKLCH = /^oklch\((-?[\d.]+) (-?[\d.]+) (-?[\d.]+)\)$/

function parts(s: string): { L: string; C: string; H: string } {
  const m = OKLCH.exec(s)
  if (!m) throw new Error(`not canonical: ${s}`)
  return { L: m[1], C: m[2], H: m[3] }
}

function decimals(n: string): number {
  const dot = n.indexOf('.')
  return dot < 0 ? 0 : n.length - dot - 1
}

describe('canonical-form firewall (ADR-0025 commitment 3)', () => {
  it('shape is `oklch(L C H)` — no alpha, no commas, single spaces', () => {
    expect(oklchString(argbFromHex('#6750a4'))).toMatch(OKLCH)
    expect(oklchString(argbFromHex('#abcdef'))).toMatch(OKLCH)
    expect(oklchString(argbFromHex('#123456'))).toMatch(OKLCH)
  })

  it('L is emitted with at most 4 decimals', () => {
    // why: shadcn v4 / tailwind v4 convention. Inputs chosen so mathematical
    // L exceeds 4 decimals; the formatter must round, not truncate-and-pad.
    for (const hex of ['#6750a4', '#abcdef', '#123456', '#3366aa', '#fedcba']) {
      const { L } = parts(oklchString(argbFromHex(hex)))
      expect(decimals(L)).toBeLessThanOrEqual(4)
    }
  })

  it('C is emitted with at most 4 decimals', () => {
    for (const hex of ['#6750a4', '#abcdef', '#123456', '#3366aa', '#fedcba']) {
      const { C } = parts(oklchString(argbFromHex(hex)))
      expect(decimals(C)).toBeLessThanOrEqual(4)
    }
  })

  it('H is emitted with at most 2 decimals', () => {
    for (const hex of ['#6750a4', '#abcdef', '#123456', '#3366aa', '#fedcba']) {
      const { H } = parts(oklchString(argbFromHex(hex)))
      expect(decimals(H)).toBeLessThanOrEqual(2)
    }
  })

  it('strips trailing zeros — biome would strip them on commit, breaking drift-guard', () => {
    // why: white's mathematical L is exactly 1; engines that pad to L_PRECISION
    // emit "1.0000". biome's CSS formatter strips that to "1" on the next
    // commit, making `globals.css` !== formatCss(deriveTheme(DEFAULT_INPUTS)).
    // Pin the stripped form so the drift-guard is stable across commits.
    const white = oklchString(argbFromHex('#ffffff'))
    const black = oklchString(argbFromHex('#000000'))
    expect(white).toBe('oklch(1 0 0)')
    expect(black).toBe('oklch(0 0 0)')

    // No L/C/H component should end in `.0`, `.00`, `.000`, or `.0000`.
    for (const hex of ['#ffffff', '#000000', '#6750a4', '#808080', '#abcdef']) {
      const s = oklchString(argbFromHex(hex))
      expect(s).not.toMatch(/\.0+(?=[\s)])/)
    }
  })

  it('out-of-gamut OKLCH is chroma-reduced (CSS Color 4), not per-channel clipped', () => {
    // why: ~33% of TAILWIND_PALETTE_OKLCH falls outside sRGB. Naive per-channel
    // clip snaps one axis to the gamut wall and shifts perceived hue/lightness;
    // CSS Color 4 gamut mapping reduces chroma at fixed L/H, matching browsers
    // and oklch.com. yellow-400 = oklch(0.852 0.199 91.936) renders #fcc800 in
    // browsers; the old clip path produced #fdc700.
    expect(hexFromOklch('oklch(0.852 0.199 91.936)')).toBe('#fcc800')
    expect(hexFromOklch('oklch(0.841 0.238 128.85)')).toBe('#9ae600')
    expect(hexFromOklch('oklch(0.792 0.209 151.711)')).toBe('#05df72')
    expect(hexFromOklch('oklch(0.789 0.154 211.53)')).toBe('#00d3f2')
  })

  it('chromaless colors snap hue to 0 (canonical neutral)', () => {
    // why: greys have undefined hue; without a snap, two independently-derived
    // neutrals can produce different hues from float noise. `if (C < 1e-4) H = 0`
    // is the firewall — any engine that emits a non-zero H for a chromaless
    // color must be wrapped with this snap before reaching the string form.
    expect(oklchString(argbFromHex('#808080'))).toMatch(/^oklch\([\d.]+ 0 0\)$/)
    expect(oklchString(argbFromHex('#ffffff'))).toMatch(/^oklch\([\d.]+ 0 0\)$/)
    expect(oklchString(argbFromHex('#000000'))).toMatch(/^oklch\([\d.]+ 0 0\)$/)
    expect(oklchString(argbFromHex('#404040'))).toMatch(/^oklch\([\d.]+ 0 0\)$/)
  })
})
