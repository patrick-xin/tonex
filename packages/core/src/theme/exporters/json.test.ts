import { describe, expect, it } from 'vitest'
import { MD_CHART_TOKEN_NAMES } from '../../chart/schema'
import { deriveTheme } from '../derive'
import { MODES } from '../mode'
import {
  DEFAULT_INPUTS,
  MD_CORE_TOKEN_NAMES,
  MD_PALETTE_FAMILY_NAMES,
  MD_PALETTE_TONE_NAMES,
  MD_TOKEN_NAMES,
} from '../schema'
import type { ContrastBundle, ExportOptions } from './bundle'
import { buildMaterialThemeJson, exportJson } from './json'

// why: planner-authored Red contract for slice json-1 (#85). Per
// working-style.md "the planner writes the contract; the implementer makes it
// pass" — this file states exactly what passing means; json.ts is the stub
// until an implementer makes these green.
//
// why no sample load: ADR-0029 says faithfulness is "judged against the
// target's schema, not a captured file" — a reference export is a shape
// oracle, not a value oracle. Our roster deliberately diverges from Material
// Theme Builder's (`exporters/__fixtures__/material-theme-builder.json`): we ship six
// palettes incl. `error` (MTB ships five), our per-family `*-dim` + fixed +
// inverse tokens, and we drop MTB's deprecated `background`/`onBackground`/
// `surfaceVariant`. Diffing against the file would demand subset gymnastics
// that hide the contract; instead we assert structure via the schema
// constants that ARE our roster. The sample remains the human reference.
//
// why no color-value assertions: same rule — our seed default, variant, and
// MCU revision differ from any sample, so colors will not match. We assert
// the value *encoding* (uppercase hex / oklch), never a specific color.

// why: the contract definition of MTB's kebab-CSS-var → camelCase scheme-key
// projection. `--color-on-primary-fixed-variant` → `onPrimaryFixedVariant`.
// The production helper in json.ts must reproduce this exactly; keeping the
// spec here makes the transform assertable rather than asserted-against-itself.
function toSchemeKey(tokenName: string): string {
  const body = tokenName.replace(/^--color-/, '')
  const [head, ...rest] = body.split('-')
  return head + rest.map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1)).join('')
}

const CORE_SCHEME_KEYS = MD_CORE_TOKEN_NAMES.map(toSchemeKey)
const FULL_SCHEME_KEYS = MD_TOKEN_NAMES.map(toSchemeKey)
const CHART_SCHEME_KEYS = MD_CHART_TOKEN_NAMES.map(toSchemeKey)
const PALETTE_FAMILY_KEYS = [...MD_PALETTE_FAMILY_NAMES]
const TONE_KEYS = MD_PALETTE_TONE_NAMES.map(String)

describe('buildMaterialThemeJson — MTB shape, our tokens (ADR-0029)', () => {
  const source = DEFAULT_INPUTS
  const leanBundle: ContrastBundle = { default: deriveTheme(source) }

  describe('lean defaults (light + dark, core tokens, oklch, no palettes)', () => {
    const result = buildMaterialThemeJson(source, leanBundle, {})

    it('mirrors MTB top-level keys and omits palettes when the toggle is off', () => {
      expect(Object.keys(result)).toEqual([
        'description',
        'seed',
        'coreColors',
        'extendedColors',
        'schemes',
      ])
    })

    it('emits only light + dark schemes', () => {
      expect(Object.keys(result.schemes)).toEqual([...MODES])
    })

    it('keys each scheme with our core roster, camelCased, in MD_TOKEN_NAMES order', () => {
      expect(Object.keys(result.schemes.light)).toEqual(CORE_SCHEME_KEYS)
      expect(Object.keys(result.schemes.dark)).toEqual(CORE_SCHEME_KEYS)
    })

    it('omits extended tokens (fixed / dim / inverse / tint) at lean default', () => {
      expect(result.schemes.light).not.toHaveProperty('surfaceTint')
      expect(result.schemes.light).not.toHaveProperty('primaryFixedDim')
      expect(result.schemes.light).not.toHaveProperty('primaryDim')
      expect(result.schemes.light).not.toHaveProperty('shadow')
    })

    it('encodes scheme values as oklch strings by default', () => {
      for (const value of Object.values(result.schemes.light)) {
        expect(value).toMatch(/^oklch\(/)
      }
    })

    it('reports seed + coreColors.primary as the source seed in uppercase hex', () => {
      // why: DEFAULT_INPUTS.seed.exactHex is '#6750a4'; the formatter uppercases
      // to MTB convention. coreColors mirrors seed (single key).
      expect(result.seed).toBe('#6750A4')
      expect(result.coreColors).toEqual({ primary: '#6750A4' })
    })

    it('emits an empty extendedColors (custom-color mapping deferred)', () => {
      expect(result.extendedColors).toEqual([])
    })

    it('stamps a tonex provenance description', () => {
      expect(result.description).toMatch(
        /^TYPE: CUSTOM\nTonex export \d{4}-\d{2}-\d{2} · seed #[0-9A-F]{6} · variant .+$/,
      )
      expect(result.description).toContain(`seed ${result.seed}`)
      expect(result.description).toContain(`variant ${DEFAULT_INPUTS.variant}`)
    })
  })

  describe('colorFormat option', () => {
    it('hex: every scheme value is uppercase six-digit hex (MTB convention)', () => {
      const result = buildMaterialThemeJson(source, leanBundle, { colorFormat: 'hex' })
      for (const value of Object.values(result.schemes.light)) {
        expect(value).toMatch(/^#[0-9A-F]{6}$/)
      }
    })

    it('keeps seed + coreColors as hex even under oklch (the seed is an input color)', () => {
      const result = buildMaterialThemeJson(source, leanBundle, { colorFormat: 'oklch' })
      expect(result.seed).toMatch(/^#[0-9A-F]{6}$/)
      expect(result.coreColors.primary).toMatch(/^#[0-9A-F]{6}$/)
    })
  })

  describe('includeExtended option', () => {
    const result = buildMaterialThemeJson(source, leanBundle, { includeExtended: true })

    it('widens each scheme to the full roster (core + extended) in MD_TOKEN_NAMES order', () => {
      expect(Object.keys(result.schemes.light)).toEqual(FULL_SCHEME_KEYS)
    })

    it('includes our extended tokens MTB does not derive', () => {
      expect(result.schemes.light).toHaveProperty('primaryFixedDim')
      expect(result.schemes.light).toHaveProperty('primaryDim')
      expect(result.schemes.light).toHaveProperty('surfaceTint')
      expect(result.schemes.light).toHaveProperty('shadow')
    })
  })

  describe('includeChart option', () => {
    // why: chart is a tonex-specific derived family (ADR-0027) with no MTB slot,
    // but ADR-0029's rule is that a wider roster lands in its natural slot — the
    // same rule that emits `error` and the extended tokens MTB lacks. Chart
    // tokens are per-mode colors, so their natural home is inside each scheme,
    // merged like includeExtended. Off by default (issue #89).
    it('appends chart1..chart5 to each scheme when on, after the core roster', () => {
      const result = buildMaterialThemeJson(source, leanBundle, { includeChart: true })
      expect(Object.keys(result.schemes.light)).toEqual([...CORE_SCHEME_KEYS, ...CHART_SCHEME_KEYS])
      expect(Object.keys(result.schemes.dark)).toEqual([...CORE_SCHEME_KEYS, ...CHART_SCHEME_KEYS])
    })

    it('composes with includeExtended — chart trails the full roster', () => {
      const result = buildMaterialThemeJson(source, leanBundle, {
        includeExtended: true,
        includeChart: true,
      })
      expect(Object.keys(result.schemes.light)).toEqual([...FULL_SCHEME_KEYS, ...CHART_SCHEME_KEYS])
    })

    it('omits chart keys entirely when off (default)', () => {
      const result = buildMaterialThemeJson(source, leanBundle, {})
      for (const key of CHART_SCHEME_KEYS) {
        expect(result.schemes.light).not.toHaveProperty(key)
        expect(result.schemes.dark).not.toHaveProperty(key)
      }
    })

    it('encodes chart values per colorFormat (uppercase hex here)', () => {
      const result = buildMaterialThemeJson(source, leanBundle, {
        includeChart: true,
        colorFormat: 'hex',
      })
      for (const key of CHART_SCHEME_KEYS) {
        expect(result.schemes.light[key]).toMatch(/^#[0-9A-F]{6}$/)
      }
    })
  })

  describe('includePalette option', () => {
    const result = buildMaterialThemeJson(source, leanBundle, { includePalette: true })

    it('adds palettes as the trailing top-level key', () => {
      expect(Object.keys(result)).toEqual([
        'description',
        'seed',
        'coreColors',
        'extendedColors',
        'schemes',
        'palettes',
      ])
    })

    it('emits six families incl. error (MTB ships five) in canonical order', () => {
      expect(Object.keys(result.palettes ?? {})).toEqual(PALETTE_FAMILY_KEYS)
    })

    it('keys every family by the 18 tones as strings', () => {
      for (const family of MD_PALETTE_FAMILY_NAMES) {
        expect(Object.keys(result.palettes?.[family] ?? {})).toEqual(TONE_KEYS)
      }
    })

    it('encodes palette values per colorFormat (uppercase hex here)', () => {
      const hexResult = buildMaterialThemeJson(source, leanBundle, {
        includePalette: true,
        colorFormat: 'hex',
      })
      expect(hexResult.palettes?.primary?.['0']).toMatch(/^#[0-9A-F]{6}$/)
    })
  })

  describe('contrast tiers come from the bundle', () => {
    const contrastBundle: ContrastBundle = {
      default: deriveTheme(source),
      medium: deriveTheme({ ...source, contrastLevel: { light: 0.5, dark: 0.5 } }),
      high: deriveTheme({ ...source, contrastLevel: { light: 1, dark: 1 } }),
    }
    const result = buildMaterialThemeJson(source, contrastBundle, {})

    it('emits six tier-keyed schemes, all light tiers then all dark tiers (MTB order)', () => {
      expect(Object.keys(result.schemes)).toEqual([
        'light',
        'light-medium-contrast',
        'light-high-contrast',
        'dark',
        'dark-medium-contrast',
        'dark-high-contrast',
      ])
    })

    it('keys every tier with the core roster camelCased', () => {
      expect(Object.keys(result.schemes['light-medium-contrast'])).toEqual(CORE_SCHEME_KEYS)
      expect(Object.keys(result.schemes['dark-high-contrast'])).toEqual(CORE_SCHEME_KEYS)
    })
  })
})

describe('exportJson — serialization wrapper', () => {
  const source = DEFAULT_INPUTS
  const bundle: ContrastBundle = { default: deriveTheme(source) }

  it('pretty-prints with four-space indent and a trailing newline', () => {
    const str = exportJson(source, bundle, {})
    expect(str.startsWith('{\n    "description"')).toBe(true)
    expect(str.endsWith('}\n')).toBe(true)
  })

  it('round-trips to the builder object', () => {
    const options: ExportOptions = { includePalette: true }
    const str = exportJson(source, bundle, options)
    expect(JSON.parse(str)).toEqual(buildMaterialThemeJson(source, bundle, options))
  })
})
