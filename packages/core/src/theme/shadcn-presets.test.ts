import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS, type PortableTheme } from './schema'
import { findActivePreset, SHADCN_PRESETS, type ShadcnPreset } from './shadcn-presets'

// why: durable shipping set finalized during issue #36 curation. Member set
// (not iteration order) is what R1 asserts; sorting on both sides keeps the
// test resilient to key-order reshuffles.
const PRESET_NAMES = ['default', 'stark', 'soft', 'warm', 'playful', 'monotone', 'tech'] as const
type PresetName = (typeof PRESET_NAMES)[number]

// why: typed lookup helper. SHADCN_PRESETS keys are narrowed by `satisfies` so
// arbitrary-string access wouldn't typecheck; this cast lets the tests query by
// the canonical PRESET_NAMES list and catch missing entries explicitly instead
// of getting a TS compile error.
const presets = SHADCN_PRESETS as Record<string, ShadcnPreset | undefined>

// why: presets define a 6-field structural recipe; this projection plucks
// exactly those fields from a full PortableTheme so findActivePreset compares
// state against library entries by deep equality. Mirrors what the production
// findActivePreset does internally — keeping the helper in test code lets R5
// pin the relationship without coupling to internal implementation.
function projectPreset(theme: PortableTheme): ShadcnPreset {
  return {
    variant: theme.variant,
    surfaceAlgo: theme.surfaceAlgo,
    surfacePaletteName: theme.surfacePaletteName,
    surfaceTintLevel: theme.surfaceTintLevel,
    surfaceDesaturateLevel: theme.surfaceDesaturateLevel,
    shadcnRoleBindings: theme.shadcnRoleBindings,
  }
}

function themeWithPreset(name: PresetName): PortableTheme {
  const preset = presets[name]
  if (!preset) {
    throw new Error(`Preset "${name}" not found in SHADCN_PRESETS`)
  }
  return { ...DEFAULT_INPUTS, ...preset }
}

describe('R1: SHADCN_PRESETS shape', () => {
  it('exports exactly the 7 finalized preset names', () => {
    expect([...Object.keys(SHADCN_PRESETS)].sort()).toEqual([...PRESET_NAMES].sort())
  })

  it.each(PRESET_NAMES)('preset "%s" has every ShadcnPreset field', (name) => {
    const p = presets[name]
    expect(p, `preset "${name}" missing`).toBeDefined()
    expect(typeof p!.variant).toBe('string')
    expect(typeof p!.surfaceAlgo).toBe('string')
    expect(typeof p!.surfacePaletteName).toBe('string')
    expect(typeof p!.surfaceTintLevel.light).toBe('number')
    expect(typeof p!.surfaceTintLevel.dark).toBe('number')
    expect(typeof p!.surfaceDesaturateLevel.light).toBe('number')
    expect(typeof p!.surfaceDesaturateLevel.dark).toBe('number')
    expect(p!.shadcnRoleBindings.light).toBeTypeOf('object')
    expect(p!.shadcnRoleBindings.dark).toBeTypeOf('object')
  })
})

describe('R2: findActivePreset round-trip', () => {
  it.each(PRESET_NAMES)('detects "%s" when state matches its preset', (name) => {
    const theme = themeWithPreset(name)
    expect(findActivePreset(theme)).toBe(name)
  })
})

describe('R3: ADR-0026 — presets contain no override fields', () => {
  it.each(PRESET_NAMES)('preset "%s" has no override-shaped properties', (name) => {
    const p = presets[name] as Record<string, unknown> | undefined
    expect(p, `preset "${name}" missing`).toBeDefined()
    expect(p).not.toHaveProperty('shadcnRoleOverrides')
    expect(p).not.toHaveProperty('md3TokenOverrides')
    expect(p).not.toHaveProperty('shadcnChartOverrides')
    expect(p).not.toHaveProperty('paletteOverrides')
    expect(p).not.toHaveProperty('advisoryOverrides')
  })
})

describe('R4: findActivePreset negative cases', () => {
  it('returns null when a single binding is mutated', () => {
    const theme = themeWithPreset('default')
    const mutated: PortableTheme = {
      ...theme,
      shadcnRoleBindings: {
        ...theme.shadcnRoleBindings,
        light: { ...theme.shadcnRoleBindings.light, '--ring': '--color-outline-variant' },
      },
    }
    expect(findActivePreset(mutated)).toBeNull()
  })

  it('returns null when variant differs', () => {
    const theme = themeWithPreset('default')
    expect(findActivePreset({ ...theme, variant: 'monochrome' })).toBeNull()
  })

  it('returns null when surfaceTintLevel differs', () => {
    const theme = themeWithPreset('default')
    expect(findActivePreset({ ...theme, surfaceTintLevel: { light: 0.5, dark: 0.5 } })).toBeNull()
  })

  it('returns null when surfaceDesaturateLevel differs', () => {
    const theme = themeWithPreset('default')
    expect(
      findActivePreset({ ...theme, surfaceDesaturateLevel: { light: 0.9, dark: 0.9 } }),
    ).toBeNull()
  })
})

describe('R5: Default preset == DEFAULT_INPUTS projection', () => {
  it('projecting DEFAULT_INPUTS yields the default preset', () => {
    const defaultPreset = presets['default']
    expect(defaultPreset, '"default" preset missing').toBeDefined()
    expect(projectPreset(DEFAULT_INPUTS)).toEqual(defaultPreset)
  })

  it('findActivePreset(DEFAULT_INPUTS) === "default"', () => {
    expect(findActivePreset(DEFAULT_INPUTS)).toBe('default')
  })
})
