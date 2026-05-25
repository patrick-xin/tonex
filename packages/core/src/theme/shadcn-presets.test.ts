import { describe, expect, it } from 'vitest'
import { hctFromHex } from './hct'
import { DEFAULT_INPUTS, type PortableTheme } from './schema'
import { findActivePreset, SHADCN_PRESETS, type ShadcnPreset } from './shadcn-presets'

// why: the live preset set during the exploration pass — `default` plus three
// tuner imports (grove/lagoon/breeze) and five designed presets
// (noir/paper/enterprise/sunset/sage). The six original issue-#36 presets are
// commented out in shadcn-presets.ts; restore a name here if its block is
// uncommented. Member set (not iteration order) is what R1 asserts; sorting on
// both sides keeps the test resilient to key-order reshuffles.
const PRESET_NAMES = [
  'default',
  'grove',
  'lagoon',
  'breeze',
  'noir',
  'paper',
  'enterprise',
  'sunset',
  'sage',
] as const
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
// pin the relationship without coupling to internal implementation. `description`
// is library-only metadata (audience + character), not derivable from theme
// state, so the projection type omits it.
function projectPreset(theme: PortableTheme): Omit<ShadcnPreset, 'description'> {
  return {
    variant: theme.variant,
    surfaceAlgo: theme.surfaceAlgo,
    surfacePaletteName: theme.surfacePaletteName,
    surfaceTintLevel: theme.surfaceTintLevel,
    surfaceTintTextLevel: theme.surfaceTintTextLevel,
    surfaceDesaturateLevel: theme.surfaceDesaturateLevel,
    shadcnRoleBindings: theme.shadcnRoleBindings,
    seed: theme.seed,
    // why: preset.contrastLevel is now per-mode, mirroring the theme's, so the
    // projection carries the pair through verbatim — the default boot theme's
    // { light: 0, dark: 0 } matches the default preset's pair.
    contrastLevel: theme.contrastLevel,
  }
}

function themeWithPreset(name: PresetName): PortableTheme {
  const preset = presets[name]
  if (!preset) {
    throw new Error(`Preset "${name}" not found in SHADCN_PRESETS`)
  }
  // why: the preset's per-mode contrast maps straight onto the theme's per-mode
  // shape — adopting a preset applies each mode's curated value as-is.
  const { contrastLevel, ...recipe } = preset
  return {
    ...DEFAULT_INPUTS,
    ...recipe,
    contrastLevel: { ...contrastLevel },
  }
}

describe('R1: SHADCN_PRESETS shape', () => {
  it('exports exactly the live preset names', () => {
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

  it('returns null when surfaceTintTextLevel differs', () => {
    const theme = themeWithPreset('default')
    expect(
      findActivePreset({ ...theme, surfaceTintTextLevel: { light: 0.5, dark: 0.5 } }),
    ).toBeNull()
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
    // why: strip the library-only `description` — the projection covers recipe +
    // source inputs, the only fields a PortableTheme can carry.
    const { description: _description, ...recipe } = defaultPreset!
    expect(projectPreset(DEFAULT_INPUTS)).toEqual(recipe)
  })

  it('findActivePreset(DEFAULT_INPUTS) === "default"', () => {
    expect(findActivePreset(DEFAULT_INPUTS)).toBe('default')
  })
})

// why: ADR-0031 #5 — curated source inputs apply but never define identity. A
// user who adopted a preset's recipe and kept their own color (or contrast) is
// still meaningfully "on" that preset. Detection must read the recipe only and
// ignore seed and contrastLevel; pinning it here keeps a future curated-source
// slice from accidentally folding source inputs into the match.
// why: ADR-0031 #2 — a theme preset carries the curated source inputs it was
// tuned against. Issue #109 adds the seed; every shipping preset must declare
// one so the resolver always has a curated value to supersede an untouched
// seed with. Final curation is the promotion slice; this only pins presence
// and shape.
describe('R7: every preset carries a curated seed', () => {
  it.each(PRESET_NAMES)('preset "%s" declares a well-formed seed', (name) => {
    const seed = presets[name]?.seed
    expect(seed, `preset "${name}" missing seed`).toBeDefined()
    expect(typeof seed!.hue).toBe('number')
    expect(typeof seed!.chroma).toBe('number')
    expect(typeof seed!.tone).toBe('number')
  })
})

// why: ADR-0031 #2 — contrast joins the seed as a curated source input (issue
// #110). Every shipping preset declares an in-range contrastLevel so the
// resolver always has a value to supersede an untouched contrast with. Final
// curation is the promotion slice; this pins presence and the [0, 1] range.
describe('R8: every preset carries a curated contrastLevel', () => {
  it.each(PRESET_NAMES)('preset "%s" declares an in-range per-mode contrastLevel', (name) => {
    const contrastLevel = presets[name]?.contrastLevel
    expect(contrastLevel, `preset "${name}" missing contrastLevel`).toBeDefined()
    for (const mode of ['light', 'dark'] as const) {
      expect(contrastLevel?.[mode], `preset "${name}" missing ${mode} contrast`).toBeDefined()
      expect(contrastLevel?.[mode]).toBeGreaterThanOrEqual(0)
      expect(contrastLevel?.[mode]).toBeLessThanOrEqual(1)
    }
  })
})

// why: the name is identity only; audience + character live in `description`
// (mirrors ShadcnBindingPreset.description) so the picker can show a caption and
// names stay pure mnemonics rather than smuggling audience words like
// "enterprise". Every live preset must carry a non-empty line — an empty one
// would render a blank caption in the preview popover. Final wording is the
// #112 curation pass; this pins presence and non-emptiness.
describe('R9: every preset carries a non-empty description', () => {
  it.each(PRESET_NAMES)('preset "%s" declares a description', (name) => {
    const description = presets[name]?.description
    expect(description, `preset "${name}" missing description`).toBeDefined()
    expect(typeof description).toBe('string')
    expect(description!.trim().length).toBeGreaterThan(0)
  })
})

describe('R6: findActivePreset ignores source inputs (seed, contrast)', () => {
  it.each(
    PRESET_NAMES,
  )('detects "%s" even when seed and contrast differ from the boot default', (name) => {
    const theme = themeWithPreset(name)
    const withForeignSource: PortableTheme = {
      ...theme,
      seed: { ...hctFromHex('#ff00aa'), exactHex: '#ff00aa' },
      contrastLevel: { light: 0.5, dark: 0.5 },
    }
    expect(findActivePreset(withForeignSource)).toBe(name)
  })
})
