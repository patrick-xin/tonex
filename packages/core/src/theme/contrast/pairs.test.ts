import { describe, expect, it } from 'vitest'
import { resolveContrastPairs } from './pairs'

// why: resolveContrastPairs is the bare-name → ContrastPair resolver behind the
// CLI's `check --seed --pairs '[["--fg","--bg"],…]'` form. The load-bearing
// behaviour is (1) layer inference from the name prefix lands the pair in the
// SAME layer the scorer reads, (2) an unknown name is a did-you-mean error (not
// a deep scorer throw), (3) a cross-family pair the one-map scorer can't read is
// rejected up front. Three robust cases pin those; the scoring itself is
// auditPairs' job, tested there.
describe('resolveContrastPairs', () => {
  it('infers the layer from the token-name prefix (shadcn / md / md-chart / shadcn-chart)', () => {
    const r = resolveContrastPairs([
      ['--foreground', '--background'], // shadcn
      ['--color-on-primary', '--color-primary'], // md
      ['--color-chart-1', '--color-surface'], // chart fg + md surface → md-chart
      ['--chart-1', '--background'], // shadcn-chart
    ])
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.pairs.map((p) => p.layer)).toEqual(['shadcn', 'md', 'md-chart', 'shadcn-chart'])
    // defaults to the strict text bar; threshold is the baked baseline (applyLevel re-applies per level)
    expect(r.pairs.every((p) => p.intent === 'text' && p.threshold === 4.5)).toBe(true)
    expect(r.pairs[0]).toMatchObject({ fg: '--foreground', bg: '--background' })
  })

  it('flags an unknown token with a did-you-mean instead of resolving it', () => {
    const r = resolveContrastPairs([['--foregroundd', '--background']])
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors).toHaveLength(1)
    expect(r.errors[0]).toContain('--foregroundd')
    expect(r.errors[0]).toContain('--foreground') // the suggestion
  })

  it('rejects a cross-layer pair (an md fg and a shadcn bg cannot share one map)', () => {
    const r = resolveContrastPairs([['--color-primary', '--background']])
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.errors[0]).toMatch(/md/)
    expect(r.errors[0]).toMatch(/shadcn/)
  })
})
