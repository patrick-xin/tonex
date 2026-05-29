import { describe, expect, it } from 'vitest'
import { deriveTheme, type TokenMap } from '../derive'
import type { Mode } from '../mode'
import { oklchString } from '../oklch'
import { DEFAULT_INPUTS, type PortableTheme } from '../schema'
import { exportCss } from './css'

// why: parses `selector { --tok: val; ... }` blocks back into a string-valued
// map so the contract test compares structure against deriveTheme's output
// without snapshotting the full value catalog. Snapshots would re-encode
// every md/shadcn value into the test and break on every legitimate engine
// change. ADR-0021: the layer holds argb; project to oklch via projectLayer
// before comparing against parsed CSS strings.
function parseBlock(css: string, selector: string): Record<string, string> {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css)
  if (!match) throw new Error(`[parseBlock] selector not found: ${selector}\n--- css:\n${css}`)
  const out: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const m = /^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/.exec(line)
    if (m) out[m[1]] = m[2].trim()
  }
  return out
}

function projectLayer(layer: TokenMap): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, argb] of Object.entries(layer)) {
    out[name] = oklchString(argb)
  }
  return out
}

function projectMergedMd(
  theme: ReturnType<typeof deriveTheme>,
  mode: Mode,
): Record<string, string> {
  // why: helper for tests that pass `includeExtended: true` explicitly.
  // Slice 4 default is lean (core only); the bake / drift-guard preserves
  // the today-shape via formatCss, not exportCss.
  const core = mode === 'light' ? theme.md.light : theme.md.dark
  const extended = mode === 'light' ? theme.md.lightExtended : theme.md.darkExtended
  return projectLayer({ ...core, ...extended })
}

const withCustomColor: PortableTheme = {
  ...DEFAULT_INPUTS,
  customColors: [
    {
      id: 'brand-1',
      name: 'Brand',
      hex: '#ff0000',
      blend: false,
      shadcnSource: 'color',
    },
  ],
}

describe('exportCss(bundle, "md") — lean defaults', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportCss({ default: theme }, 'md')

  it('emits the standard Tailwind v4 boilerplate header', () => {
    // why: md users get a paste-ready globals.css. The header lines are the
    // exact incantation Tailwind v4 + class-based dark mode requires; without
    // them, dark: utilities flip with prefers-color-scheme rather than the
    // .dark toggle.
    expect(out).toContain('@import "tailwindcss";')
    expect(out).toContain('@custom-variant dark (&:is(.dark *));')
  })

  it('@theme inline registers exactly the 28 core md tokens (no extended, no chart, no palette)', () => {
    // why: ADR-0021 commitment 6 — defaults reflect lean output. Extended,
    // chart, and palette are all opt-in via flags; @theme inline matches the
    // rule-block emission so user paste stays consistent.
    expect(out).toMatch(/@theme inline\s*\{/)
    for (const tok of Object.keys(theme.md.light)) {
      expect(out).toContain(`${tok}: var(${tok});`)
    }
    // extended, chart, and palette names absent
    for (const tok of Object.keys(theme.md.lightExtended)) {
      expect(out).not.toContain(`${tok}: var(${tok});`)
    }
    for (const tok of Object.keys(theme.md.lightChart)) {
      expect(out).not.toContain(`${tok}: var(${tok});`)
    }
    for (const tok of Object.keys(theme.md.palette)) {
      expect(out).not.toContain(`${tok}: var(${tok});`)
    }
  })

  it(':root block values match theme.md.light token-for-token (core only)', () => {
    // why: paste-ready globals.css — emission lands on `:root` (light) and
    // `.dark` (dark), the standard Tailwind-v4 + shadcn pattern. Users drop
    // the file into their project and tokens resolve at the html root without
    // adding a scope class. Contrast tiers layer on the same axis via
    // `.contrast-medium` / `.dark.contrast-medium` (see multi-contrast tests).
    const md = parseBlock(out, ':root')
    expect(md).toEqual(projectLayer(theme.md.light))
  })

  it('.dark block values match theme.md.dark token-for-token (core only)', () => {
    const dark = parseBlock(out, '.dark')
    expect(dark).toEqual(projectLayer(theme.md.dark))
  })
})

describe('exportCss with includeExtended: true', () => {
  // why: opt-in tier — emits today's 50 md tokens (core + extended) per rule
  // block. Used by formatCss / bake to preserve byte-equality with globals.css.
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportCss({ default: theme }, 'md', { includeExtended: true })

  it(':root block carries core + extended merged token-for-token', () => {
    const md = parseBlock(out, ':root')
    expect(md).toEqual(projectMergedMd(theme, 'light'))
  })

  it('.dark block carries core + extended merged for dark mode', () => {
    const dark = parseBlock(out, '.dark')
    expect(dark).toEqual(projectMergedMd(theme, 'dark'))
  })

  it('@theme inline lists every core + extended token name', () => {
    for (const tok of [...Object.keys(theme.md.light), ...Object.keys(theme.md.lightExtended)]) {
      expect(out).toContain(`${tok}: var(${tok});`)
    }
  })
})

describe('exportCss(bundle, "shadcn")', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportCss({ default: theme }, 'shadcn')

  it('omits Tailwind boilerplate by default (shadcn users already have it)', () => {
    expect(out).not.toContain('@import "tailwindcss"')
    expect(out).not.toContain('@custom-variant dark')
  })

  it(':root block values match theme.shadcn.light token-for-token', () => {
    const root = parseBlock(out, ':root')
    expect(root).toEqual(projectLayer(theme.shadcn.light))
  })

  it('.dark block values match theme.shadcn.dark token-for-token', () => {
    const dark = parseBlock(out, '.dark')
    expect(dark).toEqual(projectLayer(theme.shadcn.dark))
  })

  it('omits @theme inline when customColors is empty', () => {
    expect(out).not.toMatch(/@theme inline/)
  })
})

describe('exportCss(bundle, "shadcn") with includeHeader: true', () => {
  // why: opt-in bootstrap for green-field shadcn projects. Prepends the
  // Tailwind v4 incantation (import + @custom-variant dark) so a fresh
  // globals.css works out of the box; existing shadcn projects keep the
  // toggle off and paste only :root/.dark.
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportCss({ default: theme }, 'shadcn', { includeHeader: true })

  it('prepends @import "tailwindcss" and @custom-variant dark', () => {
    expect(out).toContain('@import "tailwindcss";')
    expect(out).toContain('@custom-variant dark (&:is(.dark *));')
  })

  it(':root + .dark blocks still emit (header is additive)', () => {
    expect(parseBlock(out, ':root')).toEqual(projectLayer(theme.shadcn.light))
    expect(parseBlock(out, '.dark')).toEqual(projectLayer(theme.shadcn.dark))
  })
})

describe('exportCss(bundle, "shadcn") with customColors', () => {
  const theme = deriveTheme(withCustomColor)
  const out = exportCss({ default: theme }, 'shadcn')

  it('includes the custom slug values in :root and .dark', () => {
    const root = parseBlock(out, ':root')
    const dark = parseBlock(out, '.dark')
    expect(root['--brand']).toBeDefined()
    expect(root['--brand-foreground']).toBeDefined()
    expect(dark['--brand']).toBeDefined()
    expect(dark['--brand-foreground']).toBeDefined()
  })

  it('emits @theme inline registering each custom slug as a Tailwind utility', () => {
    // why: Tailwind v4 needs --color-X to expose bg-X/text-X utilities. A
    // shadcn user's existing @theme inline has --color-primary etc. but
    // knows nothing about our user-defined slugs, so we extend it.
    expect(out).toMatch(/@theme inline\s*\{/)
    expect(out).toContain('--color-brand: var(--brand);')
    expect(out).toContain('--color-brand-foreground: var(--brand-foreground);')
  })
})

describe('exportCss(bundle, "shadcn") with includeBrand', () => {
  // why: opt-in stable brand pair. Off by default (keeps the baked globals.css
  // drift-guard baseline byte-identical); on, the literal-seed brand surfaces as
  // --brand / --brand-foreground so shadcn users can author a brand button
  // variant. Mode-invariant: same value in :root and .dark.
  const theme = deriveTheme(DEFAULT_INPUTS)

  it('omits --brand entirely by default', () => {
    const out = exportCss({ default: theme }, 'shadcn')
    expect(out).not.toContain('--brand:')
    expect(out).not.toContain('--color-brand:')
  })

  it('emits the brand pair in :root and .dark with identical (mode-invariant) values', () => {
    const out = exportCss({ default: theme }, 'shadcn', { includeBrand: true })
    const root = parseBlock(out, ':root')
    const dark = parseBlock(out, '.dark')
    const brand = projectLayer(theme.shadcn.brand)
    expect(root['--brand']).toBe(brand['--brand'])
    expect(root['--brand-foreground']).toBe(brand['--brand-foreground'])
    expect(dark['--brand']).toBe(brand['--brand'])
    expect(dark['--brand-foreground']).toBe(brand['--brand-foreground'])
  })

  it('registers --color-brand utilities in @theme inline so bg-brand resolves', () => {
    const out = exportCss({ default: theme }, 'shadcn', { includeBrand: true })
    expect(out).toMatch(/@theme inline\s*\{/)
    expect(out).toContain('--color-brand: var(--brand);')
    expect(out).toContain('--color-brand-foreground: var(--brand-foreground);')
  })
})

describe('exportCss(bundle, "shadcn") includeBrand + a custom color named "brand"', () => {
  // why: a user may legitimately name a custom color "Brand" (slug → brand),
  // which already emits --brand via the custom path. With includeBrand also on,
  // the injected brand must NOT double-emit; the user's explicit custom color
  // wins and only one --brand declaration appears per block.
  const theme = deriveTheme(withCustomColor)
  const out = exportCss({ default: theme }, 'shadcn', { includeBrand: true })

  it('emits --brand exactly once per block (no duplicate from injection)', () => {
    // two blocks (:root, .dark), one declaration each = 2 total
    expect(out.match(/--brand:/g) ?? []).toHaveLength(2)
  })

  it('keeps the custom color value (custom wins over injected brand)', () => {
    const root = parseBlock(out, ':root')
    expect(root['--brand']).toBe(oklchString(theme.shadcn.light['--brand']))
  })
})

describe('exportCss(bundle, "md") with customColors', () => {
  const theme = deriveTheme(withCustomColor)
  const out = exportCss({ default: theme }, 'md')

  it('emits md custom-color tokens in :root/.dark and registers them in @theme inline', () => {
    const root = parseBlock(out, ':root')
    expect(root['--color-brand']).toBeDefined()
    expect(root['--color-on-brand']).toBeDefined()
    expect(root['--color-brand-container']).toBeDefined()
    expect(root['--color-on-brand-container']).toBeDefined()
    expect(out).toContain('--color-brand: var(--color-brand);')
    expect(out).toContain('--color-on-brand: var(--color-on-brand);')
  })
})

describe('exportCss with multi-contrast bundle', () => {
  // why: ADR-0021 commitment 5 — when the bundle carries medium/high tiers,
  // the exporter adds 4 class-scoped rule blocks layered on the existing
  // dark-class axis. Locks the selector pattern so a future regression that
  // drops a tier (or duplicates one) surfaces as a clear test failure.
  //
  // md export selectors (paste-ready): `:root` / `.dark` for the default tier;
  // `.contrast-medium` / `.dark.contrast-medium` (and -high) for opt-in tiers.
  // The dark axis composes with the contrast axis via class-stacking on the
  // same html element — no `:root` selector for tiers because the tier class
  // can land on any container, not just html root.
  const defaultTheme = deriveTheme(DEFAULT_INPUTS)
  const mediumTheme = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0.5, dark: 0.5 } })
  const highTheme = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 1, dark: 1 } })
  const bundle = { default: defaultTheme, medium: mediumTheme, high: highTheme }

  it('md emits exactly 6 rule blocks (2 per tier × 3 tiers)', () => {
    const out = exportCss(bundle, 'md')
    expect(out).toMatch(/:root\s*\{/)
    expect(out).toMatch(/\n\.dark\s*\{/)
    expect(out).toMatch(/\n\.contrast-medium\s*\{/)
    expect(out).toMatch(/\n\.dark\.contrast-medium\s*\{/)
    expect(out).toMatch(/\n\.contrast-high\s*\{/)
    expect(out).toMatch(/\n\.dark\.contrast-high\s*\{/)
  })

  it('contrast-medium block carries medium-tier core values (lean defaults)', () => {
    const out = exportCss(bundle, 'md')
    const medium = parseBlock(out, '.contrast-medium')
    expect(medium).toEqual(projectLayer(mediumTheme.md.light))
  })

  it('contrast-high block carries high-tier core values (lean defaults)', () => {
    const out = exportCss(bundle, 'md')
    const high = parseBlock(out, '.contrast-high')
    expect(high).toEqual(projectLayer(highTheme.md.light))
  })

  it('shadcn ignores contrast tiers — only :root + .dark emit even when bundle carries medium/high', () => {
    // why: shadcn audience doesn't use contrast variants. exportCss collapses
    // any bundle to the default tier on the shadcn path; the contrast filter
    // is not exposed in the dialog (filter-side guard).
    const out = exportCss(bundle, 'shadcn')
    expect(out).toMatch(/:root\s*\{/)
    expect(out).toMatch(/\.dark\s*\{/)
    expect(out).not.toMatch(/contrast-medium/)
    expect(out).not.toMatch(/contrast-high/)
  })
})

describe('exportCss filter combinations (ADR-0021 commitment 6)', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const bundle = { default: theme }

  describe('colorFormat', () => {
    it('oklch (default): every value matches /^oklch\\(/', () => {
      const out = exportCss(bundle, 'md')
      const md = parseBlock(out, ':root')
      for (const v of Object.values(md)) expect(v).toMatch(/^oklch\(/)
    })

    it('hex: every value matches /^#[0-9a-f]{6}$/i', () => {
      const out = exportCss(bundle, 'md', { colorFormat: 'hex' })
      const md = parseBlock(out, ':root')
      for (const v of Object.values(md)) expect(v).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('includeChart', () => {
    it('off (default): chart tokens absent from :root and .dark', () => {
      const out = exportCss(bundle, 'md')
      const md = parseBlock(out, ':root')
      expect(md['--color-chart-1']).toBeUndefined()
      expect(md['--color-chart-5']).toBeUndefined()
    })

    it('on: chart tokens present in :root (light) and .dark (dark)', () => {
      const out = exportCss(bundle, 'md', { includeChart: true })
      const md = parseBlock(out, ':root')
      const dark = parseBlock(out, '.dark')
      expect(md['--color-chart-1']).toBeDefined()
      expect(md['--color-chart-5']).toBeDefined()
      expect(dark['--color-chart-1']).toBeDefined()
    })

    it('on: shadcn emits chart with shadcn naming', () => {
      const out = exportCss(bundle, 'shadcn', { includeChart: true })
      const root = parseBlock(out, ':root')
      expect(root['--chart-1']).toBeDefined()
      expect(root['--chart-5']).toBeDefined()
    })
  })

  describe('includePalette', () => {
    it('off (default): palette tone tokens absent from any block', () => {
      const out = exportCss(bundle, 'md')
      // why: palette tone tokens follow `--color-{family}-{numericTone}`.
      // Probe a specific tone-50 from every family — none should appear when
      // the toggle is off. The role tokens `--color-primary` / `--color-error`
      // are present regardless, so absence is asserted at the tone-50 grain.
      expect(out).not.toContain('--color-primary-50')
      expect(out).not.toContain('--color-secondary-50')
      expect(out).not.toContain('--color-tertiary-50')
      expect(out).not.toContain('--color-neutral-50')
      expect(out).not.toContain('--color-neutral-variant-50')
      expect(out).not.toContain('--color-error-50')
    })

    it('on: palette declares ONLY in the default-tier :root block (mode/contrast invariant)', () => {
      const out = exportCss(bundle, 'md', { includePalette: true })
      const md = parseBlock(out, ':root')
      const dark = parseBlock(out, '.dark')
      expect(md['--color-primary-50']).toBeDefined()
      // dark block does NOT carry palette (cascade picks them up from :root)
      expect(dark['--color-primary-50']).toBeUndefined()
    })

    it('multi-contrast + includePalette: palette value declares once across the file', () => {
      const multi = {
        default: theme,
        medium: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0.5, dark: 0.5 } }),
        high: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 1, dark: 1 } }),
      }
      const out = exportCss(multi, 'md', { includePalette: true })
      // why: count VALUE declarations only (`: oklch(` / `: #`), excluding the
      // single `@theme inline` registration line (`: var(...)`). Palette is
      // mode/contrast-invariant so the value should declare once even across
      // 3 contrast tiers and 2 modes.
      const matches = out.match(/--color-primary-50:\s+(?:oklch|#)/g) ?? []
      expect(matches.length).toBe(1)
    })

    it('on: every palette token registers in @theme inline as a Tailwind utility', () => {
      // why: enabling Palette means users want `bg-primary-50` / `text-error-
      // 100` etc. to work as Tailwind v4 utilities. @theme inline registers
      // each `--color-*` name so Tailwind generates the utility class; the
      // value resolves via the :root declaration at use site (cascade).
      const out = exportCss(bundle, 'md', { includePalette: true })
      for (const tok of Object.keys(theme.md.palette)) {
        expect(out).toContain(`${tok}: var(${tok});`)
      }
    })

    it('on: palette names registered once (no duplicate utility entries)', () => {
      // why: palette tokens are mode/contrast-invariant so they should
      // appear exactly once in @theme inline regardless of tier or mode.
      const out = exportCss(bundle, 'md', { includePalette: true })
      // sample one token; the registration line is structurally fixed.
      const matches = out.match(/--color-primary-50: var\(--color-primary-50\);/g) ?? []
      expect(matches.length).toBe(1)
    })
  })

  describe('includeExtended', () => {
    it('off (default): extended tokens absent from :root', () => {
      const out = exportCss(bundle, 'md')
      const md = parseBlock(out, ':root')
      expect(md['--color-surface-tint']).toBeUndefined()
      expect(md['--color-shadow']).toBeUndefined()
    })

    it('on: extended tokens present in both light and dark blocks', () => {
      const out = exportCss(bundle, 'md', { includeExtended: true })
      const md = parseBlock(out, ':root')
      const dark = parseBlock(out, '.dark')
      expect(md['--color-surface-tint']).toBeDefined()
      expect(md['--color-shadow']).toBeDefined()
      expect(dark['--color-surface-tint']).toBeDefined()
    })

    it('on: extended cascades across contrast tiers when variants are also on', () => {
      // why: user story 21 — when extended and contrast variants are both on,
      // each contrast tier carries its own extended values (contrast-aware
      // extended coverage).
      const multi = {
        default: theme,
        medium: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0.5, dark: 0.5 } }),
        high: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 1, dark: 1 } }),
      }
      const out = exportCss(multi, 'md', { includeExtended: true })
      const medium = parseBlock(out, '.contrast-medium')
      expect(medium['--color-surface-tint']).toBeDefined()
      expect(medium['--color-shadow']).toBeDefined()
    })
  })

  describe('custom colors persist regardless of filter state', () => {
    // why: user story 20 — custom-color tokens are brand surfaces, not
    // opt-in ornament. They emit no matter what the filter toggles say.
    const sourceWithCustom: PortableTheme = {
      ...DEFAULT_INPUTS,
      customColors: [
        {
          id: 'brand-1',
          name: 'Brand',
          hex: '#ff0000',
          blend: false,
          shadcnSource: 'color',
        },
      ],
    }
    const themeWithCustom = deriveTheme(sourceWithCustom)
    const bundleWithCustom = { default: themeWithCustom }

    it('custom-color slugs present under all-off lean defaults', () => {
      const out = exportCss(bundleWithCustom, 'md')
      const md = parseBlock(out, ':root')
      expect(md['--color-brand']).toBeDefined()
      expect(md['--color-on-brand']).toBeDefined()
    })

    it('custom-color slugs present with hex format', () => {
      const out = exportCss(bundleWithCustom, 'md', { colorFormat: 'hex' })
      const md = parseBlock(out, ':root')
      expect(md['--color-brand']).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('custom-color slugs persist with extended + chart + palette all on', () => {
      const out = exportCss(bundleWithCustom, 'md', {
        includeExtended: true,
        includeChart: true,
        includePalette: true,
      })
      const md = parseBlock(out, ':root')
      expect(md['--color-brand']).toBeDefined()
      expect(md['--color-on-brand']).toBeDefined()
    })
  })
})
