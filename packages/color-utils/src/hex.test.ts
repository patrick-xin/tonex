import { describe, expect, it } from 'vitest'
import { isValidHex } from './hex'

describe('isValidHex', () => {
  it('accepts 6-digit hex with mixed case', () => {
    expect(isValidHex('#22c55e')).toBe(true)
    expect(isValidHex('#FFFFFF')).toBe(true)
    expect(isValidHex('#000000')).toBe(true)
  })

  it('rejects missing hash, wrong length, non-hex chars', () => {
    expect(isValidHex('22c55e')).toBe(false)
    expect(isValidHex('#22c')).toBe(false)
    expect(isValidHex('#22c55ezz')).toBe(false)
    expect(isValidHex('#zzzzzz')).toBe(false)
    expect(isValidHex('')).toBe(false)
  })
})
