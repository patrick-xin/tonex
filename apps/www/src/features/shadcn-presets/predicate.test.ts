import { DEFAULT_INPUTS } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { isPresetSwitchDirty, presetSwitchNeedsDialog } from './predicate'

// why: predicate gates the confirm dialog on preset chip clicks. "Dirty" means
// the theme has drifted off every shipped preset on any of the six fields
// setShadcnPreset overwrites (variant + surface scalars + bindings). Hex
// overrides (shadcnRoleOverrides / shadcnChartOverrides / md3TokenOverrides
// / paletteOverrides) sit ABOVE bindings per ADR-0026, survive the action,
// and therefore must not trigger dirty here — otherwise users with an
// orthogonal hex pin would be warned on a preset switch that wouldn't
// actually wipe anything they own.
describe('isPresetSwitchDirty', () => {
  it('is false for DEFAULT_INPUTS (matches the `default` preset)', () => {
    expect(isPresetSwitchDirty(DEFAULT_INPUTS)).toBe(false)
  })

  it('is true after a single per-role binding edit', () => {
    expect(
      isPresetSwitchDirty({
        ...DEFAULT_INPUTS,
        shadcnRoleBindings: {
          ...DEFAULT_INPUTS.shadcnRoleBindings,
          light: {
            ...DEFAULT_INPUTS.shadcnRoleBindings.light,
            '--ring': '--color-tertiary',
          },
        },
      }),
    ).toBe(true)
  })

  it('is true after a variant change', () => {
    expect(isPresetSwitchDirty({ ...DEFAULT_INPUTS, variant: 'vibrant' })).toBe(true)
  })

  it('is true after a surface tint slider move', () => {
    expect(
      isPresetSwitchDirty({
        ...DEFAULT_INPUTS,
        surfaceTintLevel: { ...DEFAULT_INPUTS.surfaceTintLevel, light: 0.5 },
      }),
    ).toBe(true)
  })

  // why: ADR-0031 #5/#6 — the seed is a source input, not part of the recipe
  // identity. A theme on a preset's recipe but carrying a different seed must
  // NOT read as dirty, so seed supersession on apply opens no confirmation
  // dialog. This pins the regression alongside the recipe-only detection fix
  // in issue #108.
  it('is false when only the seed differs from the matched preset recipe', () => {
    expect(
      isPresetSwitchDirty({
        ...DEFAULT_INPUTS,
        seed: { hue: 30, chroma: 60, tone: 55, exactHex: '#c2683a' },
      }),
    ).toBe(false)
  })

  it('is false when only orthogonal hex overrides are set (no bundle drift)', () => {
    expect(
      isPresetSwitchDirty({
        ...DEFAULT_INPUTS,
        shadcnRoleOverrides: { light: { '--primary': '#ff0000' }, dark: {} },
        md3TokenOverrides: { light: { '--color-primary': '#abcdef' }, dark: {} },
        paletteOverrides: { primary: '#123456' },
      }),
    ).toBe(false)
  })
})

// why: presetSwitchNeedsDialog widens isPresetSwitchDirty (recipe loss) to also
// cover the source-input *choices* the dialog now offers. The dialog opens
// whenever applying involves any decision: a custom recipe to replace, or a
// touched-and-unlocked source field whose "keep vs use preset's" switch must be
// shown. A clean theme with nothing touched still applies straight through.
describe('presetSwitchNeedsDialog', () => {
  it('is false for DEFAULT_INPUTS (clean recipe, nothing touched)', () => {
    expect(presetSwitchNeedsDialog(DEFAULT_INPUTS)).toBe(false)
  })

  it('is true when the recipe has drifted (delegates to isPresetSwitchDirty)', () => {
    expect(presetSwitchNeedsDialog({ ...DEFAULT_INPUTS, variant: 'vibrant' })).toBe(true)
  })

  it('is true when the seed is touched and unlocked (a keep-vs-adopt choice exists)', () => {
    expect(presetSwitchNeedsDialog({ ...DEFAULT_INPUTS, seedTouched: true })).toBe(true)
  })

  // why: a locked seed is kept by the resolver regardless, so no switch is
  // offered and no dialog is owed on its account alone.
  it('is false when the touched seed is locked and the recipe is clean', () => {
    expect(
      presetSwitchNeedsDialog({ ...DEFAULT_INPUTS, seedTouched: true, seedHexLock: true }),
    ).toBe(false)
  })

  it('is true when contrast is touched', () => {
    expect(presetSwitchNeedsDialog({ ...DEFAULT_INPUTS, contrastTouched: true })).toBe(true)
  })
})
