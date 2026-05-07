import { describe, expect, it } from 'vitest'
import { deriveTheme, type TokenMap } from '../derive'
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
  mode: 'light' | 'dark',
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

  it('@theme inline registers exactly the 28 core md tokens (no extended, no chart)', () => {
    // why: ADR-0021 commitment 6 — defaults reflect lean output. Extended
    // and chart are opt-in via flags; @theme inline matches the rule-block
    // emission so user paste stays consistent.
    expect(out).toMatch(/@theme inline\s*\{/)
    for (const tok of Object.keys(theme.md.light)) {
      expect(out).toContain(`${tok}: var(${tok});`)
    }
    // extended and chart names absent
    for (const tok of Object.keys(theme.md.lightExtended)) {
      expect(out).not.toContain(`${tok}: var(${tok});`)
    }
    for (const tok of Object.keys(theme.md.lightChart)) {
      expect(out).not.toContain(`${tok}: var(${tok});`)
    }
  })

  it('.md block values match theme.md.light token-for-token (core only)', () => {
    // why: ADR-0021 commitment 5 — exportCss md emission uses `.md` /
    // `html.dark .md` selectors so contrast tiers can layer on the same
    // class axis. Today's bake already used these selectors; the bundle
    // change is input-shape, not selector-shape.
    const md = parseBlock(out, '.md')
    expect(md).toEqual(projectLayer(theme.md.light))
  })

  it('html.dark .md block values match theme.md.dark token-for-token (core only)', () => {
    const dark = parseBlock(out, 'html.dark .md')
    expect(dark).toEqual(projectLayer(theme.md.dark))
  })
})

describe('exportCss with includeExtended: true', () => {
  // why: opt-in tier — emits today's 50 md tokens (core + extended) per rule
  // block. Used by formatCss / bake to preserve byte-equality with globals.css.
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportCss({ default: theme }, 'md', { includeExtended: true })

  it('.md block carries core + extended merged token-for-token', () => {
    const md = parseBlock(out, '.md')
    expect(md).toEqual(projectMergedMd(theme, 'light'))
  })

  it('html.dark .md block carries core + extended merged for dark mode', () => {
    const dark = parseBlock(out, 'html.dark .md')
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

  it('omits Tailwind boilerplate (shadcn users already have it)', () => {
    expect(out).not.toContain('@import "tailwindcss"')
    expect(out).not.toContain('@custom-variant dark')
  })

  it('.shadcn block values match theme.shadcn.light token-for-token', () => {
    const root = parseBlock(out, '.shadcn')
    expect(root).toEqual(projectLayer(theme.shadcn.light))
  })

  it('html.dark .shadcn block values match theme.shadcn.dark token-for-token', () => {
    const dark = parseBlock(out, 'html.dark .shadcn')
    expect(dark).toEqual(projectLayer(theme.shadcn.dark))
  })

  it('omits @theme inline when customColors is empty', () => {
    // why: a fresh shadcn project already has its own @theme inline block
    // bridging --primary → --color-primary etc. Re-emitting it would
    // duplicate the user's existing config. Only custom-color slugs need a
    // bridge from us, since shadcn-cli wouldn't have generated those.
    expect(out).not.toMatch(/@theme inline/)
  })
})

describe('exportCss(bundle, "shadcn") with customColors', () => {
  const theme = deriveTheme(withCustomColor)
  const out = exportCss({ default: theme }, 'shadcn')

  it('includes the custom slug values in .shadcn and html.dark .shadcn', () => {
    const root = parseBlock(out, '.shadcn')
    const dark = parseBlock(out, 'html.dark .shadcn')
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

describe('exportCss(bundle, "md") with customColors', () => {
  const theme = deriveTheme(withCustomColor)
  const out = exportCss({ default: theme }, 'md')

  it('emits md custom-color tokens in .md/html.dark .md and registers them in @theme inline', () => {
    const root = parseBlock(out, '.md')
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
  const defaultTheme = deriveTheme(DEFAULT_INPUTS)
  const mediumTheme = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 })
  const highTheme = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 1 })
  const bundle = { default: defaultTheme, medium: mediumTheme, high: highTheme }

  it('md emits exactly 6 rule blocks (2 per tier × 3 tiers)', () => {
    const out = exportCss(bundle, 'md')
    expect(out).toMatch(/\.md\s*\{/)
    expect(out).toMatch(/html\.dark \.md\s*\{/)
    expect(out).toMatch(/html\.contrast-medium \.md\s*\{/)
    expect(out).toMatch(/html\.contrast-medium\.dark \.md\s*\{/)
    expect(out).toMatch(/html\.contrast-high \.md\s*\{/)
    expect(out).toMatch(/html\.contrast-high\.dark \.md\s*\{/)
  })

  it('contrast-medium block carries medium-tier core values (lean defaults)', () => {
    const out = exportCss(bundle, 'md')
    const medium = parseBlock(out, 'html.contrast-medium .md')
    expect(medium).toEqual(projectLayer(mediumTheme.md.light))
  })

  it('contrast-high block carries high-tier core values (lean defaults)', () => {
    const out = exportCss(bundle, 'md')
    const high = parseBlock(out, 'html.contrast-high .md')
    expect(high).toEqual(projectLayer(highTheme.md.light))
  })

  it('shadcn emits 6 contrast-aware rule blocks', () => {
    const out = exportCss(bundle, 'shadcn')
    expect(out).toMatch(/\.shadcn\s*\{/)
    expect(out).toMatch(/html\.dark \.shadcn\s*\{/)
    expect(out).toMatch(/html\.contrast-medium \.shadcn\s*\{/)
    expect(out).toMatch(/html\.contrast-medium\.dark \.shadcn\s*\{/)
    expect(out).toMatch(/html\.contrast-high \.shadcn\s*\{/)
    expect(out).toMatch(/html\.contrast-high\.dark \.shadcn\s*\{/)
  })
})

describe('exportCss filter combinations (ADR-0021 commitment 6)', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const bundle = { default: theme }

  describe('colorFormat', () => {
    it('oklch (default): every value matches /^oklch\\(/', () => {
      const out = exportCss(bundle, 'md')
      const md = parseBlock(out, '.md')
      for (const v of Object.values(md)) expect(v).toMatch(/^oklch\(/)
    })

    it('hex: every value matches /^#[0-9a-f]{6}$/i', () => {
      const out = exportCss(bundle, 'md', { colorFormat: 'hex' })
      const md = parseBlock(out, '.md')
      for (const v of Object.values(md)) expect(v).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('includeChart', () => {
    it('off (default): chart tokens absent from .md and html.dark .md', () => {
      const out = exportCss(bundle, 'md')
      const md = parseBlock(out, '.md')
      expect(md['--color-chart-1']).toBeUndefined()
      expect(md['--color-chart-5']).toBeUndefined()
    })

    it('on: chart tokens present in .md (light) and html.dark .md (dark)', () => {
      const out = exportCss(bundle, 'md', { includeChart: true })
      const md = parseBlock(out, '.md')
      const dark = parseBlock(out, 'html.dark .md')
      expect(md['--color-chart-1']).toBeDefined()
      expect(md['--color-chart-5']).toBeDefined()
      expect(dark['--color-chart-1']).toBeDefined()
    })

    it('on: shadcn emits chart with shadcn naming', () => {
      const out = exportCss(bundle, 'shadcn', { includeChart: true })
      const root = parseBlock(out, '.shadcn')
      expect(root['--chart-1']).toBeDefined()
      expect(root['--chart-5']).toBeDefined()
    })
  })

  describe('includePalette', () => {
    it('off (default): palette tokens absent from any block', () => {
      const out = exportCss(bundle, 'md')
      expect(out).not.toContain('--md-ref-palette-')
    })

    it('on: palette declares ONLY in the default-tier .md block (mode/contrast invariant)', () => {
      const out = exportCss(bundle, 'md', { includePalette: true })
      const md = parseBlock(out, '.md')
      const dark = parseBlock(out, 'html.dark .md')
      expect(md['--md-ref-palette-primary-50']).toBeDefined()
      // dark block does NOT carry palette (cascade picks them up from .md)
      expect(dark['--md-ref-palette-primary-50']).toBeUndefined()
    })

    it('multi-contrast + includePalette: palette declares once across the file', () => {
      const multi = {
        default: theme,
        medium: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 }),
        high: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 1 }),
      }
      const out = exportCss(multi, 'md', { includePalette: true })
      // count occurrences of one palette token across the whole file
      const matches = out.match(/--md-ref-palette-primary-50:/g) ?? []
      expect(matches.length).toBe(1)
    })
  })

  describe('includeExtended', () => {
    it('off (default): extended tokens absent from .md', () => {
      const out = exportCss(bundle, 'md')
      const md = parseBlock(out, '.md')
      expect(md['--color-surface-tint']).toBeUndefined()
      expect(md['--color-shadow']).toBeUndefined()
    })

    it('on: extended tokens present in both light and dark blocks', () => {
      const out = exportCss(bundle, 'md', { includeExtended: true })
      const md = parseBlock(out, '.md')
      const dark = parseBlock(out, 'html.dark .md')
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
        medium: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 0.5 }),
        high: deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: 1 }),
      }
      const out = exportCss(multi, 'md', { includeExtended: true })
      const medium = parseBlock(out, 'html.contrast-medium .md')
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
      const md = parseBlock(out, '.md')
      expect(md['--color-brand']).toBeDefined()
      expect(md['--color-on-brand']).toBeDefined()
    })

    it('custom-color slugs present with hex format', () => {
      const out = exportCss(bundleWithCustom, 'md', { colorFormat: 'hex' })
      const md = parseBlock(out, '.md')
      expect(md['--color-brand']).toMatch(/^#[0-9a-f]{6}$/i)
    })

    it('custom-color slugs persist with extended + chart + palette all on', () => {
      const out = exportCss(bundleWithCustom, 'md', {
        includeExtended: true,
        includeChart: true,
        includePalette: true,
      })
      const md = parseBlock(out, '.md')
      expect(md['--color-brand']).toBeDefined()
      expect(md['--color-on-brand']).toBeDefined()
    })
  })
})
