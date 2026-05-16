import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS, type PortableTheme } from '../theme/schema'
import { cmfSecondSourceDisabledReason } from './cmf-second-source'

describe('cmfSecondSourceDisabledReason', () => {
  it('returns null when variant is cmf', () => {
    const source: PortableTheme = { ...DEFAULT_INPUTS, variant: 'cmf' }
    expect(cmfSecondSourceDisabledReason(source)).toBeNull()
  })

  it('returns a reason string for every non-cmf variant', () => {
    // why: every other variant ignores secondHct in build(), so the input
    // would silently fail to drive anything. Cover the four most common
    // groups (standard / expressive / subdued / monochrome) — the rule is
    // 'variant !== cmf', not a per-variant carve-out.
    for (const variant of ['tonalSpot', 'vibrant', 'expressive', 'monochrome'] as const) {
      const source: PortableTheme = { ...DEFAULT_INPUTS, variant }
      const reason = cmfSecondSourceDisabledReason(source)
      expect(reason).not.toBeNull()
      expect(reason).toMatch(/CMF/)
    }
  })

  it('is independent of cmfSecondSourceHex value', () => {
    // why: the rule gates the FIELD, not the value. A persisted hex from a
    // prior cmf session must keep returning a reason while variant !== cmf
    // so the engine keeps skipping it (and the UI keeps disabling the input)
    // until the user switches back.
    const source: PortableTheme = {
      ...DEFAULT_INPUTS,
      variant: 'tonalSpot',
      cmfSecondSourceHex: '#aabbcc',
    }
    expect(cmfSecondSourceDisabledReason(source)).not.toBeNull()
  })
})
