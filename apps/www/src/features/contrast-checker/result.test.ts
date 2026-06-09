import { describe, expect, it } from 'vitest'
import { tierResult } from './result'

// why: resultOf moved to @tonex/core/audit (covered by its result.test.ts);
// what stays app-side is tierResult — the --destructive dual-intent collapse
// onto a result, which depends on the www-only DualIntentTier.

describe('tierResult', () => {
  it('maps the collapsed --destructive tiers onto results', () => {
    expect(tierResult('pass')).toBe('pass')
    expect(tierResult('fills-only')).toBe('warn')
    expect(tierResult('fail')).toBe('fail')
  })
})
