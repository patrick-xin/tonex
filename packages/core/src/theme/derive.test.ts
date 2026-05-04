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

  it('emits md surface family for both modes', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    for (const mode of [md.light, md.dark]) {
      expect(mode['--color-surface']).toMatch(HEX)
      expect(mode['--color-surface-container']).toMatch(HEX)
      expect(mode['--color-surface-container-high']).toMatch(HEX)
      expect(mode['--color-on-surface']).toMatch(HEX)
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

  it('derives different md surface values for light vs dark', () => {
    const { md } = deriveTheme(DEFAULT_INPUTS)
    expect(md.light['--color-surface']).not.toBe(md.dark['--color-surface'])
    expect(md.light['--color-on-surface']).not.toBe(md.dark['--color-on-surface'])
  })

  it('different seeds yield different primaries', () => {
    const red = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#ff0000' })
    const green = deriveTheme({ ...DEFAULT_INPUTS, seedHex: '#00ff00' })
    expect(red.shadcn.light['--primary']).not.toBe(green.shadcn.light['--primary'])
  })

  it('variant dispatch picks a real strategy by name', () => {
    // why: two registry entries means `variants[source.variant]` must do real
    // lookup. cmf vs tonalSpot at the same seed produce different primary
    // tones — the structural assertion that dispatch is not hardcoded to cmf.
    const cmf = deriveTheme({ ...DEFAULT_INPUTS, variant: 'cmf' })
    const tonalSpot = deriveTheme({ ...DEFAULT_INPUTS, variant: 'tonalSpot' })
    expect(cmf.md.light['--color-primary']).not.toBe(tonalSpot.md.light['--color-primary'])
  })

  it('returns no warnings for valid input', () => {
    expect(deriveTheme(DEFAULT_INPUTS).warnings).toEqual([])
  })

  it('is deterministic', () => {
    const a = deriveTheme(DEFAULT_INPUTS)
    const b = deriveTheme(DEFAULT_INPUTS)
    expect(a).toEqual(b)
  })

  describe('md3PrimaryContainerOverride', () => {
    it('null overrides leave md primary-container at MCU value', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicitNull = deriveTheme({
        ...DEFAULT_INPUTS,
        md3PrimaryContainerOverride: { light: null, dark: null },
      })
      expect(explicitNull.md.light['--color-primary-container']).toBe(
        baseline.md.light['--color-primary-container'],
      )
      expect(explicitNull.md.dark['--color-primary-container']).toBe(
        baseline.md.dark['--color-primary-container'],
      )
    })

    it('light override replaces md.light primary-container only', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        md3PrimaryContainerOverride: { light: '#ff0000', dark: null },
      })
      expect(overridden.md.light['--color-primary-container']).toBe('#ff0000')
      expect(overridden.md.dark['--color-primary-container']).toBe(
        baseline.md.dark['--color-primary-container'],
      )
    })

    it('dark override replaces md.dark primary-container only', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        md3PrimaryContainerOverride: { light: null, dark: '#00ff00' },
      })
      expect(overridden.md.light['--color-primary-container']).toBe(
        baseline.md.light['--color-primary-container'],
      )
      expect(overridden.md.dark['--color-primary-container']).toBe('#00ff00')
    })

    it('override propagates to shadcn primary via cross-layer mapping', () => {
      // why: shadcn.--primary mirrors md.--color-primary-container. Mutation
      // pressure on md primary-container must flow through to shadcn primary
      // — this is the no-drift contract under editing pressure (ADR-0017).
      const overridden = deriveTheme({
        ...DEFAULT_INPUTS,
        md3PrimaryContainerOverride: { light: '#ff0000', dark: '#00ff00' },
      })
      expect(overridden.shadcn.light['--primary']).toBe('#ff0000')
      expect(overridden.shadcn.dark['--primary']).toBe('#00ff00')
    })
  })

  describe('shadcnRoleBindings', () => {
    it('default bindings preserve slice-1 mapping rule', () => {
      // why: locks the default behavior so changing the data shape can't
      // silently drift the visible mapping — DEFAULT_SHADCN_ROLE_BINDINGS
      // is the migration contract for any consumer who upgrades schema.
      const { md, shadcn } = deriveTheme(DEFAULT_INPUTS)
      expect(shadcn.light['--primary']).toBe(md.light['--color-primary-container'])
      expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary-container'])
    })

    it('rebinding shadcn primary to md primary updates only that role', () => {
      const { md, shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnRoleBindings: {
          light: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
          dark: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
        },
      })
      expect(shadcn.light['--primary']).toBe(md.light['--color-primary'])
      expect(shadcn.light['--primary-foreground']).toBe(md.light['--color-on-primary'])
      expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary'])
    })

    it('mode-keyed bindings can diverge across light and dark', () => {
      // why: the load-bearing reason bindings are mode-keyed — slice 7 will
      // admit cross-mode mapping divergence (e.g. for contrast). Verify the
      // mechanism here so the data shape carries weight before we use it.
      const { md, shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        shadcnRoleBindings: {
          light: {
            '--primary': '--color-primary-container',
            '--primary-foreground': '--color-on-primary-container',
          },
          dark: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
        },
      })
      expect(shadcn.light['--primary']).toBe(md.light['--color-primary-container'])
      expect(shadcn.dark['--primary']).toBe(md.dark['--color-primary'])
    })

    it('binding flows override through cross-layer mapping', () => {
      // why: combined pressure — override mutates the md token, the binding
      // selects which md token shadcn reads from. Both must compose without
      // drift. This is the slice-2 small-loop contract end-to-end.
      const { shadcn } = deriveTheme({
        ...DEFAULT_INPUTS,
        md3PrimaryContainerOverride: { light: '#ff0000', dark: null },
        shadcnRoleBindings: {
          light: {
            '--primary': '--color-primary-container',
            '--primary-foreground': '--color-on-primary-container',
          },
          dark: { '--primary': '--color-primary', '--primary-foreground': '--color-on-primary' },
        },
      })
      expect(shadcn.light['--primary']).toBe('#ff0000')
    })
  })

  describe('primaryHexLock', () => {
    it('null lock leaves primary family at MCU values', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({
        ...DEFAULT_INPUTS,
        primaryHexLock: { light: null, dark: null },
      })
      expect(explicit.md.light['--color-primary']).toBe(baseline.md.light['--color-primary'])
    })

    it('locked primary equals input hex exactly', () => {
      const { md } = deriveTheme({
        ...DEFAULT_INPUTS,
        primaryHexLock: { light: '#ff5500', dark: '#00ccff' },
      })
      expect(md.light['--color-primary']).toBe('#ff5500')
      expect(md.dark['--color-primary']).toBe('#00ccff')
    })

    it('lock derives on-primary / primary-container / on-primary-container from locked HCT', () => {
      const { md } = deriveTheme({
        ...DEFAULT_INPUTS,
        primaryHexLock: { light: '#ff5500', dark: null },
      })
      // family members regenerate, so they shouldn't equal MCU baseline for the seed
      const baseline = deriveTheme(DEFAULT_INPUTS)
      expect(md.light['--color-on-primary']).not.toBe(baseline.md.light['--color-on-primary'])
      expect(md.light['--color-primary-container']).not.toBe(
        baseline.md.light['--color-primary-container'],
      )
      expect(md.light['--color-on-primary-container']).not.toBe(
        baseline.md.light['--color-on-primary-container'],
      )
      expect(md.light['--color-on-primary']).toMatch(HEX)
      expect(md.light['--color-primary-container']).toMatch(HEX)
      expect(md.light['--color-on-primary-container']).toMatch(HEX)
    })

    it('container override still wins over lock-derived container', () => {
      const { md } = deriveTheme({
        ...DEFAULT_INPUTS,
        primaryHexLock: { light: '#ff5500', dark: null },
        md3PrimaryContainerOverride: { light: '#abcdef', dark: null },
      })
      expect(md.light['--color-primary-container']).toBe('#abcdef')
      // primary itself still locked
      expect(md.light['--color-primary']).toBe('#ff5500')
    })

    it('lock is mode-keyed — locking light leaves dark MCU-derived', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const { md } = deriveTheme({
        ...DEFAULT_INPUTS,
        primaryHexLock: { light: '#ff5500', dark: null },
      })
      expect(md.dark['--color-primary']).toBe(baseline.md.dark['--color-primary'])
    })
  })

  describe('contrastLevel', () => {
    it('non-zero contrast shifts md tokens away from baseline', () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const high = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 })
      // why: MCU's contrastLevel adjusts tone on dynamic colors; at least
      // some primary-family tokens should differ. Asserting !== rather than
      // a specific value because exact tone math is MCU's spec, not ours.
      expect(high.md.light['--color-primary']).not.toBe(baseline.md.light['--color-primary'])
    })
  })

  describe('surfaceAlgo', () => {
    it("'none' leaves md surface family untouched", () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const explicit = deriveTheme({ ...DEFAULT_INPUTS, surfaceAlgo: 'none' })
      expect(explicit.md.light['--color-surface']).toBe(baseline.md.light['--color-surface'])
    })

    it("'tint' replaces md surface tokens with treated values", () => {
      const baseline = deriveTheme(DEFAULT_INPUTS)
      const tinted = deriveTheme({ ...DEFAULT_INPUTS, surfaceAlgo: 'tint', surfaceTintLevel: 1 })
      expect(tinted.md.light['--color-surface']).not.toBe(baseline.md.light['--color-surface'])
      // why: shadcn primary by default binds to primary-container (not surface),
      // so the treatment should NOT change shadcn primary at default bindings.
      expect(tinted.shadcn.light['--primary']).toBe(baseline.shadcn.light['--primary'])
    })

    it('shadcn rebound to a treated surface token reflects treatment', () => {
      const tinted = deriveTheme({
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'tint',
        surfaceTintLevel: 1,
        shadcnRoleBindings: {
          light: {
            '--primary': '--color-surface-container',
            '--primary-foreground': '--color-on-surface',
          },
          dark: {
            '--primary': '--color-surface-container',
            '--primary-foreground': '--color-on-surface',
          },
        },
      })
      // why: this is the load-bearing assertion that "treatment runs before
      // shadcn binds". If treatment were post-bind, shadcn primary would equal
      // the untreated md surface-container, breaking preview === export.
      expect(tinted.shadcn.light['--primary']).toBe(tinted.md.light['--color-surface-container'])
    })
  })
})
