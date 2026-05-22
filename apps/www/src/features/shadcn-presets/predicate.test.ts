import { DEFAULT_INPUTS } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { isPresetSwitchDirty } from './predicate'

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
