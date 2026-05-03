import { describe, expect, it } from 'vitest'
import { deriveTheme } from './derive'
import { DEFAULT_INPUTS } from './schema'

const HEX = /^#[0-9a-f]{6}$/i

describe('deriveTheme', () => {
  it('returns md and shadcn token maps for both modes', () => {
    const result = deriveTheme(DEFAULT_INPUTS)

    expect(result.md.light['--color-primary']).toMatch(HEX)
    expect(result.md.dark['--color-primary']).toMatch(HEX)
    expect(result.shadcn.light['--primary']).toMatch(HEX)
    expect(result.shadcn.dark['--primary']).toMatch(HEX)
  })

  it('derives different primary values for light vs dark', () => {
    const { md, shadcn } = deriveTheme(DEFAULT_INPUTS)
    expect(md.light['--color-primary']).not.toBe(md.dark['--color-primary'])
    expect(shadcn.light['--primary']).not.toBe(shadcn.dark['--primary'])
  })

  it('different seeds yield different primaries', () => {
    const red = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' })
    const green = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#00ff00' })
    expect(red.shadcn.light['--primary']).not.toBe(green.shadcn.light['--primary'])
  })

  it('returns no warnings for valid input', () => {
    expect(deriveTheme(DEFAULT_INPUTS).warnings).toEqual([])
  })

  it('is deterministic', () => {
    const a = deriveTheme(DEFAULT_INPUTS)
    const b = deriveTheme(DEFAULT_INPUTS)
    expect(a).toEqual(b)
  })
})
