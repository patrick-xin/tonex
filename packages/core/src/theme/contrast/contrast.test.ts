import { hexFromArgb } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import type { CustomColorEntry } from '../custom-color/entry'
import { deriveTheme } from '../derive'
import { DEFAULT_INPUTS } from '../schema'
import { evaluateThemeContrast } from './contrast'
import { CONTRAST_PAIRS, customColorContrastPairs } from './pairs'

describe('evaluateThemeContrast (ADR-0025 commitment 8)', () => {
  it('reports both modes with 55 pair results each post slice contrast-4', () => {
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    expect(CONTRAST_PAIRS).toHaveLength(55)
    expect(report.light).toHaveLength(55)
    expect(report.dark).toHaveLength(55)
  })

  it('layer split is 20 md + 10 md-chart + 15 shadcn + 10 shadcn-chart', () => {
    const md = CONTRAST_PAIRS.filter((p) => p.layer === 'md')
    const mdChart = CONTRAST_PAIRS.filter((p) => p.layer === 'md-chart')
    const shadcn = CONTRAST_PAIRS.filter((p) => p.layer === 'shadcn')
    const shadcnChart = CONTRAST_PAIRS.filter((p) => p.layer === 'shadcn-chart')
    expect(md).toHaveLength(20)
    expect(mdChart).toHaveLength(10)
    expect(shadcn).toHaveLength(15)
    expect(shadcnChart).toHaveLength(10)
  })

  it('intent split is 28 text @ 4.5 + 27 non-text @ 3.0', () => {
    // why: ADR-0025 commitment 7 — slice contrast-3 added 7 non-text pairs;
    // slice contrast-4 (ADR-0027 c.5) adds 20 more for the chart layer
    // (10 md-chart + 10 shadcn-chart). intent + threshold are coupled —
    // text always 4.5, non-text always 3.0. Pinning the exact counts catches
    // drift on either axis.
    const text = CONTRAST_PAIRS.filter((p) => p.intent === 'text')
    const nonText = CONTRAST_PAIRS.filter((p) => p.intent === 'non-text')
    expect(text).toHaveLength(28)
    expect(nonText).toHaveLength(27)
    for (const pair of text) expect(pair.threshold).toBe(4.5)
    for (const pair of nonText) expect(pair.threshold).toBe(3)
  })

  it('shadcn text list is closed at the 10 foreground/root pairs (no destructive)', () => {
    // why: ADR-0025 commitment 6 — destructive's partner is bound via
    // --color-on-error at the md level, so a shadcn destructive pair would
    // double-count. Pinning the exact set catches additions and omissions.
    const shadcn = CONTRAST_PAIRS.filter((p) => p.layer === 'shadcn' && p.intent === 'text')
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

  it('non-text pairs cover outline (md) + border/input/ring + sidebar edges (shadcn)', () => {
    // why: ADR-0025 commitment 7 — closed list of non-text pairs at 3:1.
    // Per-role bg picks the most loaded render context: --border on root,
    // --input/--ring on cards (form surfaces), sidebar edges scoped to
    // --sidebar. md outline + outline-variant against --color-surface.
    const nonText = CONTRAST_PAIRS.filter(
      (p) => p.intent === 'non-text' && p.layer !== 'shadcn-chart' && p.layer !== 'md-chart',
    )
    const actual = new Set(nonText.map((p) => `${p.layer}:${p.fg}/${p.bg}`))
    expect(actual).toEqual(
      new Set([
        'md:--color-outline/--color-surface',
        'md:--color-outline-variant/--color-surface',
        'shadcn:--border/--background',
        'shadcn:--input/--card',
        'shadcn:--ring/--card',
        'shadcn:--sidebar-border/--sidebar',
        'shadcn:--sidebar-ring/--sidebar',
      ]),
    )
  })

  it('md-chart layer pins 5 chart-vs-surface + 5 chart-vs-surface-container at 3:1', () => {
    // why: ADR-0027 c.5 — MD3 chart tokens get the same contrast treatment as
    // shadcn. Partners chosen: --color-surface (canvas) and
    // --color-surface-container (chart panel — shadcn's --card binds here).
    // Additional surface-container variants (-low, -high, -highest) deferred
    // to a future slice.
    const chart = CONTRAST_PAIRS.filter((p) => p.layer === 'md-chart')
    const actual = new Set(chart.map((p) => `${p.fg}/${p.bg}`))
    expect(actual).toEqual(
      new Set([
        '--color-chart-1/--color-surface',
        '--color-chart-2/--color-surface',
        '--color-chart-3/--color-surface',
        '--color-chart-4/--color-surface',
        '--color-chart-5/--color-surface',
        '--color-chart-1/--color-surface-container',
        '--color-chart-2/--color-surface-container',
        '--color-chart-3/--color-surface-container',
        '--color-chart-4/--color-surface-container',
        '--color-chart-5/--color-surface-container',
      ]),
    )
    for (const pair of chart) {
      expect(pair.intent).toBe('non-text')
      expect(pair.threshold).toBe(3)
    }
  })

  it('shadcn-chart layer pins 5 chart-vs-background + 5 chart-vs-card at 3:1', () => {
    // why: ADR-0027 c.5 — chart override is in users' hands; pinning chart-N
    // to a hex visually identical to its partner can fail 3:1 silently. Two
    // partners: --background (canvas case) and --card (panel case, most
    // common shadcn chart render — typically bound to --color-surface-container).
    const chart = CONTRAST_PAIRS.filter((p) => p.layer === 'shadcn-chart')
    const actual = new Set(chart.map((p) => `${p.fg}/${p.bg}`))
    expect(actual).toEqual(
      new Set([
        '--chart-1/--background',
        '--chart-2/--background',
        '--chart-3/--background',
        '--chart-4/--background',
        '--chart-5/--background',
        '--chart-1/--card',
        '--chart-2/--card',
        '--chart-3/--card',
        '--chart-4/--card',
        '--chart-5/--card',
      ]),
    )
    for (const pair of chart) {
      expect(pair.intent).toBe('non-text')
      expect(pair.threshold).toBe(3)
    }
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

  it('md-chart pair argbs read chart fg from md.lightChart/darkChart, partner from md.light', () => {
    // why: ADR-0027 c.5 — md chart tokens live at theme.md.lightChart /
    // darkChart (separate map per ADR-0021 c.2 emission-policy partition).
    // Partners (--color-surface, --color-surface-container) live in
    // theme.md.light. evaluatePair merges them once per mode.
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    const chart1Surface = report.light.find(
      (r) =>
        r.pair.layer === 'md-chart' &&
        r.pair.fg === '--color-chart-1' &&
        r.pair.bg === '--color-surface',
    )
    expect(chart1Surface?.fgArgb).toBe(theme.md.lightChart['--color-chart-1'])
    expect(chart1Surface?.bgArgb).toBe(theme.md.light['--color-surface'])

    const chart3ContainerDark = report.dark.find(
      (r) =>
        r.pair.layer === 'md-chart' &&
        r.pair.fg === '--color-chart-3' &&
        r.pair.bg === '--color-surface-container',
    )
    expect(chart3ContainerDark?.fgArgb).toBe(theme.md.darkChart['--color-chart-3'])
    expect(chart3ContainerDark?.bgArgb).toBe(theme.md.dark['--color-surface-container'])
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

  it('shadcn-chart pair argbs read chart fg from shadcn.lightChart/darkChart, partner from shadcn.light/dark', () => {
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    const chart1Bg = report.light.find(
      (r) =>
        r.pair.layer === 'shadcn-chart' &&
        r.pair.fg === '--chart-1' &&
        r.pair.bg === '--background',
    )
    expect(chart1Bg?.fgArgb).toBe(theme.shadcn.lightChart['--chart-1'])
    expect(chart1Bg?.bgArgb).toBe(theme.shadcn.light['--background'])

    const chart3CardDark = report.dark.find(
      (r) => r.pair.layer === 'shadcn-chart' && r.pair.fg === '--chart-3' && r.pair.bg === '--card',
    )
    expect(chart3CardDark?.fgArgb).toBe(theme.shadcn.darkChart['--chart-3'])
    expect(chart3CardDark?.bgArgb).toBe(theme.shadcn.dark['--card'])
  })

  it('DEFAULT_INPUTS sequential scheme passes all 20 chart pairs in both modes', () => {
    // why: ADR-0027 c.5 — locking the foundation. Defaults shouldn't ship a
    // failing chart pair. The chart-tone constants in derive.ts are tuned so
    // both md-chart and shadcn-chart pairs hit 3:1 against their respective
    // surface/card partners. If a future tone change degrades this, this test
    // surfaces the regression before users see broken charts.
    const theme = deriveTheme(DEFAULT_INPUTS)
    const report = evaluateThemeContrast(theme)
    const chart = [...report.light, ...report.dark].filter(
      (r) => r.pair.layer === 'md-chart' || r.pair.layer === 'shadcn-chart',
    )
    expect(chart).toHaveLength(40)
    for (const result of chart) {
      expect(result.passes).toBe(true)
    }
  })

  it('DEFAULT_INPUTS categorical scheme passes all 20 chart pairs in both modes', () => {
    // why: ADR-0027 c.5 — same foundation guarantee applies to the categorical
    // scheme (hue-rotated, fixed tone). Sequential and categorical use
    // different tone parameters; both must satisfy the contrast contract.
    const theme = deriveTheme({
      ...DEFAULT_INPUTS,
      chart: { ...DEFAULT_INPUTS.chart, scheme: 'categorical' },
    })
    const report = evaluateThemeContrast(theme)
    const chart = [...report.light, ...report.dark].filter(
      (r) => r.pair.layer === 'md-chart' || r.pair.layer === 'shadcn-chart',
    )
    expect(chart).toHaveLength(40)
    for (const result of chart) {
      expect(result.passes).toBe(true)
    }
  })

  it('pinning --chart-1 to the current --background hex surfaces a failing pair', () => {
    // why: ADR-0027 c.5 — chart override is in users' hands. Pinning chart-1
    // to a hex visually identical to --background degenerates the ratio to
    // ~1.0; the report must flag this so consumers (eventual swatch UI) can
    // warn. md side has no override surface yet — only shadcn covered.
    const baseTheme = deriveTheme(DEFAULT_INPUTS)
    const lightBgHex = hexFromArgb(baseTheme.shadcn.light['--background'])

    const pinned = deriveTheme({
      ...DEFAULT_INPUTS,
      shadcnChartOverrides: {
        light: { '--chart-1': lightBgHex },
        dark: {},
      },
    })
    const report = evaluateThemeContrast(pinned)
    const chart1Bg = report.light.find(
      (r) =>
        r.pair.layer === 'shadcn-chart' &&
        r.pair.fg === '--chart-1' &&
        r.pair.bg === '--background',
    )
    expect(chart1Bg).toBeDefined()
    expect(chart1Bg?.passes).toBe(false)
    expect(chart1Bg?.ratio).toBeLessThan(3)
  })

  it('memoized per source identity (sibling cache slot, issue #20 pattern)', () => {
    // why: ADR-0025 commitment 8 — same DerivedTheme reference returns the
    // same ContrastReport reference. Re-deriving on every consumer call would
    // burn 56 contrastRatio computations on every editor keystroke.
    const theme = deriveTheme(DEFAULT_INPUTS)
    expect(evaluateThemeContrast(theme)).toBe(evaluateThemeContrast(theme))
  })
})

describe('custom-color contrast (ADR-0025 anticipated pair-union widening)', () => {
  // why: ADR-0025's Consequences section names "custom-color contrast" as a
  // future pair-union widening (chart contrast already did the same via
  // ADR-0027). Custom-color pairs are spec-shaped — `on-X / X` and
  // `-foreground / root` — not the arbitrary persisted pairs commitment 9
  // rules out. The slugs are runtime, so they cannot live in the closed
  // CONTRAST_PAIRS tuple; they are built per-call from source.customColors.
  const brand: CustomColorEntry = {
    id: 'id-brand',
    name: 'Brand',
    hex: '#3b82f6',
    blend: false,
    shadcnSource: 'color',
  }
  const accentTwo: CustomColorEntry = {
    id: 'id-accent-two',
    name: 'Accent Two',
    hex: '#f59e0b',
    blend: false,
    shadcnSource: 'container',
  }

  describe('customColorContrastPairs', () => {
    it('emits 2 md-custom + 1 shadcn-custom text pair per entry', () => {
      const pairs = customColorContrastPairs([brand])
      expect(pairs).toHaveLength(3)
      expect(pairs.filter((p) => p.layer === 'md-custom')).toHaveLength(2)
      expect(pairs.filter((p) => p.layer === 'shadcn-custom')).toHaveLength(1)
      for (const pair of pairs) {
        expect(pair.intent).toBe('text')
        expect(pair.threshold).toBe(4.5)
      }
    })

    it('pairs follow on-X/X and -foreground/root semantics, slug-derived', () => {
      const actual = new Set(
        customColorContrastPairs([brand]).map((p) => `${p.layer}:${p.fg}/${p.bg}`),
      )
      expect(actual).toEqual(
        new Set([
          'md-custom:--color-on-brand/--color-brand',
          'md-custom:--color-on-brand-container/--color-brand-container',
          'shadcn-custom:--brand-foreground/--brand',
        ]),
      )
    })

    it('slugifies multi-word names the same way deriveTheme emits them', () => {
      const bgs = new Set(customColorContrastPairs([accentTwo]).map((p) => p.bg))
      expect(bgs).toEqual(
        new Set(['--color-accent-two', '--color-accent-two-container', '--accent-two']),
      )
    })

    it('empty input yields no pairs; N entries yield 3N', () => {
      expect(customColorContrastPairs([])).toEqual([])
      expect(customColorContrastPairs([brand, accentTwo])).toHaveLength(6)
    })
  })

  describe('evaluateThemeContrast with customColors', () => {
    it('omitting customColors leaves the report at the 55 static pairs', () => {
      // why: the 4 role-editor surfaces call evaluateThemeContrast(theme) with
      // no custom arg — they must keep seeing exactly the static spec list.
      const theme = deriveTheme({ ...DEFAULT_INPUTS, customColors: [brand] })
      const report = evaluateThemeContrast(theme)
      expect(report.light).toHaveLength(55)
      expect(report.dark).toHaveLength(55)
    })

    it('passing customColors appends 3 evaluated pairs per entry, both modes', () => {
      const theme = deriveTheme({ ...DEFAULT_INPUTS, customColors: [brand] })
      const report = evaluateThemeContrast(theme, [brand])
      expect(report.light).toHaveLength(58)
      expect(report.dark).toHaveLength(58)
      const custom = report.light.filter(
        (r) => r.pair.layer === 'md-custom' || r.pair.layer === 'shadcn-custom',
      )
      expect(custom).toHaveLength(3)
    })

    it('md-custom pair argbs read from theme.md[mode]', () => {
      const theme = deriveTheme({ ...DEFAULT_INPUTS, customColors: [brand] })
      const report = evaluateThemeContrast(theme, [brand])
      const onBrand = report.light.find(
        (r) => r.pair.layer === 'md-custom' && r.pair.fg === '--color-on-brand',
      )
      expect(onBrand?.fgArgb).toBe(theme.md.light['--color-on-brand'])
      expect(onBrand?.bgArgb).toBe(theme.md.light['--color-brand'])
    })

    it('shadcn-custom pair argbs read from theme.shadcn[mode]', () => {
      const theme = deriveTheme({ ...DEFAULT_INPUTS, customColors: [brand] })
      const report = evaluateThemeContrast(theme, [brand])
      const brandFg = report.dark.find(
        (r) => r.pair.layer === 'shadcn-custom' && r.pair.fg === '--brand-foreground',
      )
      expect(brandFg?.fgArgb).toBe(theme.shadcn.dark['--brand-foreground'])
      expect(brandFg?.bgArgb).toBe(theme.shadcn.dark['--brand'])
    })

    it('custom pairs get a real WCAG ratio and passes mirrors ratio >= threshold', () => {
      const theme = deriveTheme({ ...DEFAULT_INPUTS, customColors: [brand, accentTwo] })
      const report = evaluateThemeContrast(theme, [brand, accentTwo])
      const custom = [...report.light, ...report.dark].filter(
        (r) => r.pair.layer === 'md-custom' || r.pair.layer === 'shadcn-custom',
      )
      expect(custom).toHaveLength(12)
      for (const result of custom) {
        expect(result.ratio).toBeGreaterThan(1)
        expect(result.passes).toBe(result.ratio >= result.pair.threshold)
      }
    })

    it('a prior plain call on the same theme does not poison a custom-aware call', () => {
      // why: the WeakMap caches only the customColors-independent slice. A
      // role-editor surface calling evaluateThemeContrast(theme) first must not
      // make the contrast dialog's evaluateThemeContrast(theme, customColors)
      // return a stale custom-free report from the shared cache slot.
      const theme = deriveTheme({ ...DEFAULT_INPUTS, customColors: [brand] })
      evaluateThemeContrast(theme)
      const report = evaluateThemeContrast(theme, [brand])
      expect(report.light).toHaveLength(58)
      expect(report.light.some((r) => r.pair.layer === 'md-custom')).toBe(true)
    })

    it('a prior custom-aware call on the same theme does not poison a plain call', () => {
      const theme = deriveTheme({ ...DEFAULT_INPUTS, customColors: [brand] })
      evaluateThemeContrast(theme, [brand])
      expect(evaluateThemeContrast(theme).light).toHaveLength(55)
    })
  })
})
