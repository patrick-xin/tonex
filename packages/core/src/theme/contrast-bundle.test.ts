import { afterEach, describe, expect, it } from 'vitest'
import { buildContrastBundle } from './contrast-bundle'
import { deriveTheme, getDerivedTheme } from './derive'
import { __resetDeriveCache } from './derive/cache'
import { DEFAULT_INPUTS } from './schema'

afterEach(() => {
  __resetDeriveCache()
})

describe('buildContrastBundle', () => {
  it('single-contrast: returns a bundle whose only key is `default`', () => {
    const bundle = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: false })
    expect(bundle.default).toBeDefined()
    expect(bundle.medium).toBeUndefined()
    expect(bundle.high).toBeUndefined()
  })

  it('default tier equals deriveTheme(source) for the same source', () => {
    // why: structural — single-contrast must round-trip to the spine. If
    // buildContrastBundle ever introduced a side transform, this catches it.
    const bundle = buildContrastBundle(DEFAULT_INPUTS, {})
    const direct = deriveTheme(DEFAULT_INPUTS)
    expect(bundle.default.md.light).toEqual(direct.md.light)
    expect(bundle.default.md.dark).toEqual(direct.md.dark)
    expect(bundle.default.shadcn.light).toEqual(direct.shadcn.light)
    expect(bundle.default.shadcn.dark).toEqual(direct.shadcn.dark)
  })

  it('multi-contrast: returns three distinct DerivedThemes', () => {
    const bundle = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: true })
    expect(bundle.default).toBeDefined()
    expect(bundle.medium).toBeDefined()
    expect(bundle.high).toBeDefined()
    // tones shift across tiers — at least the primary should differ
    expect(bundle.default.md.light['--color-primary']).not.toBe(
      bundle.medium?.md.light['--color-primary'],
    )
    expect(bundle.medium?.md.light['--color-primary']).not.toBe(
      bundle.high?.md.light['--color-primary'],
    )
  })

  it('default tier reflects source.contrastLevel even when variants are on', () => {
    // why: ADR-0021 commitment 5 edge case — user's preview contrast must
    // pass through unchanged on the default tier; medium/high are
    // accessibility additions at canonical 0.5 / 1.0, not overrides.
    const customSource = { ...DEFAULT_INPUTS, contrastLevel: -0.5 }
    const bundle = buildContrastBundle(customSource, { includeContrastVariants: true })
    const expectedDefault = deriveTheme(customSource)
    const expectedMedium = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 })
    const expectedHigh = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 1 })
    expect(bundle.default.md.light['--color-primary']).toBe(
      expectedDefault.md.light['--color-primary'],
    )
    expect(bundle.medium?.md.light['--color-primary']).toBe(
      expectedMedium.md.light['--color-primary'],
    )
    expect(bundle.high?.md.light['--color-primary']).toBe(expectedHigh.md.light['--color-primary'])
  })

  it('every tier emits the same field shape (only values differ)', () => {
    // why: tier-invariant emission shape lets exportCss iterate tiers
    // uniformly. If a tier were ever to diverge structurally (e.g. miss
    // chart), exportCss would silently drop tokens.
    const bundle = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: true })
    const tiers = [bundle.default, bundle.medium, bundle.high]
    for (const tier of tiers) {
      expect(tier).toBeDefined()
      if (!tier) continue
      expect(Object.keys(tier.md.light).sort()).toEqual(Object.keys(bundle.default.md.light).sort())
      expect(Object.keys(tier.md.lightExtended).sort()).toEqual(
        Object.keys(bundle.default.md.lightExtended).sort(),
      )
      expect(Object.keys(tier.md.lightChart).sort()).toEqual(
        Object.keys(bundle.default.md.lightChart).sort(),
      )
    }
  })

  it('source flow-through: custom colors propagate identically across tiers', () => {
    // why: customColor entries inflate every tier's `light`/`dark` field
    // with the slug pair. Locks that contrast-tier expansion doesn't drop
    // user-defined surfaces.
    const customSource = {
      ...DEFAULT_INPUTS,
      customColors: [
        {
          id: 'id-success',
          name: 'Success',
          hex: '#22c55e',
          blend: false,
          shadcnSource: 'color' as const,
        },
      ],
    }
    const bundle = buildContrastBundle(customSource, { includeContrastVariants: true })
    expect(bundle.default.md.light['--color-success']).toBeDefined()
    expect(bundle.medium?.md.light['--color-success']).toBeDefined()
    expect(bundle.high?.md.light['--color-success']).toBeDefined()
  })

  // why: tier values come from the unified derive cache (issue #20). Same
  // source → same DerivedTheme reference per tier, even though the bundle
  // wrapper is a fresh object each call. The wrapper is incidental; the
  // load-bearing memoization is at the tier level.
  it('caches: same (source, opts) returns the same DerivedTheme references per tier', () => {
    const a = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: false })
    const b = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: false })
    expect(b.default).toBe(a.default)
  })

  it('caches: multi-contrast tiers share references across calls', () => {
    const a = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: true })
    const b = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: true })
    expect(b.default).toBe(a.default)
    expect(b.medium).toBe(a.medium)
    expect(b.high).toBe(a.high)
  })

  // why: issue #20 acceptance — buildContrastBundle and getDerivedTheme hit
  // the same underlying cache for the default tier. Without unification,
  // toggling includeContrastVariants would re-derive even though
  // useResolvedTokens already cached the same source.
  it('shares default-tier cache with getDerivedTheme', () => {
    const bundle = buildContrastBundle(DEFAULT_INPUTS, { includeContrastVariants: true })
    expect(getDerivedTheme(DEFAULT_INPUTS)).toBe(bundle.default)
  })

  it('cache survives non-contrast flag changes (other ExportOptions are not bundle-shape)', () => {
    // why: colorFormat / includeChart / includeExtended only affect
    // exportCss's stringification, not which DerivedThemes the bundle
    // carries. Flipping them shouldn't trigger a re-derive — the underlying
    // cache key is (source, contrastLevel), independent of these flags.
    const a = buildContrastBundle(DEFAULT_INPUTS, {
      includeContrastVariants: true,
      colorFormat: 'oklch',
    })
    const b = buildContrastBundle(DEFAULT_INPUTS, {
      includeContrastVariants: true,
      colorFormat: 'hex',
      includeChart: true,
      includeExtended: false,
    })
    expect(b.default).toBe(a.default)
    expect(b.medium).toBe(a.medium)
    expect(b.high).toBe(a.high)
  })
})
