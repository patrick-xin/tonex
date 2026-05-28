import { DEFAULT_INPUTS, SHADCN_ROLE_NAMES, type ShadcnRoleBindings } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BUNDLE,
  diffBindings,
  diffBundle,
  type PresetBundle,
  snapshotBundle,
} from './bundle-snapshot'

// why: this module is the "engineering-slice" contract (issue #36) — a pure
// data snapshot of the bindable surface and a diff against a baseline. The
// invariants worth pinning:
//   - snapshotBundle copies by value (mutating the snapshot must NOT touch
//     the source, and vice versa)
//   - diffBindings returns only the roles that actually differ, in canonical
//     SHADCN_ROLE_NAMES order
//   - diffBundle's totalChanges is the consistent sum of every changed flag
//     plus per-mode binding deltas (used as the "X changes" badge in the UI)
//
// We avoid pinning DEFAULT_BUNDLE field values — that's curated baseline
// data per the data-curation convention.

function cloneBundle(b: PresetBundle): PresetBundle {
  return {
    variant: b.variant,
    surfaceAlgo: b.surfaceAlgo,
    surfacePaletteName: b.surfacePaletteName,
    surfaceTintLevel: { ...b.surfaceTintLevel },
    surfaceTintTextLevel: { ...b.surfaceTintTextLevel },
    surfaceDesaturateLevel: { ...b.surfaceDesaturateLevel },
    shadcnRoleBindings: {
      light: { ...b.shadcnRoleBindings.light },
      dark: { ...b.shadcnRoleBindings.dark },
    },
  }
}

describe('snapshotBundle', () => {
  it('copies primitives verbatim from the source theme', () => {
    const bundle = snapshotBundle(DEFAULT_INPUTS)
    expect(bundle.variant).toBe(DEFAULT_INPUTS.variant)
    expect(bundle.surfaceAlgo).toBe(DEFAULT_INPUTS.surfaceAlgo)
    expect(bundle.surfacePaletteName).toBe(DEFAULT_INPUTS.surfacePaletteName)
  })

  it('deep-copies surface level objects — mutation does not leak into the source', () => {
    const bundle = snapshotBundle(DEFAULT_INPUTS)
    expect(bundle.surfaceTintLevel).not.toBe(DEFAULT_INPUTS.surfaceTintLevel)
    expect(bundle.surfaceTintTextLevel).not.toBe(DEFAULT_INPUTS.surfaceTintTextLevel)
    expect(bundle.surfaceDesaturateLevel).not.toBe(DEFAULT_INPUTS.surfaceDesaturateLevel)
    bundle.surfaceTintLevel.light = 0.9
    expect(DEFAULT_INPUTS.surfaceTintLevel.light).not.toBe(0.9)
  })

  it('deep-copies bindings per mode — light/dark each get a fresh object', () => {
    const bundle = snapshotBundle(DEFAULT_INPUTS)
    expect(bundle.shadcnRoleBindings.light).not.toBe(DEFAULT_INPUTS.shadcnRoleBindings.light)
    expect(bundle.shadcnRoleBindings.dark).not.toBe(DEFAULT_INPUTS.shadcnRoleBindings.dark)
    expect(bundle.shadcnRoleBindings.light).toEqual(DEFAULT_INPUTS.shadcnRoleBindings.light)
    expect(bundle.shadcnRoleBindings.dark).toEqual(DEFAULT_INPUTS.shadcnRoleBindings.dark)
  })
})

describe('DEFAULT_BUNDLE', () => {
  it('is the snapshot of DEFAULT_INPUTS — structurally equal to a fresh snapshot', () => {
    expect(DEFAULT_BUNDLE).toEqual(snapshotBundle(DEFAULT_INPUTS))
  })
})

describe('diffBindings', () => {
  it('returns an empty array when both maps are equal', () => {
    const map = DEFAULT_BUNDLE.shadcnRoleBindings.light
    expect(diffBindings(map, { ...map })).toEqual([])
  })

  it('returns only the roles that actually differ', () => {
    const baseline = DEFAULT_BUNDLE.shadcnRoleBindings.light
    const changed: ShadcnRoleBindings = {
      ...baseline,
      '--primary': '--color-secondary',
      '--background': '--color-surface-container',
    }
    const out = diffBindings(changed, baseline)
    expect(new Set(out)).toEqual(new Set(['--primary', '--background']))
  })

  it('walks roles in SHADCN_ROLE_NAMES order (deterministic for downstream rendering)', () => {
    // Build a "all roles changed" current map by flipping each value to a sentinel.
    const baseline = DEFAULT_BUNDLE.shadcnRoleBindings.light
    const current = Object.fromEntries(
      SHADCN_ROLE_NAMES.map((r) => [r, '--color-tertiary']),
    ) as ShadcnRoleBindings
    const out = diffBindings(current, baseline)
    // Some roles in baseline may already map to '--color-tertiary' — filter to keep
    // only the genuinely changed ones, but the relative order among the rest must
    // match SHADCN_ROLE_NAMES.
    const expected = SHADCN_ROLE_NAMES.filter((r) => baseline[r] !== '--color-tertiary')
    expect(out).toEqual(expected)
  })
})

describe('diffBundle', () => {
  it('reports zero changes for two snapshots of the same source', () => {
    const a = snapshotBundle(DEFAULT_INPUTS)
    const b = snapshotBundle(DEFAULT_INPUTS)
    const diff = diffBundle(a, b)
    expect(diff.totalChanges).toBe(0)
    expect(diff.variantChanged).toBe(false)
    expect(diff.surfaceAlgoChanged).toBe(false)
    expect(diff.surfacePaletteNameChanged).toBe(false)
    expect(diff.bindings.light).toEqual([])
    expect(diff.bindings.dark).toEqual([])
  })

  it('flips variantChanged independently of other fields', () => {
    const baseline = snapshotBundle(DEFAULT_INPUTS)
    const bundle = cloneBundle(baseline)
    bundle.variant = bundle.variant === 'tonalSpot' ? 'vibrant' : 'tonalSpot'
    const diff = diffBundle(bundle, baseline)
    expect(diff.variantChanged).toBe(true)
    expect(diff.totalChanges).toBe(1)
  })

  it('flips per-mode surface-level flags independently (light vs dark)', () => {
    const baseline = snapshotBundle(DEFAULT_INPUTS)
    const bundle = cloneBundle(baseline)
    bundle.surfaceTintLevel.light = baseline.surfaceTintLevel.light + 0.1
    const diff = diffBundle(bundle, baseline)
    expect(diff.surfaceTintLevel.light).toBe(true)
    expect(diff.surfaceTintLevel.dark).toBe(false)
    expect(diff.totalChanges).toBe(1)
  })

  it('reports per-mode binding deltas in the bindings array', () => {
    const baseline = snapshotBundle(DEFAULT_INPUTS)
    const bundle = cloneBundle(baseline)
    bundle.shadcnRoleBindings.light = {
      ...bundle.shadcnRoleBindings.light,
      '--primary': '--color-tertiary',
    }
    bundle.shadcnRoleBindings.dark = {
      ...bundle.shadcnRoleBindings.dark,
      '--accent': '--color-tertiary',
    }
    const diff = diffBundle(bundle, baseline)
    expect(diff.bindings.light).toEqual(['--primary'])
    expect(diff.bindings.dark).toEqual(['--accent'])
  })

  it('sums every changed flag + binding deltas into totalChanges', () => {
    const baseline = snapshotBundle(DEFAULT_INPUTS)
    const bundle = cloneBundle(baseline)
    bundle.variant = bundle.variant === 'tonalSpot' ? 'vibrant' : 'tonalSpot'
    bundle.surfaceTintLevel.light = baseline.surfaceTintLevel.light + 0.1
    bundle.surfaceTintTextLevel.dark = baseline.surfaceTintTextLevel.dark + 0.1
    bundle.shadcnRoleBindings.light = {
      ...bundle.shadcnRoleBindings.light,
      '--primary': '--color-tertiary',
      '--accent': '--color-tertiary',
    }
    const diff = diffBundle(bundle, baseline)
    // variantChanged(1) + tintLight(1) + textTintDark(1) + light bindings(2) = 5
    expect(diff.totalChanges).toBe(5)
  })
})
