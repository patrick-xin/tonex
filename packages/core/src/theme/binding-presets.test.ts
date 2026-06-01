import { describe, expect, it } from 'vitest'
import {
  findActiveBindingPreset,
  SHADCN_BINDING_PRESETS,
  type ShadcnBindingPresetName,
} from './binding-presets'
import { MODES } from './mode'
import {
  DEFAULT_INPUTS,
  MD_TOKEN_NAMES,
  type MdTokenName,
  type PortableTheme,
  SHADCN_ROLE_NAMES,
} from './schema'

// why: SHADCN_BINDING_PRESETS is hand-authored curated data (entries pasted
// from the preset tuner), so the failure mode is a typo'd md token or a
// dropped role — not an algorithm bug. These assertions are spec-derived from
// the SAME runtime contracts the PortableThemeSchema validator enforces
// (SHADCN_ROLE_NAMES key set, MD_TOKEN_NAMES value domain), so a malformed
// entry fails here at author time instead of silently mis-deriving at runtime.
// They validate well-formedness, deliberately NOT the curator's token choices.

const VALID_TOKENS = new Set<string>(MD_TOKEN_NAMES)
const REQUIRED_ROLES = new Set<string>(SHADCN_ROLE_NAMES)
const PRESET_ENTRIES = Object.entries(SHADCN_BINDING_PRESETS)

it('declares at least one curated binding preset', () => {
  expect(PRESET_ENTRIES.length).toBeGreaterThan(0)
})

describe.each(PRESET_ENTRIES)('binding preset "%s"', (_name, preset) => {
  it('has a non-empty description (users pick by outcome, not token vocabulary)', () => {
    expect(preset.description.trim().length).toBeGreaterThan(0)
  })

  for (const mode of MODES) {
    const bindings = preset.shadcnRoleBindings[mode]

    it(`${mode}: binds exactly the full shadcn role set (no missing, no extra)`, () => {
      expect(new Set(Object.keys(bindings))).toEqual(REQUIRED_ROLES)
    })

    it(`${mode}: every binding targets a real md token`, () => {
      for (const [role, token] of Object.entries(bindings)) {
        expect(VALID_TOKENS, `${role} → ${token}`).toContain(token)
      }
    })
  }
})

// why: findActiveBindingPreset is the binding-tier mirror of findActivePreset —
// structural equality on shadcnRoleBindings across BOTH modes, returning a name
// or null ("custom routing"). These pin the identity contract a binding-preset
// picker reads to highlight its selection: it must round-trip each preset, ignore
// everything but the bindings (the tier independence of ADR-0031 #1), and report
// null off-catalog exactly as findActivePreset does for the theme tier.
const BINDING_PRESET_NAMES = Object.keys(SHADCN_BINDING_PRESETS) as ShadcnBindingPresetName[]

describe('findActiveBindingPreset', () => {
  it.each(BINDING_PRESET_NAMES)('round-trips "%s" from its own binding map', (name) => {
    // why: a bare { shadcnRoleBindings } object — no recipe, no seed — is enough
    // to detect, because the matcher reads only that field (Pick). That bareness
    // IS the tier independence.
    expect(
      findActiveBindingPreset({
        shadcnRoleBindings: SHADCN_BINDING_PRESETS[name].shadcnRoleBindings,
      }),
    ).toBe(name)
  })

  it('matches on bindings alone, independent of variant/surface/seed', () => {
    const name = BINDING_PRESET_NAMES[0]!
    const theme: PortableTheme = {
      ...DEFAULT_INPUTS,
      variant: 'monochrome',
      surfaceAlgo: 'tint',
      surfaceDesaturateLevel: { light: 0.9, dark: 0.9 },
      shadcnRoleBindings: SHADCN_BINDING_PRESETS[name].shadcnRoleBindings,
    }
    expect(findActiveBindingPreset(theme)).toBe(name)
  })

  it('detects the default routing as the "default" binding preset', () => {
    // why: the `default` binding preset is keyed off SHADCN_PRESETS.default's
    // routing, which IS the DEFAULT_INPUTS routing (DEFAULT_SHADCN_ROLE_BINDINGS).
    // So a fresh boot lights up "Default" on the binding tier instead of the
    // "Custom" sentinel — the false-custom-on-boot the rename was meant to remove.
    expect(findActiveBindingPreset(DEFAULT_INPUTS)).toBe('default')
  })

  it('returns null when a single role drifts off a preset', () => {
    const name = BINDING_PRESET_NAMES[0]!
    const base = SHADCN_BINDING_PRESETS[name].shadcnRoleBindings
    expect(
      findActiveBindingPreset({
        shadcnRoleBindings: {
          light: { ...base.light, '--ring': '--color-outline-variant' as MdTokenName },
          dark: { ...base.dark },
        },
      }),
    ).toBeNull()
  })

  it('stays on the binding preset when edge weight flips hard → soft', () => {
    // why: the edge roles (--border/--input/--sidebar-border) are a recognized
    // modifier, not identity — softening them must keep the picker lit on its
    // preset, mirroring findActivePreset. `clean` ships hard edges; soften all
    // three in both modes and it must still resolve to "clean".
    const base = SHADCN_BINDING_PRESETS.clean.shadcnRoleBindings
    const soft = {
      light: {
        ...base.light,
        '--border': '--color-outline-variant' as MdTokenName,
        '--input': '--color-outline-variant' as MdTokenName,
        '--sidebar-border': '--color-outline-variant' as MdTokenName,
      },
      dark: {
        ...base.dark,
        '--border': '--color-outline-variant' as MdTokenName,
        '--input': '--color-outline-variant' as MdTokenName,
        '--sidebar-border': '--color-outline-variant' as MdTokenName,
      },
    }
    expect(findActiveBindingPreset({ shadcnRoleBindings: soft })).toBe('clean')
  })

  it('requires BOTH modes to match — one preset light + another preset dark → null', () => {
    // why: a binding preset's identity spans both modes; mixing two presets'
    // halves matches neither. Guarded to the multi-preset case.
    if (BINDING_PRESET_NAMES.length < 2) return
    const [a, b] = BINDING_PRESET_NAMES
    expect(
      findActiveBindingPreset({
        shadcnRoleBindings: {
          light: SHADCN_BINDING_PRESETS[a!].shadcnRoleBindings.light,
          dark: SHADCN_BINDING_PRESETS[b!].shadcnRoleBindings.dark,
        },
      }),
    ).toBeNull()
  })
})
