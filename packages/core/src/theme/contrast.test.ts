import { describe, expect, it } from 'vitest'
import { evaluateThemeContrast } from './contrast'
import { deriveTheme } from './derive'
import { CONTRAST_PAIRS, DEFAULT_INPUTS } from './schema'

describe('evaluateThemeContrast (ADR-0025 commitment 8)', () => {
  it('reports both modes with 28 pair results each at slice landing', () => {
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    expect(CONTRAST_PAIRS).toHaveLength(28)
    expect(report.light).toHaveLength(28)
    expect(report.dark).toHaveLength(28)
  })

  it('layer split is 18 md + 10 shadcn', () => {
    const md = CONTRAST_PAIRS.filter((p) => p.layer === 'md')
    const shadcn = CONTRAST_PAIRS.filter((p) => p.layer === 'shadcn')
    expect(md).toHaveLength(18)
    expect(shadcn).toHaveLength(10)
  })

  it('every pair is text @ 4.5 at slice 1 — non-text/3.0 lands in slice contrast-3', () => {
    // why: ADR-0025 commitment 7 — intent + threshold ship from day one to
    // avoid a schema migration in slice contrast-3. Pinning both fields here
    // is the forcing function for that commitment.
    for (const pair of CONTRAST_PAIRS) {
      expect(pair.intent).toBe('text')
      expect(pair.threshold).toBe(4.5)
    }
  })

  it('shadcn list is closed at the 10 foreground/root pairs (no destructive)', () => {
    // why: ADR-0025 commitment 6 — destructive's partner is bound via
    // --color-on-error at the md level, so a shadcn destructive pair would
    // double-count. Pinning the exact set catches additions and omissions.
    const shadcn = CONTRAST_PAIRS.filter((p) => p.layer === 'shadcn')
    const actual = new Set(shadcn.map((p) => `${p.fg}/${p.bg}`))
    expect(actual).toEqual(
      new Set([
        '--foreground/--background',
        '--card-foreground/--card',
        '--popover-foreground/--popover',
        '--primary-foreground/--primary',
        '--secondary-foreground/--secondary',
        '--accent-foreground/--accent',
        '--muted-foreground/--muted',
        '--sidebar-foreground/--sidebar',
        '--sidebar-primary-foreground/--sidebar-primary',
        '--sidebar-accent-foreground/--sidebar-accent',
      ]),
    )
  })

  it('passes mirrors ratio >= threshold — no independent fields', () => {
    // why: passes is derived; pinning the relationship prevents a future
    // implementation from drifting the two apart (e.g. rounding ratio for
    // display while computing passes from the unrounded value).
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    for (const result of [...report.light, ...report.dark]) {
      expect(result.passes).toBe(result.ratio >= result.pair.threshold)
    }
  })

  it('md pair argbs come from theme.md[mode]', () => {
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    const onPrimaryLight = report.light.find(
      (r) => r.pair.layer === 'md' && r.pair.fg === '--color-on-primary',
    )
    expect(onPrimaryLight).toBeDefined()
    expect(onPrimaryLight?.fgArgb).toBe(theme.md.light['--color-on-primary'])
    expect(onPrimaryLight?.bgArgb).toBe(theme.md.light['--color-primary'])

    const onPrimaryDark = report.dark.find(
      (r) => r.pair.layer === 'md' && r.pair.fg === '--color-on-primary',
    )
    expect(onPrimaryDark?.fgArgb).toBe(theme.md.dark['--color-on-primary'])
    expect(onPrimaryDark?.bgArgb).toBe(theme.md.dark['--color-primary'])
  })

  it('shadcn pair argbs come from theme.shadcn[mode]', () => {
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    const fgBgLight = report.light.find(
      (r) => r.pair.layer === 'shadcn' && r.pair.fg === '--foreground',
    )
    expect(fgBgLight?.fgArgb).toBe(theme.shadcn.light['--foreground'])
    expect(fgBgLight?.bgArgb).toBe(theme.shadcn.light['--background'])

    const fgBgDark = report.dark.find(
      (r) => r.pair.layer === 'shadcn' && r.pair.fg === '--foreground',
    )
    expect(fgBgDark?.fgArgb).toBe(theme.shadcn.dark['--foreground'])
    expect(fgBgDark?.bgArgb).toBe(theme.shadcn.dark['--background'])
  })

  it('memoized per source identity (sibling cache slot, issue #20 pattern)', () => {
    // why: ADR-0025 commitment 8 — same DerivedTheme reference returns the
    // same ContrastReport reference. Re-deriving on every consumer call would
    // burn 56 contrastRatio computations on every editor keystroke.
    const theme = deriveTheme(DEFAULT_INPUTS)
    expect(evaluateThemeContrast(theme)).toBe(evaluateThemeContrast(theme))
  })
})
