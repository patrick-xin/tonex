import { describe, expect, it } from 'vitest'
import { summarizeContrast } from './summary'

// why: the audit opens on "All" with a tally so failures read in proportion
// (most of the theme passes) instead of leading with a bare failure list. The
// counts split text vs UI fails because they carry different severity (red =
// fix before shipping; amber = judgment call).
const pass = { effectivePasses: true, pair: { intent: 'text' as const } }
const textFail = { effectivePasses: false, pair: { intent: 'text' as const } }
const uiFail = { effectivePasses: false, pair: { intent: 'non-text' as const } }

describe('summarizeContrast', () => {
  it('counts a mixed set, splitting text vs UI fails', () => {
    expect(summarizeContrast([pass, pass, textFail, uiFail], 3)).toEqual({
      pass: 2,
      textFail: 1,
      uiFail: 1,
      exempt: 3,
    })
  })

  it('reports zero fails when everything passes', () => {
    expect(summarizeContrast([pass, pass], 0)).toEqual({
      pass: 2,
      textFail: 0,
      uiFail: 0,
      exempt: 0,
    })
  })

  it('returns all zeros for an empty set', () => {
    expect(summarizeContrast([], 0)).toEqual({ pass: 0, textFail: 0, uiFail: 0, exempt: 0 })
  })
})
