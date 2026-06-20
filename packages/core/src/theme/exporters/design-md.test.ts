import { describe, expect, it } from 'vitest'
import { MD_CHART_TOKEN_NAMES } from '../../chart/schema'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS, MD_CORE_TOKEN_NAMES, MD_TOKEN_NAMES, type PortableTheme } from '../schema'
import type { ContrastBundle } from './bundle'
import { buildDesignMdColors, exportDesignMd } from './design-md'

// why: Red contract for the DESIGN.md (@google/design.md) colors-block exporter.
// The feature emits ONE mode's color surface as a flat `colors:` YAML block the
// user pastes into their own DESIGN.md (commonly Stitch-authored), replacing its
// colors block. Sibling to json.ts under ADR-0017 (sink, no recompute) and
// ADR-0021 c.1 (argb → hex at the seam). Four deliberate differences from JSON:
// (1) hex-only — DESIGN.md's Color type is sRGB hex, so colorFormat is ignored;
// (2) single mode — the format has no light/dark axis, so the caller picks one;
// (3) flat kebab keys, `--color-` stripped, NO camelCase; (4) no separate
// extendedColors block — the user's custom colors ride inline as their slugs.

// why: the kebab key transform, pinned here independently so design-md.ts can't
// assert it against itself (mirrors json.test.ts's toSchemeKey).
function designKey(tokenName: string): string {
  return tokenName.replace(/^--color-/, '')
}

const CORE_KEYS = MD_CORE_TOKEN_NAMES.map(designKey)
const FULL_KEYS = MD_TOKEN_NAMES.map(designKey)
const CHART_KEYS = MD_CHART_TOKEN_NAMES.map(designKey)
const HEX = /^#[0-9a-f]{6}$/

describe('buildDesignMdColors — flat single-mode color surface', () => {
  const source = DEFAULT_INPUTS
  const bundle: ContrastBundle = { default: deriveTheme(source) }

  describe('lean default (core roster, one mode)', () => {
    it('keys the block with the core roster, --color- stripped, in MD_CORE_TOKEN_NAMES order', () => {
      expect(Object.keys(buildDesignMdColors(bundle, 'light', {}))).toEqual(CORE_KEYS)
    })

    it('omits extended tokens (fixed / dim / inverse / shadow) at lean default', () => {
      const light = buildDesignMdColors(bundle, 'light', {})
      expect(light).not.toHaveProperty('primary-fixed-dim')
      expect(light).not.toHaveProperty('primary-dim')
      expect(light).not.toHaveProperty('shadow')
      expect(light).not.toHaveProperty('surface-tint')
    })

    it('encodes every value as lowercase six-digit sRGB hex (DESIGN.md Color type)', () => {
      for (const value of Object.values(buildDesignMdColors(bundle, 'light', {}))) {
        expect(value).toMatch(HEX)
      }
    })

    it('ignores colorFormat — DESIGN.md is hex-only even when oklch is requested', () => {
      const colors = buildDesignMdColors(bundle, 'light', { colorFormat: 'oklch' })
      for (const value of Object.values(colors)) {
        expect(value).toMatch(HEX)
      }
    })
  })

  describe('mode is a single-axis choice (no co-emitted light/dark)', () => {
    it('emits the chosen mode only, and light ≠ dark', () => {
      const light = buildDesignMdColors(bundle, 'light', {})
      const dark = buildDesignMdColors(bundle, 'dark', {})
      expect(Object.keys(dark)).toEqual(CORE_KEYS)
      expect(light).not.toEqual(dark)
    })
  })

  describe('includeExtended', () => {
    it('widens the block to the full roster (core + extended) in MD_TOKEN_NAMES order', () => {
      const keys = Object.keys(buildDesignMdColors(bundle, 'light', { includeExtended: true }))
      expect(keys).toEqual(FULL_KEYS)
    })

    it('includes the extended role tokens', () => {
      const light = buildDesignMdColors(bundle, 'light', { includeExtended: true })
      expect(light).toHaveProperty('primary-fixed-dim')
      expect(light).toHaveProperty('shadow')
      expect(light).toHaveProperty('inverse-surface')
    })
  })

  describe('includeChart', () => {
    it('appends chart-1..chart-5 after the roster when on', () => {
      const light = buildDesignMdColors(bundle, 'light', { includeChart: true })
      expect(Object.keys(light)).toEqual([...CORE_KEYS, ...CHART_KEYS])
    })

    it('omits chart keys when off (default)', () => {
      const light = buildDesignMdColors(bundle, 'light', {})
      for (const key of CHART_KEYS) expect(light).not.toHaveProperty(key)
    })
  })

  describe('custom colors ride inline as their slugs', () => {
    const sourceWithCustom: PortableTheme = {
      ...DEFAULT_INPUTS,
      customColors: [
        { id: 'c1', name: 'Brand Teal', hex: '#0a7e8c', blend: true, shadcnSource: 'color' },
      ],
    }
    const customBundle: ContrastBundle = { default: deriveTheme(sourceWithCustom) }

    it('emits each custom-color token as a flat kebab key, after the MD roster', () => {
      const light = buildDesignMdColors(customBundle, 'light', {})
      expect(light).toHaveProperty('brand-teal')
      expect(light).toHaveProperty('on-brand-teal')
      expect(light).toHaveProperty('brand-teal-container')
      expect(light).toHaveProperty('on-brand-teal-container')
      // why: custom slugs trail the canonical roster, not interleave with it
      expect(Object.keys(light).slice(0, CORE_KEYS.length)).toEqual(CORE_KEYS)
    })

    it('encodes custom-color values as hex too', () => {
      const light = buildDesignMdColors(customBundle, 'light', {})
      expect(light['brand-teal']).toMatch(HEX)
    })
  })
})

describe('exportDesignMd — YAML colors-block serializer', () => {
  const source = DEFAULT_INPUTS
  const bundle: ContrastBundle = { default: deriveTheme(source) }

  it('emits a bare `colors:` block with two-space indent and quoted hex', () => {
    const out = exportDesignMd(bundle, 'light', {})
    expect(out.startsWith('colors:\n')).toBe(true)
    // why: hex MUST be quoted — a bare `#rrggbb` is a YAML comment
    expect(out).toMatch(/\n {2}surface: "#[0-9a-f]{6}"/)
    expect(out.endsWith('\n')).toBe(true)
  })

  it('serializes exactly the build output, in order', () => {
    const colors = buildDesignMdColors(bundle, 'light', {})
    const expected = `colors:\n${Object.entries(colors)
      .map(([k, v]) => `  ${k}: "${v}"`)
      .join('\n')}\n`
    expect(exportDesignMd(bundle, 'light', {})).toBe(expected)
  })
})

// why: the recipe rides in the delivered DESIGN.md as a leading YAML `#` comment
// above the colors: block — valid YAML, travels with the paste (ADR-0039
// Decision 7). Absent the option the block is unchanged (the exact-output test
// above still holds).
describe('exportDesignMd — provenance recipe', () => {
  const bundle: ContrastBundle = { default: deriveTheme(DEFAULT_INPUTS) }
  const recipe = "tonex generate --seed '#3b82f6' --variant cmf --to yaml --mode light"

  it('prepends the recipe as a YAML # comment above colors:', () => {
    const out = exportDesignMd(bundle, 'light', { provenance: recipe })
    expect(out.startsWith(`# ${recipe}\ncolors:`)).toBe(true)
  })
})

describe('buildDesignMdColors with includeBrand', () => {
  // why: brand parity (ADR-0032). The flat colors map gains brand/brand-foreground
  // (kebab, --color- stripped) when the brand switch is on, riding inline like a
  // custom slug. Off by default (drift-guard). The pair is the literal seed plus
  // its AA-safe on-color, mode-invariant — design.md is single-mode + hex.
  const bundle: ContrastBundle = { default: deriveTheme(DEFAULT_INPUTS) }

  it('omits brand keys by default', () => {
    const out = buildDesignMdColors(bundle, 'light', {})
    expect(out).not.toHaveProperty('brand')
    expect(out).not.toHaveProperty('brand-foreground')
  })

  it('emits brand + brand-foreground as hex when includeBrand', () => {
    const out = buildDesignMdColors(bundle, 'light', { includeBrand: true })
    expect(out.brand).toMatch(HEX)
    expect(out['brand-foreground']).toMatch(HEX)
  })

  it('keeps a custom color named "brand" (custom wins; the foreground still rides)', () => {
    const withCustomBrand: PortableTheme = {
      ...DEFAULT_INPUTS,
      customColors: [
        { id: 'c1', name: 'Brand', hex: '#0a7e8c', blend: false, shadcnSource: 'color' },
      ],
    }
    const customBundle: ContrastBundle = { default: deriveTheme(withCustomBrand) }
    const withToggle = buildDesignMdColors(customBundle, 'light', { includeBrand: true })
    const withoutToggle = buildDesignMdColors(customBundle, 'light', {})
    expect(withToggle.brand).toBe(withoutToggle.brand)
    expect(withToggle['brand-foreground']).toMatch(HEX)
  })
})
