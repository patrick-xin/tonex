import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../theme/derive'
import { DEFAULT_INPUTS } from '../theme/schema'
import { type VariantGroup, type VariantName, variants } from './index'

// why: slice 5 promise is "all MCU 2025 variants registered, switchable,
// produce distinct palettes". This file is the single registry contract —
// per-variant identity tests (cmf.test.ts, tonalSpot.test.ts) cover the
// same shape per entry; reproducing them 10x would be noise.

const EXPECTED_GROUPS: Record<VariantName, VariantGroup> = {
  cmf: 'cmf',
  tonalSpot: 'standard',
  fidelity: 'standard',
  content: 'standard',
  vibrant: 'expressive',
  expressive: 'expressive',
  rainbow: 'expressive',
  fruitSalad: 'expressive',
  monochrome: 'subdued',
  neutral: 'subdued',
}

describe('variants registry', () => {
  it('registers all 10 MCU variants', () => {
    expect(new Set(Object.keys(variants))).toEqual(new Set(Object.keys(EXPECTED_GROUPS)))
  })

  it('assigns each variant to the agreed group', () => {
    // why: groupings let consumers render <optgroup> without re-deriving the
    // taxonomy. Locking it in core means picker UIs, docs, and exporters all
    // see the same buckets. Taxonomy itself: cmf (own bucket — structurally
    // unique 2025 scheme), standard (source-faithful), expressive (high
    // chroma), subdued (low chroma).
    for (const [name, group] of Object.entries(EXPECTED_GROUPS)) {
      expect(variants[name as VariantName].group).toBe(group)
    }
  })

  it('produces a distinct md.light palette per variant for the default seed', () => {
    // why: switching test from the slice strategy. Compares the full md.light
    // TokenMap (serialized) rather than --color-primary alone, because some
    // MCU schemes legitimately collide on primary for a given seed (fidelity
    // and content are both source-faithful and often share primary). If two
    // entries produce byte-identical md.light maps, the registry is mis-wired.
    const palettes = (Object.keys(EXPECTED_GROUPS) as VariantName[]).map((variant) => {
      const theme = deriveTheme({ ...DEFAULT_INPUTS, variant })
      return JSON.stringify(theme.md.light)
    })
    expect(new Set(palettes).size).toBe(palettes.length)
  })
})
