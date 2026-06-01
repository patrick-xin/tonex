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
    expect(resolveExpectedBindings(DEFAULT_INPUTS, DEFAULT_SHADCN_ROLE_BINDINGS)).toEqual(
      DEFAULT_SHADCN_ROLE_BINDINGS,
    )
  })

  it('follows the active THEME preset baseline, not the fixed default', () => {
    const baseline = SHADCN_PRESETS.paper.shadcnRoleBindings
    // premise: paper's routing genuinely diverges from the fixed default
    // (light --card -> --color-surface vs --color-surface-container), so
    // following it is observably different from the old default-relative behavior.
    expect(baseline.light['--card']).not.toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
    // on a detected theme preset, expected IS that preset's map verbatim — so a
    // per-row reset restores the active preset's value, not the default's.
    // Detection wins; the fallback (here default) is never consulted.
    expect(resolveExpectedBindings(onPreset('paper'), DEFAULT_SHADCN_ROLE_BINDINGS)).toEqual(
      baseline,
    )
  })

  it('follows an active BINDING preset when no theme preset matches', () => {
    // default recipe + clean routing: findActivePreset is null, findActiveBindingPreset
    // is 'clean' — baseline must come from the binding tier.
    const onClean: PortableTheme = {
      ...DEFAULT_INPUTS,
      shadcnRoleBindings: SHADCN_BINDING_PRESETS.clean.shadcnRoleBindings,
    }
    const expected = resolveExpectedBindings(onClean, DEFAULT_SHADCN_ROLE_BINDINGS)
    expect(expected.light['--card']).toBe(
      SHADCN_BINDING_PRESETS.clean.shadcnRoleBindings.light['--card'],
    )
    expect(expected.light['--card']).not.toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
  })

  it('forces soft edges into the baseline when the soft edge weight is on', () => {
    // soft-border on a default theme: edge rows must read as expected (not custom),
    // while non-edge roles still measure against the default baseline.
    const expected = resolveExpectedBindings(
      withEdges(DEFAULT_INPUTS, SOFT),
      DEFAULT_SHADCN_ROLE_BINDINGS,
    )
    expect(expected.light['--border']).toBe(SOFT)
    expect(expected.dark['--sidebar-border']).toBe(SOFT)
    expect(expected.light['--card']).toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
  })

  it('composes the soft-edge modifier on top of a theme-preset baseline', () => {
    const expected = resolveExpectedBindings(
      withEdges(onPreset('paper'), SOFT),
      DEFAULT_SHADCN_ROLE_BINDINGS,
    )
    // non-edge roles still follow paper; the three edge roles are forced soft.
    expect(expected.light['--card']).toBe(SHADCN_PRESETS.paper.shadcnRoleBindings.light['--card'])
    expect(expected.light['--input']).toBe(SOFT)
    expect(expected.dark['--border']).toBe(SOFT)
  })

  it('returns the supplied fallback when drifted — default fallback degrades to option-1', () => {
    // when the rail has no better baseline to offer (fresh boot, or a stamp was
    // missed), it passes the fixed default. Detection is null on a drifted map, so
    // the fallback is what's returned: behavior degrades safely to default-relative
    // (option 1), never to a WRONG preset.
    const customRouting: PortableTheme = {
      ...DEFAULT_INPUTS,
      shadcnRoleBindings: {
        light: { ...DEFAULT_INPUTS.shadcnRoleBindings.light, '--card': '--color-primary' },
        dark: { ...DEFAULT_INPUTS.shadcnRoleBindings.dark, '--card': '--color-primary' },
      },
    }
    const expected = resolveExpectedBindings(customRouting, DEFAULT_SHADCN_ROLE_BINDINGS)
    expect(expected.light['--card']).toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])
  })

  it('measures against the supplied baseline, not the fixed default, when drifted (sticky)', () => {
    // option 1.5: a hand-edit to ONE non-edge role nulls detection, but the rail
    // passes the last-applied preset as the fallback baseline. Untouched sibling
    // rows must keep measuring against THAT preset — only the drifted role reads
    // custom. This is the fix for "I changed one field, why did the others light
    // up?": without it, the whole panel snaps back to default-relative.
    const paperBaseline = SHADCN_PRESETS.paper.shadcnRoleBindings
    const driftedFromPaper: PortableTheme = {
      ...onPreset('paper'),
      shadcnRoleBindings: {
        light: { ...paperBaseline.light, '--popover': '--color-primary' },
        dark: { ...paperBaseline.dark, '--popover': '--color-primary' },
      },
    }
    // premise: paper's --card genuinely diverges from the fixed default, so
    // following paper is observably different from default-relative.
    expect(paperBaseline.light['--card']).not.toBe(DEFAULT_SHADCN_ROLE_BINDINGS.light['--card'])

    const expected = resolveExpectedBindings(driftedFromPaper, paperBaseline)
    // sibling rows still measure against paper, NOT the fixed default
    expect(expected.light['--card']).toBe(paperBaseline.light['--card'])
  })
})
