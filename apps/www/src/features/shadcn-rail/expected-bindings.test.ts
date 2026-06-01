import {
  DEFAULT_INPUTS,
  DEFAULT_SHADCN_ROLE_BINDINGS,
  type MdTokenName,
  type PortableTheme,
  SHADCN_BINDING_PRESETS,
  SHADCN_PRESETS,
  type ShadcnPresetName,
} from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'
import { resolveExpectedBindings } from './expected-bindings'

const SOFT: MdTokenName = '--color-outline-variant'

// why: build a PortableTheme that findActivePreset will detect as `name` by
// stamping exactly the 6 recipe fields + bindings it compares. Seed/contrast are
// irrelevant to detection, so DEFAULT_INPUTS' values ride along untouched.
function onPreset(name: ShadcnPresetName): PortableTheme {
  const p = SHADCN_PRESETS[name]
  return {
    ...DEFAULT_INPUTS,
    variant: p.variant,
    surfaceAlgo: p.surfaceAlgo,
    surfacePaletteName: p.surfacePaletteName,
    surfaceTintLevel: p.surfaceTintLevel,
    surfaceTintTextLevel: p.surfaceTintTextLevel,
    surfaceDesaturateLevel: p.surfaceDesaturateLevel,
    shadcnRoleBindings: p.shadcnRoleBindings,
  }
}

function withEdges(theme: PortableTheme, token: MdTokenName): PortableTheme {
  const set = (m: PortableTheme['shadcnRoleBindings']['light']) => ({
    ...m,
    '--border': token,
    '--input': token,
    '--sidebar-border': token,
  })
  return {
    ...theme,
    shadcnRoleBindings: {
      light: set(theme.shadcnRoleBindings.light),
      dark: set(theme.shadcnRoleBindings.dark),
    },
  }
}

// why: the rail's "custom" dot, per-row reset target, and group highlight all read
// resolveExpectedBindings, so it must report the ACTIVE preset's routing (theme
// tier first, binding tier next) — not the fixed default. This is the slice-3 fix
// for false-custom dots and reset-breaks-the-active-preset (e.g. resetting --card
// on a non-default preset yanking it to default's value).
describe('resolveExpectedBindings', () => {
  it('returns the fixed default routing on the default theme', () => {
    expect(resolveExpectedBindings(DEFAULT_INPUTS)).toEqual(DEFAULT_SHADCN_ROLE_BINDINGS)
  })

  it('follows the active THEME preset baseline, not the fixed default', () => {
    const baseline = SHADCN_PRESETS.paper.shadcnRoleBindings
    // premise: paper's routing genuinely diverges from the fixed default
    // (light --card -> --color-surface vs --color-surface-container), so
    // following it is observably different from the old default-relative behavior.
    expect(baseline.light['--card']).not.toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
    // on a detected theme preset, expected IS that preset's map verbatim — so a
    // per-row reset restores the active preset's value, not the default's.
    expect(resolveExpectedBindings(onPreset('paper'))).toEqual(baseline)
  })

  it('follows an active BINDING preset when no theme preset matches', () => {
    // default recipe + clean routing: findActivePreset is null, findActiveBindingPreset
    // is 'clean' — baseline must come from the binding tier.
    const onClean: PortableTheme = {
      ...DEFAULT_INPUTS,
      shadcnRoleBindings: SHADCN_BINDING_PRESETS.clean.shadcnRoleBindings,
    }
    const expected = resolveExpectedBindings(onClean)
    expect(expected.light['--card']).toBe(
      SHADCN_BINDING_PRESETS.clean.shadcnRoleBindings.light['--card'],
    )
    expect(expected.light['--card']).not.toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
  })

  it('forces soft edges into the baseline when the soft edge weight is on', () => {
    // soft-border on a default theme: edge rows must read as expected (not custom),
    // while non-edge roles still measure against the default baseline.
    const expected = resolveExpectedBindings(withEdges(DEFAULT_INPUTS, SOFT))
    expect(expected.light['--border']).toBe(SOFT)
    expect(expected.dark['--sidebar-border']).toBe(SOFT)
    expect(expected.light['--card']).toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
  })

  it('composes the soft-edge modifier on top of a theme-preset baseline', () => {
    const expected = resolveExpectedBindings(withEdges(onPreset('paper'), SOFT))
    // non-edge roles still follow paper; the three edge roles are forced soft.
    expect(expected.light['--card']).toBe(SHADCN_PRESETS.paper.shadcnRoleBindings.light['--card'])
    expect(expected.light['--input']).toBe(SOFT)
    expect(expected.dark['--border']).toBe(SOFT)
  })

  it('falls back to the fixed default when a non-edge role has drifted off every preset', () => {
    // option 1 (detection-based, no tracked baseline): a hand-edit to a non-edge
    // role snaps detection to null, so the baseline reverts to the fixed default.
    // The drifted role then reads as custom — which it is.
    const customRouting: PortableTheme = {
      ...DEFAULT_INPUTS,
      shadcnRoleBindings: {
        light: { ...DEFAULT_INPUTS.shadcnRoleBindings.light, '--card': '--color-primary' },
        dark: { ...DEFAULT_INPUTS.shadcnRoleBindings.dark, '--card': '--color-primary' },
      },
    }
    const expected = resolveExpectedBindings(customRouting)
    expect(expected.light['--card']).toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
  })
})
