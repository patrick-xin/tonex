import { hexFromArgb } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { CONTRAST_PAIRS, type ContrastPair } from '../theme/contrast'
import { deriveTheme } from '../theme/derive'
import { MODES } from '../theme/mode'
import { DEFAULT_INPUTS } from '../theme/schema'
import { auditPairs, auditTheme } from './index'

// why: the Slice 0 acceptance contract. These pin the NEW gate surface
// (auditPairs primitive + auditTheme gate) lifted out of the www contrast
// checker. They assert behaviour against the WCAG spec and the BLESSED gate
// policy — `ok` fails on text failures only; non-text failures are reported as
// warnings but never block — not a golden snapshot. The relocated unit tests
// (apply-level / summary / decorative / result) ride along as the regression
// net for the moved internals; this file owns the two new public functions.

const theme = deriveTheme(DEFAULT_INPUTS)

describe('auditPairs — the exported pair-list primitive', () => {
  const onPrimary: ContrastPair = {
    fg: '--color-on-primary',
    bg: '--color-primary',
    layer: 'md',
    intent: 'text',
    threshold: 4.5,
  }

  it('evaluates each pair in both modes', () => {
    const { results } = auditPairs(theme, [onPrimary])
    expect(results).toHaveLength(2)
    expect(new Set(results.map((r) => r.mode))).toEqual(new Set(MODES))
  })

  it('ok is true when no text pair fails (on-primary/primary clears AA by construction)', () => {
    expect(auditPairs(theme, [onPrimary]).ok).toBe(true)
  })

  it('a degenerate text pair (fg === bg, ratio 1.0) fails and flips ok to false', () => {
    const degenerate: ContrastPair = {
      fg: '--color-surface',
      bg: '--color-surface',
      layer: 'md',
      intent: 'text',
      threshold: 4.5,
    }
    const res = auditPairs(theme, [degenerate])
    expect(res.ok).toBe(false)
    expect(res.results.every((r) => r.result === 'fail')).toBe(true)
  })

  it('a failing NON-text pair is a warn and does NOT flip ok (BLESSED text-only gate)', () => {
    const degenerate: ContrastPair = {
      fg: '--color-surface',
      bg: '--color-surface',
      layer: 'md',
      intent: 'non-text',
      threshold: 3,
    }
    const res = auditPairs(theme, [degenerate])
    expect(res.ok).toBe(true)
    expect(res.results.every((r) => r.result === 'warn')).toBe(true)
  })

  it('level aaa raises the effective threshold above the baked value', () => {
    expect(auditPairs(theme, [onPrimary], { level: 'aa' }).results[0].effectiveThreshold).toBe(4.5)
    expect(auditPairs(theme, [onPrimary], { level: 'aaa' }).results[0].effectiveThreshold).toBe(7)
  })
})

describe('auditTheme — the pass/fail gate over CONTRAST_PAIRS', () => {
  it('returns the gate shape with an aa default level', () => {
    const res = auditTheme(theme)
    expect(res.level).toBe('aa')
    expect(typeof res.ok).toBe('boolean')
    expect(Array.isArray(res.failures)).toBe(true)
    expect(Array.isArray(res.warnings)).toBe(true)
    expect(res.summary).toMatchObject({
      pass: expect.any(Number),
      textFail: expect.any(Number),
      uiFail: expect.any(Number),
      exempt: expect.any(Number),
    })
  })

  it('ok is wired to summary.textFail === 0 (BLESSED policy)', () => {
    const res = auditTheme(theme)
    expect(res.ok).toBe(res.summary.textFail === 0)
  })

  it('covers all 73 static pairs across both modes (146), partitioned functional + exempt', () => {
    const { pass, textFail, uiFail, exempt } = auditTheme(theme).summary
    expect(pass + textFail + uiFail + exempt).toBe(CONTRAST_PAIRS.length * 2)
  })

  it('exempts the 6 decorative outline-variant pairs in both modes (12)', () => {
    expect(auditTheme(theme).summary.exempt).toBe(12)
  })

  it('failures are text fails; warnings are non-text fails; counts match the summary', () => {
    const res = auditTheme(theme)
    expect(res.failures.length).toBe(res.summary.textFail)
    expect(res.warnings.length).toBe(res.summary.uiFail)
    expect(res.failures.every((r) => r.pair.intent === 'text' && r.result === 'fail')).toBe(true)
    expect(res.warnings.every((r) => r.pair.intent === 'non-text' && r.result === 'warn')).toBe(
      true,
    )
  })

  it('is auditPairs over the canonical CONTRAST_PAIRS list (single source, no second scorer)', () => {
    expect(auditTheme(theme).ok).toBe(auditPairs(theme, CONTRAST_PAIRS).ok)
  })

  it('a non-text failure (pinned chart) is reported as a warning but keeps the gate policy', () => {
    const lightBgHex = hexFromArgb(theme.shadcn.light['--background'])
    const pinned = deriveTheme({
      ...DEFAULT_INPUTS,
      shadcnChartOverrides: { light: { '--chart-1': lightBgHex }, dark: {} },
    })
    const res = auditTheme(pinned)
    expect(res.ok).toBe(res.summary.textFail === 0)
    expect(res.warnings.some((r) => r.pair.fg === '--chart-1')).toBe(true)
    expect(res.failures.some((r) => r.pair.fg === '--chart-1')).toBe(false)
  })

  it('level aaa is reflected and is at least as strict as aa', () => {
    const aa = auditTheme(theme, { level: 'aa' })
    const aaa = auditTheme(theme, { level: 'aaa' })
    expect(aa.level).toBe('aa')
    expect(aaa.level).toBe('aaa')
    expect(aaa.summary.textFail).toBeGreaterThanOrEqual(aa.summary.textFail)
  })

  it('includeBrand appends the 5 brand pairs (×2 modes) to the audited set', () => {
    const total = (r: ReturnType<typeof auditTheme>) =>
      r.summary.pass + r.summary.textFail + r.summary.uiFail + r.summary.exempt
    expect(total(auditTheme(theme, { includeBrand: true }))).toBe(total(auditTheme(theme)) + 5 * 2)
  })
})
