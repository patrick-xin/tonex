import { describe, expect, it } from 'vitest'
import { slugifyCustomColorName, validateCustomColorEntry } from './entry'

describe('slugifyCustomColorName', () => {
  it('lowercases and collapses non-alphanumeric runs to single dash', () => {
    expect(slugifyCustomColorName('Brand X')).toBe('brand-x')
    expect(slugifyCustomColorName('Brand   X')).toBe('brand-x')
    expect(slugifyCustomColorName('Brand_X!')).toBe('brand-x')
  })

  it('trims leading and trailing dashes', () => {
    expect(slugifyCustomColorName('  Brand  ')).toBe('brand')
    expect(slugifyCustomColorName('!!!Brand!!!')).toBe('brand')
  })

  it('returns empty string when name has no alphanumeric chars', () => {
    expect(slugifyCustomColorName('')).toBe('')
    expect(slugifyCustomColorName('   ')).toBe('')
    expect(slugifyCustomColorName('!!!')).toBe('')
  })
})

describe('validateCustomColorEntry', () => {
  const empty = new Set<string>()

  it('accepts a valid entry', () => {
    expect(validateCustomColorEntry({ name: 'Success', hex: '#22c55e' }, empty)).toBeNull()
  })

  it('rejects empty slug', () => {
    expect(validateCustomColorEntry({ name: '', hex: '#22c55e' }, empty)).toMatch(/at least one/)
    expect(validateCustomColorEntry({ name: '!!!', hex: '#22c55e' }, empty)).toMatch(/at least one/)
  })

  it('rejects collision with reserved md token roots', () => {
    expect(validateCustomColorEntry({ name: 'primary', hex: '#000000' }, empty)).toMatch(/reserved/)
    expect(validateCustomColorEntry({ name: 'surface', hex: '#000000' }, empty)).toMatch(/reserved/)
  })

  it('rejects collision with reserved shadcn role names', () => {
    expect(validateCustomColorEntry({ name: 'accent', hex: '#000000' }, empty)).toMatch(/reserved/)
    expect(validateCustomColorEntry({ name: 'destructive', hex: '#000000' }, empty)).toMatch(
      /reserved/,
    )
    expect(validateCustomColorEntry({ name: 'background', hex: '#000000' }, empty)).toMatch(
      /reserved/,
    )
  })

  it('rejects slugs starting with "on-" (would collide with on-* partner)', () => {
    expect(validateCustomColorEntry({ name: 'On Brand', hex: '#000000' }, empty)).toMatch(/on-/)
  })

  it('rejects slugs ending with "-container" or "-foreground"', () => {
    expect(validateCustomColorEntry({ name: 'Brand Container', hex: '#000000' }, empty)).toMatch(
      /-container/,
    )
    expect(validateCustomColorEntry({ name: 'Brand Foreground', hex: '#000000' }, empty)).toMatch(
      /-foreground/,
    )
  })

  it('rejects slugs using the reserved "tnx-" vendor prefix', () => {
    expect(validateCustomColorEntry({ name: 'Tnx Success', hex: '#000000' }, empty)).toMatch(/tnx-/)
    expect(validateCustomColorEntry({ name: 'tnx-info', hex: '#000000' }, empty)).toMatch(/tnx-/)
  })

  it('keeps success/warning/info free for users (only the tnx- prefix is reserved)', () => {
    expect(validateCustomColorEntry({ name: 'Success', hex: '#22c55e' }, empty)).toBeNull()
    expect(validateCustomColorEntry({ name: 'Warning', hex: '#f59e0b' }, empty)).toBeNull()
    expect(validateCustomColorEntry({ name: 'Info', hex: '#3b82f6' }, empty)).toBeNull()
  })

  it('rejects duplicate slug against existing set', () => {
    const existing = new Set(['success'])
    expect(validateCustomColorEntry({ name: 'Success', hex: '#22c55e' }, existing)).toMatch(
      /duplicates/,
    )
    // case + punctuation differences still slug to the same value
    expect(validateCustomColorEntry({ name: 'success!', hex: '#22c55e' }, existing)).toMatch(
      /duplicates/,
    )
  })

  it('rejects malformed hex', () => {
    expect(validateCustomColorEntry({ name: 'Brand', hex: '22c55e' }, empty)).toMatch(/hex/)
    expect(validateCustomColorEntry({ name: 'Brand', hex: '#22c' }, empty)).toMatch(/hex/)
    expect(validateCustomColorEntry({ name: 'Brand', hex: '#zzzzzz' }, empty)).toMatch(/hex/)
  })
})
