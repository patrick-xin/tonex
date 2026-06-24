import { describe, expect, it } from 'vitest'
import { hctFromHex } from '../hct'
import { shiftHct } from './shift-hct'

// why: shiftHct is the leaf HCT primitive the token-adjust feature builds on
// (#197). The load-bearing contract is HONESTY — `achieved` is re-derived from
// the OUTPUT color, never echoed from the request, so a caller can trust it
// even when the solver clamps chroma at the gamut wall. Tests pin that honesty
// across three regimes: in-gamut (achieved≈requested), gamut over-reach
// (achieved.dChroma < requested.dChroma, no throw), and identity. Kept small
// per the keep-tests-small convention — one case per load-bearing invariant,
// not one per sign/axis permutation.

// why: HCT round-trips through MCU's solver are not bit-exact; the in-gamut
// achieved delta lands within ~0.1 of requested (measured). 0.5 is a safe
// epsilon that still catches a wrong-axis or wrong-sign regression.
const EPS = 0.5

describe('shiftHct', () => {
  it('returns a valid 6-digit hex and an achieved delta re-derived from the result', () => {
    // why: AC #1/#2 — decompose→shift→recompose yields a valid hex, and
    // `achieved` is the OUTPUT diffed against the INPUT, not the requested delta.
    const res = shiftHct('#6750a4', { dTone: 5, dChroma: 3 })
    expect(res.hex).toMatch(/^#[0-9a-f]{6}$/)

    const before = hctFromHex('#6750a4')
    const after = hctFromHex(res.hex)
    expect(res.achieved.dTone).toBeCloseTo(after.tone - before.tone, 5)
    expect(res.achieved.dChroma).toBeCloseTo(after.chroma - before.chroma, 5)
  })

  it('achieves ≈ requested for an in-gamut delta', () => {
    // why: AC #3 — a modest delta on a mid-tone seed sits well inside the gamut,
    // so the achieved delta tracks the request within solver tolerance.
    const res = shiftHct('#6750a4', { dTone: 5, dChroma: 3 })
    expect(res.achieved.dTone).toBeCloseTo(5, 1)
    expect(Math.abs(res.achieved.dChroma - 3)).toBeLessThan(EPS)
  })

  it('clamps a chroma delta past the gamut wall instead of throwing', () => {
    // why: AC #4 — #ffcc00 already sits AT its gamut wall (chroma≈62.4 ==
    // maxChroma), so requesting +200 chroma cannot move it: the solver snaps
    // back, achieved.dChroma stays << requested, the hex stays valid, no throw.
    const req = { dTone: 0, dChroma: 200 }
    const res = shiftHct('#ffcc00', req)
    expect(res.hex).toMatch(/^#[0-9a-f]{6}$/)
    expect(res.achieved.dChroma).toBeLessThan(req.dChroma)
  })

  it('is identity for a zero delta', () => {
    // why: AC #5 — zero delta must round-trip. These helpers round-trip EXACTLY
    // for in-gamut seeds (verified), so assert exact hex equality, not near.
    const res = shiftHct('#6750a4', { dTone: 0, dChroma: 0 })
    expect(res.hex).toBe('#6750a4')
    expect(res.achieved.dTone).toBeCloseTo(0, 5)
    expect(res.achieved.dChroma).toBeCloseTo(0, 5)
  })

  it('moves tone in the signed direction (negative darkens)', () => {
    // why: AC #6 — sign discipline. A negative dTone must lower tone (darker),
    // a positive dTone must raise it; pinning both directions guards a flipped
    // sign that an absolute-magnitude test would miss.
    const before = hctFromHex('#6750a4').tone
    expect(hctFromHex(shiftHct('#6750a4', { dTone: -10, dChroma: 0 }).hex).tone).toBeLessThan(
      before,
    )
    expect(hctFromHex(shiftHct('#6750a4', { dTone: 10, dChroma: 0 }).hex).tone).toBeGreaterThan(
      before,
    )
  })
})
