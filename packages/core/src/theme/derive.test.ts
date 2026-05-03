import { describe, expect, it } from 'vitest'
import { deriveTheme } from './derive'
import { DEFAULT_INPUTS } from './schema'

const HEX = /^#[0-9a-f]{6}$/i

describe('deriveTheme', () => {
  it('emits md primary role family for both modes', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [md.light, md.dark]) {
      expect(mode['--color-primary']).toMatch(HEX)
      expect(mode['--color-on-primary']).toMatch(HEX)
      expect(mode['--color-primary-container']).toMatch(HEX)
      expect(mode['--color-on-primary-container']).toMatch(HEX)
    }
  })

  it('emits shadcn primary + primary-foreground for both modes', () => {
    const { shadcn } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [shadcn.light, shadcn.dark]) {
      expect(mode['--primary']).toMatch(HEX)
      expect(mode['--primary-foreground']).toMatch(HEX)
    }
  })

  it('shadcn primary mirrors md primary-container; foreground mirrors md on-primary-container', () => {
    const { md, shadcn } = deriveTheme(DEFAULT_INPUTS)
    expect(shadcn.light['--primary']).toBe(md.light['--color-primary-container'])
    expect(shadcn.light['--primary-foreground']).toBe(md.light['--color-on-primary-container'])
    expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary-container'])
    expect(shadcn.dark['--primary-foreground']).toBe(md.dark['--color-on-primary-container'])
  })

  it('derives different md primary values for light vs dark', () => {
    // why: md primary differs across modes by MD3 spec (tone 40 light vs 80 dark).
    // We don't assert shadcn light !== dark here because shadcn primary mirrors
    // md primary-container, whose cross-mode delta is variant-dependent — cmf
    // with the default seed happens to collapse it. The mapping-rule test above
    // already covers shadcn correctness.
    const { md } = deriveTheme(DEFAULT_INPUTS)
    expect(md.light['--color-primary']).not.toBe(md.dark['--color-primary'])
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
