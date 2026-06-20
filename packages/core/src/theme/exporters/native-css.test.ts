import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { hexString, oklchString } from '../oklch'
import { DEFAULT_INPUTS, type PortableTheme } from '../schema'
import { exportNativeCss } from './native-css'

// why: native CSS emits one declaration per token as `light-dark(L, D)`, so the
// parser keeps the whole value (including the inner commas) rather than the
// single-value shape css.test.ts assumes. Reuses the `--prop: value;` line grammar.
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

function lightDark(light: number, dark: number, fmt: 'oklch' | 'hex' = 'oklch'): string {
  const proj = fmt === 'hex' ? hexString : oklchString
  return `light-dark(${proj(light)}, ${proj(dark)})`
}

const withCustomColor: PortableTheme = {
  ...DEFAULT_INPUTS,
  customColors: [
    { id: 'brand-1', name: 'Brand', hex: '#ff0000', blend: false, shadcnSource: 'color' },
  ],
}

describe('exportNativeCss — defaults (md-sys prefix on, extended on, oklch)', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportNativeCss({ default: theme })

  it(':root opts into automatic light/dark via color-scheme', () => {
    expect(out).toMatch(/:root\s*\{[^}]*color-scheme:\s*light dark;/)
  })

  it('system tokens emit under the --md-sys-color-* namespace', () => {
    const root = parseBlock(out, ':root')
    expect(root['--md-sys-color-primary']).toBeDefined()
    // un-prefixed system name must NOT leak through
    expect(root['--color-primary']).toBeUndefined()
  })

  it('each system token is a light-dark() pair of (light, dark) values', () => {
    const root = parseBlock(out, ':root')
    expect(root['--md-sys-color-primary']).toBe(
      lightDark(theme.md.light['--color-primary'], theme.md.dark['--color-primary']),
    )
  })

  it('extended tokens are included by default (Material Web reads them)', () => {
    const root = parseBlock(out, ':root')
    expect(root['--md-sys-color-surface-tint']).toBeDefined()
    expect(root['--md-sys-color-primary-fixed']).toBeDefined()
  })

  it('emits color-scheme switches for class- and data-attribute toggles', () => {
    expect(out).toMatch(/\.dark[^{]*\{[^}]*color-scheme:\s*dark;/)
    expect(out).toMatch(/\[data-theme=['"]dark['"]\]/)
    expect(out).toMatch(/\.light[^{]*\{[^}]*color-scheme:\s*light;/)
    expect(out).toMatch(/\[data-theme=['"]light['"]\]/)
  })

  it('single-tier bundle emits no contrast blocks', () => {
    expect(out).not.toMatch(/contrast-medium/)
    expect(out).not.toMatch(/contrast-high/)
  })
})

describe('exportNativeCss — mdSysPrefix off', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportNativeCss({ default: theme }, { mdSysPrefix: false })

  it('system tokens keep the bare --color-* namespace', () => {
    const root = parseBlock(out, ':root')
    expect(root['--color-primary']).toBeDefined()
    expect(root['--md-sys-color-primary']).toBeUndefined()
  })

  it('values are still light-dark() pairs', () => {
    const root = parseBlock(out, ':root')
    expect(root['--color-primary']).toBe(
      lightDark(theme.md.light['--color-primary'], theme.md.dark['--color-primary']),
    )
  })
})

describe('exportNativeCss — colorFormat hex', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportNativeCss({ default: theme }, { colorFormat: 'hex' })

  it('projects each side of light-dark() to hex', () => {
    const root = parseBlock(out, ':root')
    expect(root['--md-sys-color-primary']).toBe(
      lightDark(theme.md.light['--color-primary'], theme.md.dark['--color-primary'], 'hex'),
    )
  })
})

describe('exportNativeCss — custom colors stay un-prefixed', () => {
  const theme = deriveTheme(withCustomColor)
  const out = exportNativeCss({ default: theme })

  it('a custom slug is not md-sys-prefixed even when system tokens are', () => {
    const root = parseBlock(out, ':root')
    expect(root['--color-brand']).toBeDefined()
    expect(root['--md-sys-color-brand']).toBeUndefined()
    expect(root['--md-sys-color-primary']).toBeDefined()
  })

  it('the custom slug value is still a light-dark() pair', () => {
    const root = parseBlock(out, ':root')
    expect(root['--color-brand']).toMatch(/^light-dark\(/)
  })
})

describe('exportNativeCss — multi-contrast bundle', () => {
  const defaultTheme = deriveTheme(DEFAULT_INPUTS)
  const mediumTheme = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 0.5, dark: 0.5 } })
  const highTheme = deriveTheme({ ...DEFAULT_INPUTS, contrastLevel: { light: 1, dark: 1 } })
  const bundle = { default: defaultTheme, medium: mediumTheme, high: highTheme }
  const out = exportNativeCss(bundle)

  it('emits a .contrast-medium and .contrast-high block', () => {
    expect(out).toMatch(/\.contrast-medium\s*\{/)
    expect(out).toMatch(/\.contrast-high\s*\{/)
  })

  it('contrast-medium carries that tier light-dark values under the same namespace', () => {
    const medium = parseBlock(out, '.contrast-medium')
    expect(medium['--md-sys-color-primary']).toBe(
      lightDark(mediumTheme.md.light['--color-primary'], mediumTheme.md.dark['--color-primary']),
    )
  })

  it('contrast tiers do not re-declare color-scheme (inherit from :root)', () => {
    const medium = parseBlock(out, '.contrast-medium')
    expect(medium['color-scheme']).toBeUndefined()
  })
})

describe('exportNativeCss — includeChart', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)

  it('off by default: chart tokens absent', () => {
    const root = parseBlock(exportNativeCss({ default: theme }), ':root')
    expect(root['--color-chart-1']).toBeUndefined()
  })

  it('on: chart tokens emit un-prefixed as light-dark pairs', () => {
    const root = parseBlock(exportNativeCss({ default: theme }, { includeChart: true }), ':root')
    expect(root['--color-chart-1']).toMatch(/^light-dark\(/)
    expect(root['--md-sys-color-chart-1']).toBeUndefined()
  })
})

// why: same provenance contract as css.ts — the opaque recipe string renders as
// a leading /* */ comment when set, nothing when absent (ADR-0039 Decision 7).
describe('exportNativeCss — provenance recipe', () => {
  const recipe = "tonex generate --seed '#3b82f6' --variant cmf --to css"

  it('prepends the recipe as a leading /* */ comment, :root intact below', () => {
    const out = exportNativeCss({ default: deriveTheme(DEFAULT_INPUTS) }, { provenance: recipe })
    expect(out.startsWith(`/* ${recipe} */`)).toBe(true)
    expect(out).toContain(':root {')
  })

  it('emits no comment banner when provenance is absent', () => {
    expect(exportNativeCss({ default: deriveTheme(DEFAULT_INPUTS) }, {}).startsWith('/*')).toBe(
      false,
    )
  })
})

describe('exportNativeCss with includeBrand', () => {
  // why: brand parity (ADR-0032). Off by default (drift-guard). On, the literal-
  // seed brand pair emits flat in :root — mode-invariant, so NO light-dark()
  // wrapper — and keeps the --color-* namespace (brand is not an MD3 system
  // token, same rule as chart/custom slugs that never become --md-sys-color-*).
  const theme = deriveTheme(DEFAULT_INPUTS)

  it('omits --color-brand by default', () => {
    expect(exportNativeCss({ default: theme })).not.toContain('--color-brand')
  })

  it('emits the brand pair flat in :root, un-prefixed and mode-invariant', () => {
    const out = exportNativeCss({ default: theme }, { includeBrand: true })
    const root = parseBlock(out, ':root')
    expect(root['--color-brand']).toBe(oklchString(theme.shadcn.brand['--brand']))
    expect(root['--color-brand-foreground']).toBe(
      oklchString(theme.shadcn.brand['--brand-foreground']),
    )
    // mode-invariant: a flat value, never a light-dark() pair
    expect(root['--color-brand']).not.toContain('light-dark(')
    // not an MD3 system token
    expect(out).not.toContain('--md-sys-color-brand')
  })
})
