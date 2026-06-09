import { describe, expect, it } from 'vitest'
import { TOUR_STEPS } from '@/features/onboarding-guide'
import { HELP_SECTIONS, openItemsFor } from './help-sections'

describe('openItemsFor', () => {
  it('expands a concepts-owned section in the concepts accordion', () => {
    expect(openItemsFor('cmf', 'concepts', ['hct'])).toEqual(['hct', 'cmf'])
  })

  it('is a no-op for an accordion that does not own the section', () => {
    expect(openItemsFor('cmf', 'qa', [])).toEqual([])
  })

  it('leaves defaults untouched for a null payload', () => {
    expect(openItemsFor(null, 'concepts', ['hct'])).toEqual(['hct'])
  })

  it('is additive — keeps a user-opened item when expanding the target', () => {
    expect(openItemsFor('cmf', 'concepts', ['scheme-variants'])).toEqual(['scheme-variants', 'cmf'])
  })

  it('does not duplicate an already-open target', () => {
    expect(openItemsFor('cmf', 'concepts', ['cmf'])).toEqual(['cmf'])
  })
})

// ADR-0030's one mechanically-guarded coupling: guidance is three non-overlapping
// surfaces with depth living only in reference, so a tour learnMore must resolve to a
// real help section — a dangling deep-link fails here rather than shipping.
describe('tour learnMore drift guard', () => {
  it('every tour step learnMore resolves to a real help section', () => {
    for (const step of TOUR_STEPS) {
      if (step.learnMore) {
        expect(HELP_SECTIONS).toHaveProperty(step.learnMore)
      }
    }
  })
})
