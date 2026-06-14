import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS, MD_TOKEN_NAMES, type PortableTheme } from '../schema'
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
//   2. complete roster by default — core + extended (MD_TOKEN_NAMES), not the
//      lean core-only the paste-targets default to: this is the source the skill
//      projects from, so a lossy canonical would force downstream re-derivation.
//   3. both modes co-emitted, mode-major { light, dark }, keyed by kebab role
//      (`--color-` stripped) so a design.md `colors:` projection is a pure key
//      pass-through.
// Same sink rules as siblings: ADR-0017 (reshape what deriveTheme returned, never
// recompute), ADR-0021 c.1 (argb → one encoding at the seam, selected by
// colorFormat).

const ROLE_KEYS = MD_TOKEN_NAMES.map((n) => n.replace(/^--color-/, ''))
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

  describe('values — complete roster, both modes, mode-major', () => {
    it('co-emits light and dark, each keyed by the full roster (core + extended) in order', () => {
      const out = buildColorsJson(source, bundle, {})
      expect(Object.keys(out.light)).toEqual(ROLE_KEYS)
      expect(Object.keys(out.dark)).toEqual(ROLE_KEYS)
    })

    it('carries extended roles, not just core — the canonical artifact is complete', () => {
      const { light } = buildColorsJson(source, bundle, {})
      expect(light).toHaveProperty('primary-fixed-dim')
      expect(light).toHaveProperty('inverse-surface')
      expect(light).toHaveProperty('shadow')
    })

    it('co-derives modes that differ (light ≠ dark)', () => {
      const out = buildColorsJson(source, bundle, {})
      expect(out.light).not.toEqual(out.dark)
    })

    it('omits chart keys and custom slugs — roster only, so every value re-derives from the header', () => {
      const { light } = buildColorsJson(source, bundle, {})
      expect(light).not.toHaveProperty('chart-1')
      expect(Object.keys(light)).toEqual(ROLE_KEYS)
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

describe('exportColorsJson — JSON serializer', () => {
  const source = DEFAULT_INPUTS
  const bundle: ContrastBundle = { default: deriveTheme(source) }

  it('serializes the build output as parseable JSON with a trailing newline', () => {
    const text = exportColorsJson(source, bundle, {})
    expect(text.endsWith('\n')).toBe(true)
    expect(JSON.parse(text)).toEqual(buildColorsJson(source, bundle, {}))
  })
})
