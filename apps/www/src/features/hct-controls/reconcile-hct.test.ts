import type { HctTriplet } from '@tonex/core'
import { describe, expect, it } from 'vitest'
import { applyHctUpdate, HCT_UPDATE_EPSILON, hctClose, hctEqual } from './reconcile-hct'

// why: the epsilon gate is the load-bearing protection for issue #56 — every
// edge of it (exact equality, sub-epsilon close, boundary at epsilon, real
// drag step) must be pinned. applyHctUpdate's identity-stability contract is
// what lets React's bail-out skip the push-to-parent effect.

const BASE: HctTriplet = { hue: 200, chroma: 40, tone: 50 }

describe('HCT_UPDATE_EPSILON', () => {
  it('is half of one toFixed(2) step (#56)', () => {
    expect(HCT_UPDATE_EPSILON).toBe(5e-3)
  })
})

describe('hctEqual', () => {
  it('returns true for identical triplets', () => {
    expect(hctEqual(BASE, { ...BASE })).toBe(true)
  })

  it('returns false when any single channel differs (no epsilon — strict ===)', () => {
    expect(hctEqual(BASE, { ...BASE, hue: 200.0001 })).toBe(false)
    expect(hctEqual(BASE, { ...BASE, chroma: 40.0001 })).toBe(false)
    expect(hctEqual(BASE, { ...BASE, tone: 50.0001 })).toBe(false)
  })
})

describe('hctClose', () => {
  it('returns true when every channel differs by less than epsilon', () => {
    expect(
      hctClose(BASE, {
        hue: BASE.hue + 1e-3,
        chroma: BASE.chroma - 2e-3,
        tone: BASE.tone + 4e-3,
      }),
    ).toBe(true)
  })

  it('returns false when any channel exceeds epsilon (the real-drag-passes case)', () => {
    // A real 0.01 drag step is 2× epsilon — must NOT be suppressed.
    expect(hctClose(BASE, { ...BASE, hue: BASE.hue + 0.01 })).toBe(false)
    expect(hctClose(BASE, { ...BASE, chroma: BASE.chroma + 0.01 })).toBe(false)
    expect(hctClose(BASE, { ...BASE, tone: BASE.tone + 0.01 })).toBe(false)
  })
})

describe('applyHctUpdate', () => {
  it('returns the current reference when the merged triplet stays within epsilon', () => {
    // why: React bail-out depends on referential identity. If applyHctUpdate
    // returned a fresh-but-equal object the setHct callback would still trigger
    // a re-render and the push-to-parent effect — defeating the #56 gate.
    const next = applyHctUpdate(BASE, { hue: BASE.hue + 1e-3 })
    expect(next).toBe(BASE)
  })

  it('returns the current reference for an empty partial (no-op)', () => {
    expect(applyHctUpdate(BASE, {})).toBe(BASE)
  })

  it('returns a fresh merged triplet when any channel change exceeds epsilon', () => {
    const next = applyHctUpdate(BASE, { hue: 220 })
    expect(next).not.toBe(BASE)
    expect(next).toEqual({ hue: 220, chroma: 40, tone: 50 })
  })

  it('merges only the specified channels (other channels carry through)', () => {
    const next = applyHctUpdate(BASE, { chroma: 80 })
    expect(next).toEqual({ hue: 200, chroma: 80, tone: 50 })
  })

  it('does not mutate the current triplet', () => {
    const snapshot = { ...BASE }
    applyHctUpdate(BASE, { hue: 300 })
    expect(BASE).toEqual(snapshot)
  })
})
