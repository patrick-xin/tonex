import { argbFromHex } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS, type PortableTheme } from '../schema'
import { adjustTokens } from './adjust-tokens'
import { applyAdjustments } from './apply-adjustments'
import type { AdjustResult } from './adjust-tokens'

// why: applyAdjustments is the persist seam (#198) — core owns writing each
// result's `after` hex into md3TokenOverrides so the consumer never hand-
// assembles the pin map. Tests pin: the write lands in the right (mode, token)
// slot, source is not mutated, the round-trip closes (deriveTheme reflects the
// pin), and an empty list is a no-op equivalent. Small-and-robust: one case per
// load-bearing behavior.

describe('applyAdjustments', () => {
  it('writes each after-hex into md3TokenOverrides[mode][token] in a new theme', () => {
    // why: AC — the pin lands in the addressed slot; the return is a NEW theme.
    const results: AdjustResult[] = [
      {
        mode: 'light',
        token: '--color-primary',
        before: '#000000',
        after: '#123456',
        requested: { dTone: 0, dChroma: 0 },
        achieved: { dTone: 0, dChroma: 0 },
      },
    ]
    const next = applyAdjustments(DEFAULT_INPUTS, results)
    expect(next).not.toBe(DEFAULT_INPUTS)
    expect(next.md3TokenOverrides.light['--color-primary']).toBe('#123456')
  })

  it('does not mutate source (overrides maps are cloned, not aliased)', () => {
    // why: AC — purity. Writing into the fresh copy must not touch source's map.
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      md3TokenOverrides: { light: {}, dark: {} },
    }
    const snapshot = structuredClone(source)
    applyAdjustments(source, [
      {
        mode: 'light',
        token: '--color-primary',
        before: '#000000',
        after: '#abcdef',
        requested: { dTone: 1, dChroma: 0 },
        achieved: { dTone: 1, dChroma: 0 },
      },
    ])
    expect(source).toEqual(snapshot)
  })

  it('closes the round-trip: deriveTheme reflects the pinned value', () => {
    // why: AC — adjustTokens → applyAdjustments → deriveTheme. Because
    // applyMd3TokenOverrides runs last, the derived primary equals argbFromHex
    // of the applied `after`. --color-primary is non-treated so the pin survives
    // derive verbatim (the round-trip assertion needs a treatment-immune token).
    const results = adjustTokens(DEFAULT_INPUTS, [
      { mode: 'light', token: '--color-primary', dTone: 6, dChroma: 0 },
    ])
    const next = applyAdjustments(DEFAULT_INPUTS, results)
    const derived = deriveTheme(next)
    expect(derived.md.light['--color-primary']).toBe(argbFromHex(results[0].after))
  })

  it('returns an equivalent theme for an empty results list', () => {
    // why: AC — empty list is a no-op; the result is deep-equal to source
    // (drift-guard friendly — applying nothing changes nothing).
    const next = applyAdjustments(DEFAULT_INPUTS, [])
    expect(next).toEqual(DEFAULT_INPUTS)
  })
})
