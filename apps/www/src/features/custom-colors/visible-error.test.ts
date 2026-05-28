import { describe, expect, it } from 'vitest'
import { visibleCustomColorError } from './visible-error'

// why: the error-text gate has three branches: submit error always wins, empty
// or whitespace-only name suppresses draft error text (so the dialog doesn't
// shout "name must contain…" at open), real text reveals draft error. The
// submit-disabled state still reads draftError directly elsewhere — this
// helper is only for the visible message.

describe('visibleCustomColorError', () => {
  it('returns the submitError when present, even with an empty name and no draftError', () => {
    expect(visibleCustomColorError('save failed', '', null)).toBe('save failed')
  })

  it('returns the submitError when present, ahead of a draftError', () => {
    expect(visibleCustomColorError('save failed', 'Brand', 'name conflicts')).toBe('save failed')
  })

  it('suppresses the draftError when the name is empty', () => {
    expect(visibleCustomColorError(null, '', 'name must contain at least 2 characters')).toBeNull()
  })

  it('suppresses the draftError when the name is whitespace-only (trim)', () => {
    expect(
      visibleCustomColorError(null, '   ', 'name must contain at least 2 characters'),
    ).toBeNull()
  })

  it('reveals the draftError once the name has any non-whitespace content', () => {
    expect(visibleCustomColorError(null, 'a', 'name must contain at least 2 characters')).toBe(
      'name must contain at least 2 characters',
    )
  })

  it('returns null when there is no submit error and no draft error', () => {
    expect(visibleCustomColorError(null, 'Brand', null)).toBeNull()
  })
})
