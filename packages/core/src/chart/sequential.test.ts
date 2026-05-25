import { contrastRatio } from '@tonex/color-utils'
import { Hct, TonalPalette } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../theme/derive'
import { hctFromHex } from '../theme/hct'
import { MODES, type Mode } from '../theme/mode'
import { DEFAULT_INPUTS } from '../theme/schema'
import { type VariantName, variants } from '../variants'
import { MD_CHART_TOKEN_NAMES } from './schema'
import {
  buildMdChartSequentialSamples,
  PROMINENT_EDGE_DARK_DEFAULT,
  PROMINENT_EDGE_LIGHT_DEFAULT,
} from './sequential'

// why: spec-derived, not golden. Each assertion comes from an independent
// source — the ADR-0027 c.3 3:1 contrast floor (WCAG 1.4.11), the
// ColorBrewer "chart-1 = lightest" convention, the documented single-hue
// short-circuit — so a disagreement between code and expectation surfaces a
// real defect rather than pinning whatever the implementation happens to do.

const SEED_HEXES = [
  '#6750a4', // default-ish violet
  '#b3261e', // red
  '#1e6b3a', // green
  '#0061a4', // blue
  '#7d5260', // muted mauve
  '#ffd600', // high-chroma yellow
  '#3a3a3a', // near-achromatic dark
] as const

const ALL_VARIANTS = Object.keys(variants) as VariantName[]

describe('buildMdChart sequential — 3:1 contrast floor (ADR-0027 c.3)', () => {
  // why: end-to-end through deriveTheme so the test exercises the exact
  // production path — real surface partners, real per-variant palettes — not
  // a reconstruction that could drift from derive.ts. The floor is the whole
  // reason the binary search exists; if any seed × variant × mode emits a
  // chart token below 3:1 against a surface partner, the contract is broken.
  for (const hex of SEED_HEXES) {
    for (const variant of ALL_VARIANTS) {
      it(`holds for seed ${hex} × ${variant}`, () => {
        const theme = deriveTheme({
          ...DEFAULT_INPUTS,
          seed: { ...hctFromHex(hex), exactHex: hex },
          variant,
          chart: { ...DEFAULT_INPUTS.chart, scheme: 'sequential' },
        })
        for (const mode of MODES) {
          const core = mode === 'light' ? theme.md.light : theme.md.dark
          const chart = mode === 'light' ? theme.md.lightChart : theme.md.darkChart
          const partners = [
            core['--color-surface'] as number,
            core['--color-surface-container'] as number,
          ]
          for (const token of MD_CHART_TOKEN_NAMES) {
            const argb = chart[token] as number
            for (const partner of partners) {
              // 1e-6 tolerance absorbs float noise at the bisection boundary;
              // a real sub-3:1 token (e.g. 2.8) still fails loudly.
              expect(contrastRatio(argb, partner)).toBeGreaterThanOrEqual(3 - 1e-6)
            }
          }
        }
      })
    }
  }
})

// why: synthetic light/dark surface partners for the direct-call unit tests.
// Production light surfaces sit at tone ~94–98 and dark at ~6–12; these
// stand-ins keep the binary search in its normal (non-degenerate) regime so
// the walk-shape invariants below are exercised the way derive.ts drives them.
const LIGHT_PARTNERS = [Hct.from(0, 0, 98).toInt(), Hct.from(0, 0, 94).toInt()]
const DARK_PARTNERS = [Hct.from(0, 0, 6).toInt(), Hct.from(0, 0, 12).toInt()]

function partnersFor(mode: Mode) {
  return mode === 'light' ? LIGHT_PARTNERS : DARK_PARTNERS
}

function prominentFor(mode: Mode) {
  return mode === 'light' ? PROMINENT_EDGE_LIGHT_DEFAULT : PROMINENT_EDGE_DARK_DEFAULT
}

describe('buildMdChartSequentialSamples — tone walk shape', () => {
  const palette = TonalPalette.fromHueAndChroma(280, 48)
  const n = MD_CHART_TOKEN_NAMES.length

  for (const mode of MODES) {
    it(`chart-1 is the lightest sample and the walk is monotonic (${mode})`, () => {
      // why: ColorBrewer convention — chart-1 = lightest, chart-N = darkest,
      // ordered by L* in both modes (sequential.ts step 3). The walk between
      // the two edges must be strictly monotonic so series stay perceptually
      // ordered; a flat or reversed step would collapse two series visually.
      const { samples } = buildMdChartSequentialSamples(
        palette,
        mode,
        partnersFor(mode),
        prominentFor(mode),
        0,
        'chart-1',
        n,
        Array(n).fill(null),
      )
      expect(samples).toHaveLength(n)
      expect(samples[0]).toBe(Math.max(...samples))
      for (let i = 1; i < n; i++) {
        expect(samples[i]).toBeLessThan(samples[i - 1] as number)
      }
    })
  }

  it('hueSpread = 0 short-circuits to a single (seed) hue across all slots', () => {
    // why: the single-hue opt-in (chart.hueSpread = 0). Every slot must carry
    // the seed palette's hue exactly — sequential.ts guarantees bit-identical
    // output to the pre-multi-hue path by reusing the seed palette when the
    // slot hue matches.
    const { hues } = buildMdChartSequentialSamples(
      palette,
      'light',
      LIGHT_PARTNERS,
      PROMINENT_EDGE_LIGHT_DEFAULT,
      0,
      'chart-1',
      n,
      Array(n).fill(null),
    )
    for (const h of hues) {
      expect(h).toBe(palette.hue)
    }
  })

  it("anchor 'chart-1' rotates hue linearly from seed (slot 0) to seed + hueSpread (slot N)", () => {
    // why: hueAtSlot — chart-1 carries the seed hue (t=0), chart-N is rotated
    // by the full hueSpread (t=1), intermediate slots interpolate linearly.
    const spread = 80
    const { hues } = buildMdChartSequentialSamples(
      palette,
      'light',
      LIGHT_PARTNERS,
      PROMINENT_EDGE_LIGHT_DEFAULT,
      spread,
      'chart-1',
      n,
      Array(n).fill(null),
    )
    expect(hues[0]).toBeCloseTo(palette.hue, 6)
    expect(hues[n - 1]).toBeCloseTo(palette.hue + spread, 6)
    expect(hues[2]).toBeCloseTo(palette.hue + spread * (2 / (n - 1)), 6)
  })
})

describe('buildMdChartSequentialSamples — degenerate-partner safe edge', () => {
  // ACCEPTED LAB-ONLY LIMITATION (#131, resolved as document-only — this
  // it.fails marker is permanent, not a TODO): when no tone clears 3:1
  // against the partner, findMaxSafeL returns 0 even though tone 0 does not
  // pass — so the emitted dark-end token violates the 3:1 floor the function
  // documents (observed ~1.4:1). Unreachable via the production light path
  // (deriveTheme partners sit at tone ~94–98, so passes(0) is always true);
  // only buildSequentialReport (the chart-lab dev route) can feed a partner
  // dark enough to trip it. #131 weighed throw / best-effort-flag / document
  // and chose document: production can't reach it, so we keep this probe red
  // as the standing record of the contract rather than hardening a branch no
  // user path exercises. If a future slice routes arbitrary partners into a
  // production path, reopen the disposition then.
  it.fails('should meet the 3:1 floor when partners are mid-dark', () => {
    const palette = TonalPalette.fromHueAndChroma(280, 48)
    const n = MD_CHART_TOKEN_NAMES.length
    // tone-30 gray: black (tone 0) vs this partner is ~2.2:1, below 3:1.
    const darkPartners = [Hct.from(0, 0, 30).toInt()]
    const { argbs } = buildMdChartSequentialSamples(
      palette,
      'light',
      darkPartners,
      PROMINENT_EDGE_LIGHT_DEFAULT,
      0,
      'chart-1',
      n,
      Array(n).fill(null),
    )
    for (const argb of argbs) {
      expect(contrastRatio(argb, darkPartners[0] as number)).toBeGreaterThanOrEqual(3 - 1e-6)
    }
  })
})
