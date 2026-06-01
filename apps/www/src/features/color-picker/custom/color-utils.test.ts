import { describe, expect, it } from 'vitest'
import { clamp, equalHex, equalHsva, hexToHsva, hexToRgba, hsvaToHex, round } from './color-utils'

// why: the custom picker stores HSVA and emits hex. hex → HSVA → hex is NOT
// bijective — the integer H/S/V intermediate has fewer states than 24-bit RGB,
// so most colors round-trip with up to ±3 per channel of drift (measured: only
// ~16% are exact, ~5% of HSVA values aren't even idempotent). That lossiness is
// inherited from react-colorful and is fine *because* useColorManipulation
// defends against it: on mount `equalHsva` early-returns (no emit), and the
// emit path bails via `equalHex(next, cache.value)` — RGBA equality, not string
// equality — so a synced color never silently nudges. This test pins the
// value-comparison semantics that defense leans on, and the round-trip bound,
// so a future "optimization" of the math can't reopen the drift. The exact
// math itself (react-colorful) is vendored; we pin the contract, not its lines.

const channelDrift = (a: string, b: string): number => {
  const x = hexToRgba(a)
  const y = hexToRgba(b)
  return Math.max(Math.abs(x.r - y.r), Math.abs(x.g - y.g), Math.abs(x.b - y.b))
}

describe('equalHex — the echo-suppression guard (useColorManipulation:31)', () => {
  it('matches by RGBA, ignoring case', () => {
    expect(equalHex('#AABBCC', '#aabbcc')).toBe(true)
  })

  it('matches across hex forms — shorthand expands to the same channels', () => {
    // #abc -> rgb(170,187,204) === #aabbcc. The guard compares colors, not
    // strings, so an equivalent re-serialization is not treated as a change.
    expect(equalHex('#abc', '#aabbcc')).toBe(true)
  })

  it('separates genuinely different colors, including a single-channel ±1', () => {
    expect(equalHex('#000000', '#000001')).toBe(false)
    expect(equalHex('#3366aa', '#3367ab')).toBe(false)
  })
})

describe('equalHsva — the mount-time early-return guard (useColorManipulation:29)', () => {
  it('is true only when every channel matches', () => {
    expect(equalHsva({ h: 210, s: 50, v: 67, a: 1 }, { h: 210, s: 50, v: 67, a: 1 })).toBe(true)
    expect(equalHsva({ h: 210, s: 50, v: 67, a: 1 }, { h: 211, s: 50, v: 67, a: 1 })).toBe(false)
    expect(equalHsva({ h: 210, s: 50, v: 67, a: 1 }, { h: 210, s: 50, v: 67, a: 0.5 })).toBe(false)
  })
})

describe('hex ↔ HSVA round-trip', () => {
  it('round-trips greyscale exactly (no hue to lose)', () => {
    for (const hex of ['#000000', '#808080', '#ffffff']) {
      expect(hsvaToHex(hexToHsva(hex))).toBe(hex)
    }
  })

  it('round-trips representative seeds within ±3 per channel (lossy but bounded)', () => {
    for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#3366aa', '#00001a', '#7f3cba']) {
      expect(channelDrift(hsvaToHex(hexToHsva(hex)), hex)).toBeLessThanOrEqual(3)
    }
  })
})

describe('hexToRgba — the channel parser equalHex / round-trips build on', () => {
  it('parses 6-digit hex to byte channels, alpha defaulting to 1', () => {
    expect(hexToRgba('#3366aa')).toEqual({ r: 51, g: 102, b: 170, a: 1 })
  })

  it('expands 3-digit shorthand by doubling each nibble', () => {
    expect(hexToRgba('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 })
  })

  it('reads 8-digit alpha as a 0–1 value rounded to 2 places', () => {
    expect(hexToRgba('#00000080')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
  })
})

describe('clamp / round — bounded, base-aware primitives', () => {
  it('clamp pins a value into [min,max], default [0,1]', () => {
    expect(clamp(-0.2)).toBe(0)
    expect(clamp(1.4)).toBe(1)
    expect(clamp(127, 0, 255)).toBe(127)
  })

  it('round respects the requested decimal places', () => {
    expect(round(0.50196, 2)).toBe(0.5)
    expect(round(214.28)).toBe(214)
  })
})
