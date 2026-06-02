import { describe, expect, it } from 'vitest'
import { hctFromHex, hexFromHct } from './hct'
import { DEFAULT_INPUTS } from './schema'
import { selectSeedHex } from './seed'

// why: selectSeedHex is the one home for the `exactHex ?? hexFromHct(seed)`
// rule (ADR-0028). It lives in pure core — not the zustand store — so the
// engine (derive, exporters) and a future CLI can resolve a seed to its hex
// without pulling in the React/store package (ADR-0037, ADR-0016). This is
// the coverage that used to ride in source.test.ts.
describe('selectSeedHex', () => {
  it('returns the exact pasted bytes when seed.exactHex is set, even if they diverge from hexFromHct', () => {
    // exactHex wins over the HCT-derived hex — proves the `??` precedence.
    const seed = { ...hctFromHex('#3b82f6'), exactHex: '#abcdef' }
    expect(selectSeedHex({ seed })).toBe('#abcdef')
  })

  it('falls back to hexFromHct(seed) when exactHex is absent', () => {
    const seed = hctFromHex('#3b82f6')
    expect(selectSeedHex({ seed })).toBe(hexFromHct(seed))
  })

  it('operates on the full PortableTheme shape via the Pick', () => {
    expect(selectSeedHex(DEFAULT_INPUTS)).toBe(DEFAULT_INPUTS.seed.exactHex)
  })
})
