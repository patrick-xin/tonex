import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS, MD_CORE_TOKEN_NAMES, MD_TOKEN_NAMES, type PortableTheme } from '../schema'
import { selectSeedHex } from '../seed'
import type { ContrastBundle } from './bundle'
import { buildColorsJson, exportColorsJson } from './colors-json'

// why: Red contract for the canonical `colors.json` artifact (ADR-0039 Decision
// 7) — tonex's OWN color record, the one the skill projects FROM, distinct from
// the foreign-projection sinks (design-md.ts, json.ts). Decision 7 makes it
// recipe-canonical and value-disposable, so it diverges from the foreign sinks on
// three axes by design:
//   1. header = the full recipe (seed + variant + contrast + surface + the file's
//      own encoding) so the values are reproducible from the header ALONE — the
//      Decision-7 consequence ("always reproducible from its recipe").
//   2. core roster by default, extended opt-in via `includeExtended` (the same
//      tier knob the paste-targets honor). The roster is a CAPACITY ladder, not a
//      taxonomy: core (28) is the sufficient baseline most projects need; extended
//      (22) is more roles when core doesn't cover the slots. An agent widens only
//      when it must, so the canonical default stays lean.
//   3. both modes co-emitted, mode-major { light, dark }, keyed by kebab role
//      (`--color-` stripped) so a design.md `colors:` projection is a pure key
//      pass-through.
// Same sink rules as siblings: ADR-0017 (reshape what deriveTheme returned, never
// recompute), ADR-0021 c.1 (argb → one encoding at the seam, selected by
// colorFormat).

const CORE_KEYS = MD_CORE_TOKEN_NAMES.map((n) => n.replace(/^--color-/, ''))
const FULL_KEYS = MD_TOKEN_NAMES.map((n) => n.replace(/^--color-/, ''))
const OKLCH = /^oklch\(/
const HEX = /^#[0-9a-f]{6}$/

describe('buildColorsJson — canonical recipe + both-mode role values', () => {
  const source = DEFAULT_INPUTS
  const bundle: ContrastBundle = { default: deriveTheme(source) }

  describe('header is the re-derivable recipe', () => {
    it('records seed (selectSeedHex), variant, and the file encoding', () => {
      const out = buildColorsJson(source, bundle, {})
      expect(out.seed).toBe(selectSeedHex(source))
      expect(out.variant).toBe(source.variant)
      expect(out.format).toBe('oklch') // default encoding
    })

    it('records the palette contrast level', () => {
      expect(buildColorsJson(source, bundle, {}).contrast).toBe(source.contrastLevel.light)
    })

    it('records the surface treatment (default: desaturate @ 0)', () => {
      expect(buildColorsJson(source, bundle, {}).surface).toEqual({ algo: 'desaturate', level: 0 })
    })

    it('reflects a tint recipe (active algo + its level)', () => {
      const tinted: PortableTheme = {
        ...DEFAULT_INPUTS,
        surfaceAlgo: 'tint',
        surfaceTintLevel: { light: 0.4, dark: 0.4 },
      }
      const out = buildColorsJson(tinted, { default: deriveTheme(tinted) }, {})
      expect(out.surface).toEqual({ algo: 'tint', level: 0.4 })
    })

    it('echoes the requested encoding in the header', () => {
      expect(buildColorsJson(source, bundle, { colorFormat: 'hex' }).format).toBe('hex')
    })
  })

  describe('values — core by default, extended opt-in, both modes, mode-major', () => {
    it('co-emits light and dark, each keyed by the core roster in order (the lean default)', () => {
      const out = buildColorsJson(source, bundle, {})
      expect(Object.keys(out.light)).toEqual(CORE_KEYS)
      expect(Object.keys(out.dark)).toEqual(CORE_KEYS)
    })

    it('omits extended roles by default — core is the sufficient baseline', () => {
      const { light } = buildColorsJson(source, bundle, {})
      expect(light).not.toHaveProperty('primary-fixed-dim')
      expect(light).not.toHaveProperty('inverse-surface')
      expect(light).not.toHaveProperty('shadow')
    })

    it('widens to the full roster (core + extended) when includeExtended is set', () => {
      const out = buildColorsJson(source, bundle, { includeExtended: true })
      expect(Object.keys(out.light)).toEqual(FULL_KEYS)
      expect(Object.keys(out.dark)).toEqual(FULL_KEYS)
      expect(out.light).toHaveProperty('primary-fixed-dim')
      expect(out.light).toHaveProperty('inverse-surface')
      expect(out.light).toHaveProperty('shadow')
    })

    it('co-derives modes that differ (light ≠ dark)', () => {
      const out = buildColorsJson(source, bundle, {})
      expect(out.light).not.toEqual(out.dark)
    })

    it('omits chart keys; with no custom colors the roster is exactly core', () => {
      const { light } = buildColorsJson(source, bundle, {})
      expect(light).not.toHaveProperty('chart-1')
      expect(Object.keys(light)).toEqual(CORE_KEYS)
    })
  })

  describe('encoding — single, selected by colorFormat', () => {
    it('defaults to oklch for every value, both modes', () => {
      const out = buildColorsJson(source, bundle, {})
      for (const v of [...Object.values(out.light), ...Object.values(out.dark)]) {
        expect(v).toMatch(OKLCH)
      }
    })

    it('emits lowercase six-digit hex when colorFormat is hex', () => {
      const out = buildColorsJson(source, bundle, { colorFormat: 'hex' })
      for (const v of [...Object.values(out.light), ...Object.values(out.dark)]) {
        expect(v).toMatch(HEX)
      }
    })
  })
})

// why: customs are carried like Material JSON's extendedColors — the DEFINITIONS
// (the `--custom` round-trip payload: name/hex/blend/shadcnSource) sit in a header
// block that re-derives the slugs, so the "header alone re-derives the values"
// contract (Decision 7) still holds. Unlike json.ts (which keeps derived custom
// tokens out of `schemes` to mirror MTB's exact shape), colors.json ALSO emits the
// derived custom roles inline in light/dark — it's the agent's bind-by-hand roster,
// so the actual contrast-correct values must be readable here like they are from
// --to shadcn / --to yaml. Customs are first-class (derive.ts: they merge into core,
// not extended), so they appear regardless of includeExtended.
describe('buildColorsJson — custom colors (definitions + derived roles)', () => {
  const withCustom: PortableTheme = {
    ...DEFAULT_INPUTS,
    customColors: [
      { id: 'success', name: 'success', hex: '#22c55e', blend: true, shadcnSource: 'color' },
    ],
  }
  const bundle: ContrastBundle = { default: deriveTheme(withCustom) }
  const CUSTOM_KEYS = ['success', 'on-success', 'success-container', 'on-success-container']

  it('defaults to an empty custom block when the source has no custom colors', () => {
    expect(
      buildColorsJson(DEFAULT_INPUTS, { default: deriveTheme(DEFAULT_INPUTS) }, {}).custom,
    ).toEqual([])
  })

  it('records each entry as a re-derivable definition (the --custom round-trip payload)', () => {
    expect(buildColorsJson(withCustom, bundle, {}).custom).toEqual([
      { name: 'success', hex: '#22c55e', blend: true, shadcnSource: 'color' },
    ])
  })

  it('carries the optional description when set', () => {
    const withDesc: PortableTheme = {
      ...DEFAULT_INPUTS,
      customColors: [
        {
          id: 'success',
          name: 'success',
          description: 'positive states',
          hex: '#22c55e',
          blend: true,
          shadcnSource: 'color',
        },
      ],
    }
    expect(buildColorsJson(withDesc, { default: deriveTheme(withDesc) }, {}).custom[0]).toEqual({
      name: 'success',
      hex: '#22c55e',
      blend: true,
      shadcnSource: 'color',
      description: 'positive states',
    })
  })

  it('appends the 4 derived custom roles after the core roster, both modes', () => {
    const out = buildColorsJson(withCustom, bundle, {})
    expect(Object.keys(out.light)).toEqual([...CORE_KEYS, ...CUSTOM_KEYS])
    expect(Object.keys(out.dark)).toEqual([...CORE_KEYS, ...CUSTOM_KEYS])
    for (const k of CUSTOM_KEYS) expect(out.light[k]).toMatch(OKLCH)
  })

  it('keeps custom roles first-class — present regardless of includeExtended', () => {
    const wide = buildColorsJson(withCustom, bundle, { includeExtended: true })
    expect(Object.keys(wide.light)).toEqual([...FULL_KEYS, ...CUSTOM_KEYS])
  })
})

describe('exportColorsJson — JSON serializer', () => {
  const source = DEFAULT_INPUTS
  const bundle: ContrastBundle = { default: deriveTheme(source) }

  it('serializes the build output as parseable JSON with a trailing newline', () => {
    const text = exportColorsJson(source, bundle, {})
    expect(text.endsWith('\n')).toBe(true)
    expect(JSON.parse(text)).toEqual(buildColorsJson(source, bundle, {}))
  })
})
