import { describe, expect, it } from 'vitest'
import { resolveContrastPairs } from './pairs'

// why: resolveContrastPairs is the public-name → ContrastPair resolver behind the
// CLI's `check --seed --pairs '[["on-surface","surface"],…]'` form. The agent
// types the PUBLIC vocabulary it read from `generate` output — BARE md role names
// (`on-surface`, matching `--to colors`) and shadcn `--slot` names (matching
// `--to shadcn`). The internal `--color-` id is NOT public and is rejected. The
// load-bearing behaviour is (1) bare md + shadcn names infer the SAME layer the
// scorer reads and resolve to the CANONICAL `--color-` id the scorer indexes,
// (2) the internal `--color-` id is rejected with a bare did-you-mean, (3) an
// unknown name is a did-you-mean error, (4) a cross-family pair is rejected.
// Scoring itself is auditPairs' job, tested there.
describe('resolveContrastPairs', () => {
  it('accepts bare md roles + shadcn slots, infers the layer, resolves md to the canonical id', () => {
    const r = resolveContrastPairs([
      ['--foreground', '--background'], // shadcn slot names — verbatim public form
      ['on-primary', 'primary'], // bare md roles (the `--to colors` form)
      ['chart-1', 'surface'], // bare md-chart fg + bare md surface → md-chart
      ['--chart-1', '--background'], // shadcn-chart
    ])
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.pairs.map((p) => p.layer)).toEqual(['shadcn', 'md', 'md-chart', 'shadcn-chart'])
    // defaults to the strict text bar; threshold is the baked baseline (applyLevel re-applies per level)
    expect(r.pairs.every((p) => p.intent === 'text' && p.threshold === 4.5)).toBe(true)
    // shadcn names pass through verbatim; bare md roles resolve to the canonical
    // `--color-` id the scorer indexes off the DerivedTheme TokenMap
    expect(r.pairs[0]).toMatchObject({ fg: '--foreground', bg: '--background' })
    expect(r.pairs[1]).toMatchObject({ fg: '--color-on-primary', bg: '--color-primary' })
  })

  it('rejects the internal --color- id and points at the bare role name', () => {
    const r = resolveContrastPairs([['--color-on-surface', '--color-surface']])
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]).toContain('--color-on-surface')
    expect(r.errors[0]).toMatch(/bare role name/)
    expect(r.errors[0]).toContain('"on-surface"') // the bare form to use instead
  })

  it('flags an unknown bare token with a did-you-mean instead of resolving it', () => {
    const r = resolveContrastPairs([['on-surfac', 'surface']])
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0]).toContain('on-surfac')
    expect(r.errors[0]).toContain('on-surface') // the suggestion
  })

  it('rejects a cross-layer pair (a bare md fg and a shadcn bg cannot share one map)', () => {
    const r = resolveContrastPairs([['primary', '--background']])
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]).toMatch(/md/)
    expect(r.errors[0]).toMatch(/shadcn/)
  })
})
