import { describe, expect, it } from 'vitest'
import { hctFromHex } from './hct'
import { resolvePresetApply } from './preset-apply'
import { DEFAULT_INPUTS, type PortableTheme } from './schema'
import { SHADCN_PRESETS } from './shadcn-presets'

// why: the apply resolver is the deep module of ADR-0031 — given the current
// theme (carrying its per-field touched signals and locks) and a target
// preset, it returns the patch to apply. Per-field source resolution and the
// always-overwrite recipe rule are exhaustively pinned here, in isolation from
// the store and UI, mirroring the isPresetSwitchDirty predicate spec's
// pure-function discipline. Issue #109 covers the seed field; contrast lands
// in a follow-on slice.

// why: a seed distinct from every curated preset seed AND from the boot
// default, so "kept" vs "superseded" is unambiguous in assertions.
const USER_SEED = { ...hctFromHex('#ff00aa'), exactHex: '#ff00aa' }

function themeWith(overrides: Partial<PortableTheme>): PortableTheme {
  return { ...DEFAULT_INPUTS, ...overrides }
}

describe('resolvePresetApply — seed source field', () => {
  it('supersedes an untouched, unlocked seed with the preset curated seed', () => {
    const theme = themeWith({ seed: USER_SEED, seedTouched: false, seedHexLock: false })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove)
    expect(patch.seed).toEqual(SHADCN_PRESETS.grove.seed)
  })

  it('keeps a touched seed and drops the curated one', () => {
    const theme = themeWith({ seed: USER_SEED, seedTouched: true, seedHexLock: false })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove)
    expect(patch.seed).toBeUndefined()
  })

  it('keeps a locked seed even when untouched', () => {
    const theme = themeWith({ seed: USER_SEED, seedTouched: false, seedHexLock: true })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove)
    expect(patch.seed).toBeUndefined()
  })

  it('keeps a seed that is touched AND locked', () => {
    const theme = themeWith({ seed: USER_SEED, seedTouched: true, seedHexLock: true })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove)
    expect(patch.seed).toBeUndefined()
  })

  // why: ADR-0031 #4 — touched is a recorded signal, not a value comparison. A
  // user sitting on a value equal to the default but with the signal set keeps
  // it; the resolver must read the flag, never compare to DEFAULT_INPUTS.seed.
  it('keeps a seed equal to the boot default when the signal says touched', () => {
    const theme = themeWith({ seedTouched: true })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove)
    expect(patch.seed).toBeUndefined()
  })

  // why: ADR-0031 #3 / story 12 — a curated seed written by the resolver must
  // not mark the field touched, or a second preset switch would read the
  // previous preset's color as the user's and stop superseding.
  it('never marks the seed touched in the returned patch', () => {
    const untouched = themeWith({ seedTouched: false, seedHexLock: false })
    const touched = themeWith({ seed: USER_SEED, seedTouched: true })
    expect('seedTouched' in resolvePresetApply(untouched, SHADCN_PRESETS.grove)).toBe(false)
    expect('seedTouched' in resolvePresetApply(touched, SHADCN_PRESETS.grove)).toBe(false)
  })
})

describe('resolvePresetApply — contrast source field', () => {
  // why: contrast has no lock (only the seed does — CONTEXT: Lock), so its
  // matrix is just touched vs untouched. 'enterprise' carries a non-zero curated
  // contrast, so supersession is observable against the boot default of 0.
  it('supersedes an untouched contrast with the preset curated contrast', () => {
    const theme = themeWith({ contrastLevel: { light: 0.7, dark: 0.7 }, contrastTouched: false })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.enterprise)
    expect(patch.contrastLevel).toEqual(SHADCN_PRESETS.enterprise.contrastLevel)
  })

  it('keeps a touched contrast and drops the curated one', () => {
    const theme = themeWith({ contrastLevel: { light: 0.7, dark: 0.7 }, contrastTouched: true })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.enterprise)
    expect(patch.contrastLevel).toBeUndefined()
  })

  // why: ADR-0031 #3 / story — a curated contrast written by the resolver must
  // not mark the field touched, mirroring the seed rule.
  it('never marks contrast touched in the returned patch', () => {
    const untouched = themeWith({ contrastTouched: false })
    const touched = themeWith({ contrastLevel: { light: 0.7, dark: 0.7 }, contrastTouched: true })
    expect('contrastTouched' in resolvePresetApply(untouched, SHADCN_PRESETS.enterprise)).toBe(
      false,
    )
    expect('contrastTouched' in resolvePresetApply(touched, SHADCN_PRESETS.enterprise)).toBe(false)
  })
})

describe('resolvePresetApply — seed and contrast resolve independently', () => {
  // why: the per-field point of ADR-0031 #3 — each source input is honored on
  // its own terms, not all-or-nothing. 'enterprise' carries both a non-default
  // curated seed and a non-default curated contrast.
  it('touched contrast only: curated seed adopted, user contrast kept', () => {
    const theme = themeWith({
      seed: USER_SEED,
      seedTouched: false,
      contrastLevel: { light: 0.7, dark: 0.7 },
      contrastTouched: true,
    })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.enterprise)
    expect(patch.seed).toEqual(SHADCN_PRESETS.enterprise.seed)
    expect(patch.contrastLevel).toBeUndefined()
  })

  it('touched seed only: curated contrast adopted, user seed kept', () => {
    const theme = themeWith({
      seed: USER_SEED,
      seedTouched: true,
      contrastLevel: { light: 0.7, dark: 0.7 },
      contrastTouched: false,
    })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.enterprise)
    expect(patch.seed).toBeUndefined()
    expect(patch.contrastLevel).toEqual(SHADCN_PRESETS.enterprise.contrastLevel)
  })
})

describe('resolvePresetApply — explicit adopt choices (dialog switches)', () => {
  // why: the preset-apply dialog lets the user override the keep-if-touched
  // default per field ("Use {preset}'s"). A set choice adopts the curated value
  // even over a touched field, and clears the signal so the adopted value isn't
  // read as a user choice on the next switch (mirrors the untouched-adopt rule).
  it('adopts the curated seed over a touched seed when the seed choice is set', () => {
    const theme = themeWith({ seed: USER_SEED, seedTouched: true, seedHexLock: false })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove, { seed: true })
    expect(patch.seed).toEqual(SHADCN_PRESETS.grove.seed)
    expect(patch.seedTouched).toBe(false)
  })

  it('adopts the curated contrast over a touched contrast when the contrast choice is set', () => {
    const theme = themeWith({ contrastLevel: { light: 0.7, dark: 0.7 }, contrastTouched: true })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.enterprise, { contrast: true })
    expect(patch.contrastLevel).toEqual(SHADCN_PRESETS.enterprise.contrastLevel)
    expect(patch.contrastTouched).toBe(false)
  })

  // why: lock outranks the dialog — a locked seed means "do not move this" by
  // any path (CONTEXT: Lock), so an adopt choice can't override it. The dialog
  // never offers the switch for a locked seed, but the resolver stays the
  // authority regardless of what the UI passes.
  it('keeps a locked seed even when the seed choice is set', () => {
    const theme = themeWith({ seed: USER_SEED, seedTouched: true, seedHexLock: true })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove, { seed: true })
    expect(patch.seed).toBeUndefined()
  })

  it('keeps a touched field when its choice is absent or false', () => {
    const theme = themeWith({
      seed: USER_SEED,
      seedTouched: true,
      contrastLevel: { light: 0.7, dark: 0.7 },
      contrastTouched: true,
    })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.enterprise, { seed: false })
    expect(patch.seed).toBeUndefined()
    expect(patch.contrastLevel).toBeUndefined()
  })

  // why: a choice on an untouched field is a no-op — the field already adopts
  // the curated value, and the resolver must not start emitting a redundant
  // `touched: false` that wasn't there before (the existing patch-shape pins).
  it('does not add a touched signal for an untouched field given a choice', () => {
    const theme = themeWith({ seedTouched: false, contrastTouched: false })
    const patch = resolvePresetApply(theme, SHADCN_PRESETS.grove, { seed: true, contrast: true })
    expect('seedTouched' in patch).toBe(false)
    expect('contrastTouched' in patch).toBe(false)
  })
})

describe('resolvePresetApply — recipe fields always overwrite', () => {
  // why: regardless of source-field resolution, every recipe field detection
  // compares (issue #108) is written unconditionally, so the just-applied
  // preset reads as active. Pin the full set against a fully-drifted theme.
  it.each(
    Object.keys(SHADCN_PRESETS) as (keyof typeof SHADCN_PRESETS)[],
  )('writes every recipe field for "%s"', (name) => {
    const preset = SHADCN_PRESETS[name]
    const drifted = themeWith({
      variant: 'monochrome',
      surfaceAlgo: 'tint',
      surfacePaletteName: 'slate',
      surfaceTintLevel: { light: 0.42, dark: 0.18 },
      surfaceTintTextLevel: { light: 0.55, dark: 0.27 },
      surfaceDesaturateLevel: { light: 0.73, dark: 0.31 },
    })
    const patch = resolvePresetApply(drifted, preset)
    expect(patch.variant).toBe(preset.variant)
    expect(patch.surfaceAlgo).toBe(preset.surfaceAlgo)
    expect(patch.surfacePaletteName).toBe(preset.surfacePaletteName)
    expect(patch.surfaceTintLevel).toEqual(preset.surfaceTintLevel)
    expect(patch.surfaceTintTextLevel).toEqual(preset.surfaceTintTextLevel)
    expect(patch.surfaceDesaturateLevel).toEqual(preset.surfaceDesaturateLevel)
    expect(patch.shadcnRoleBindings).toEqual(preset.shadcnRoleBindings)
  })
})
