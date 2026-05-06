import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS, type PortableTheme } from '../schema'
import { exportCss } from './css'

// why: parses `selector { --tok: val; ... }` blocks back into a TokenMap so
// the contract test compares structure against deriveTheme's output without
// snapshotting the full value catalog. Snapshots would re-encode every md/
// shadcn value into the test and break on every legitimate engine change.
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

describe('exportCss(theme, "md")', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportCss(theme, 'md')

  it('emits the standard Tailwind v4 boilerplate header', () => {
    // why: md users get a paste-ready globals.css. The header lines are the
    // exact incantation Tailwind v4 + class-based dark mode requires; without
    // them, dark: utilities flip with prefers-color-scheme rather than the
    // .dark toggle.
    expect(out).toContain('@import "tailwindcss";')
    expect(out).toContain('@custom-variant dark (&:is(.dark *));')
  })

  it('emits an @theme inline block registering every md token as a Tailwind utility', () => {
    expect(out).toMatch(/@theme inline\s*\{/)
    for (const tok of Object.keys(theme.md.light)) {
      expect(out).toContain(`${tok}: var(${tok});`)
    }
  })

  it(':root block values match theme.md.light token-for-token', () => {
    const root = parseBlock(out, ':root')
    expect(root).toEqual(theme.md.light)
  })

  it('.dark block values match theme.md.dark token-for-token', () => {
    const dark = parseBlock(out, '.dark')
    expect(dark).toEqual(theme.md.dark)
  })

  it('does not emit internal scope classes (.md / .shadcn / html.dark)', () => {
    // why: those selectors are testbed infrastructure for side-by-side
    // preview; they have zero value to a downstream md user.
    expect(out).not.toMatch(/\.md\s*\{/)
    expect(out).not.toMatch(/\.shadcn\s*\{/)
    expect(out).not.toMatch(/html\.dark/)
  })
})

describe('exportCss(theme, "shadcn")', () => {
  const theme = deriveTheme(DEFAULT_INPUTS)
  const out = exportCss(theme, 'shadcn')

  it('omits Tailwind boilerplate (shadcn users already have it)', () => {
    expect(out).not.toContain('@import "tailwindcss"')
    expect(out).not.toContain('@custom-variant dark')
  })

  it(':root block values match theme.shadcn.light token-for-token', () => {
    const root = parseBlock(out, ':root')
    expect(root).toEqual(theme.shadcn.light)
  })

  it('.dark block values match theme.shadcn.dark token-for-token', () => {
    const dark = parseBlock(out, '.dark')
    expect(dark).toEqual(theme.shadcn.dark)
  })

  it('omits @theme inline when customColors is empty', () => {
    // why: a fresh shadcn project already has its own @theme inline block
    // bridging --primary → --color-primary etc. Re-emitting it would
    // duplicate the user's existing config. Only custom-color slugs need a
    // bridge from us, since shadcn-cli wouldn't have generated those.
    expect(out).not.toMatch(/@theme inline/)
  })
})

describe('exportCss(theme, "shadcn") with customColors', () => {
  const theme = deriveTheme(withCustomColor)
  const out = exportCss(theme, 'shadcn')

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

describe('exportCss(theme, "md") with customColors', () => {
  const theme = deriveTheme(withCustomColor)
  const out = exportCss(theme, 'md')

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
