import { isValidHex } from '@tonex/color-utils'
import { maxChroma } from '@tonex/core'
import { describe, expect, it } from 'vitest'
import { chromaGradient, hueGradient, toneGradient } from './gradients'

// why: these slider tracks are www-side presentation, but every stop comes from
// core's hexFromHct — so they sit on the www↔core seam. The contract is "12
// valid #rrggbb stops, no throw, even at the gamut wall." If core's hexFromHct
// changes shape (returns an object, prepends nothing, throws on out-of-gamut)
// the track silently goes flat or emits broken CSS; this fails loudly instead.
// Stops are validated with core's own isValidHex (the seed field's validator),
// and the chroma case mirrors the real call site: chromaGradient(hue, tone,
// maxChroma(hue, tone)) (hct-control-sliders.tsx). The exact stop hexes aren't
// pinned — that couples to the MCU version; the structural contract is the spec.

const STOP_COUNT = 12

const stopsOf = (gradient: string): string[] => {
  const m = gradient.match(/^linear-gradient\(to right, (.+)\)$/)
  if (!m?.[1]) throw new Error(`not a 'to right' linear-gradient: ${gradient}`)
  return m[1].split(', ')
}

const expectValidTrack = (gradient: string) => {
  const stops = stopsOf(gradient)
  expect(stops).toHaveLength(STOP_COUNT)
  for (const stop of stops) expect(isValidHex(stop)).toBe(true)
  return stops
}

describe('hueGradient', () => {
  it('sweeps the wheel as 12 valid, varied stops', () => {
    const stops = expectValidTrack(hueGradient())
    // a real rainbow, not a collapsed constant — catches hexFromHct degenerating
    expect(new Set(stops).size).toBeGreaterThan(1)
  })
})

describe('toneGradient', () => {
  it('sweeps tone 0→100 as 12 valid, varied stops (black → white)', () => {
    const stops = expectValidTrack(toneGradient(210, 48))
    expect(new Set(stops).size).toBeGreaterThan(1)
  })
})

describe('chromaGradient', () => {
  it('stays a valid track at the gamut wall for representative (hue, tone)', () => {
    // mirror the consumer: max chroma is the actual gamut limit at (hue, tone).
    // Includes extreme tones where the wall is tiny — the clamp-heavy path.
    const cases: ReadonlyArray<[number, number]> = [
      [30, 50],
      [210, 48],
      [120, 5], // near-black: gamut wall is narrow
      [300, 95], // near-white: gamut wall is narrow
    ]
    for (const [hue, tone] of cases) {
      const stops = expectValidTrack(chromaGradient(hue, tone, maxChroma(hue, tone)))
      expect(new Set(stops).size).toBeGreaterThan(1)
    }
  })

  it('degenerates safely to a flat track when maxChroma is 0', () => {
    // chroma 0 at every stop → 12 identical greys; still 12 valid hex, no throw.
    expectValidTrack(chromaGradient(210, 50, 0))
  })
})
