import { Hct } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { deriveTheme } from '../theme/derive'
import { hctFromHex } from '../theme/hct'
import type { Mode } from '../theme/mode'
import { DEFAULT_INPUTS } from '../theme/schema'
import { applyShadcnChartOverrides, rebrandChart } from './build'
import { MD_CHART_TOKEN_NAMES, SHADCN_CHART_TOKEN_NAMES } from './schema'

// why: spec-derived — assertions come from ADR-0024 (categorical = source
// hue + triadic ±120° + split-complementary 60°/180°) and ADR-0027 c.5
// (fixed chroma/tone), not from the emitted argbs. The achromatic-fallback
// case asserts behaviour ("gray seed in → colourful series out"), so it can
// catch a regression where the fallback is dropped, not just pin output.

// why: hue difference on the circle, normalised to [0, 360). Gamut snapping
// at fixed chroma 50 can nudge a hue a few degrees, so the relative-offset
// assertions below carry a tolerance rather than demanding exact equality.
function hueDelta(a: number, b: number): number {
  return (((a - b) % 360) + 360) % 360
}

// why: gamut snapping at fixed chroma/tone shifts hue/tone by at most a
// couple of degrees; 4° is comfortably above the observed snap and well
// below any real change to the documented offsets/tones.
const SNAP_TOLERANCE = 4
function expectNear(actual: number, expected: number) {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(SNAP_TOLERANCE)
}

function categoricalChart(hex: string, mode: Mode) {
  const theme = deriveTheme({
    ...DEFAULT_INPUTS,
    seed: { ...hctFromHex(hex), exactHex: hex },
    chart: { ...DEFAULT_INPUTS.chart, scheme: 'categorical' },
  })
  const map = mode === 'light' ? theme.md.lightChart : theme.md.darkChart
  return MD_CHART_TOKEN_NAMES.map((name) => Hct.fromInt(map[name] as number))
}

// why: ADR-0024 offsets. Restated here as the independent spec — if build.ts
// changes the rotation, the relative-hue assertions diverge from this list.
const EXPECTED_OFFSETS = [0, 120, 240, 60, 180]

describe('buildMdChart categorical — hue rotation (ADR-0024)', () => {
  it('rotates the 5 series by the documented triadic + split-complementary offsets', () => {
    const hcts = categoricalChart('#0061a4', 'light')
    const base = hcts[0].hue
    for (let i = 0; i < EXPECTED_OFFSETS.length; i++) {
      expectNear(hueDelta(hcts[i].hue, base), EXPECTED_OFFSETS[i] as number)
    }
  })

  it('emits a saturated series (variant-bypassed fixed chroma, not tonal-spotted)', () => {
    // why: categorical fixes chroma at 50 so hue is the only separation axis;
    // a near-grey series would mean the fixed-chroma synthesis regressed.
    for (const hct of categoricalChart('#0061a4', 'light')) {
      expect(hct.chroma).toBeGreaterThan(20)
    }
  })

  it('places the series at the per-mode tone (light 45, dark 65)', () => {
    for (const hct of categoricalChart('#0061a4', 'light')) {
      expectNear(hct.tone, 45)
    }
    for (const hct of categoricalChart('#0061a4', 'dark')) {
      expectNear(hct.tone, 65)
    }
  })
})

describe('buildMdChart categorical — achromatic fallback', () => {
  it('drives a grey seed (chroma < 5) to a colourful series anchored at hue 270', () => {
    // why: a grey seed has no usable hue; build.ts substitutes fallback hue
    // 270 so the chart series is still colourful (matches shadcn default
    // character). The contract is behavioural: grey in, colourful out.
    const hcts = categoricalChart('#808080', 'light')
    for (const hct of hcts) {
      expect(hct.chroma).toBeGreaterThan(20)
    }
    // chart-1 carries the fallback base hue (offset 0).
    expectNear(hcts[0].hue, 270)
    // and the triadic structure still holds off the fallback base.
    expectNear(hueDelta(hcts[1].hue, hcts[0].hue), 120)
  })
})

describe('rebrandChart', () => {
  it('maps each md chart token to its positionally-matched shadcn name', () => {
    const md = Object.fromEntries(MD_CHART_TOKEN_NAMES.map((name, i) => [name, 0x100 + i]))
    const out = rebrandChart(md)
    SHADCN_CHART_TOKEN_NAMES.forEach((shadcnName, i) => {
      expect(out[shadcnName]).toBe(0x100 + i)
    })
    expect(Object.keys(out)).toEqual([...SHADCN_CHART_TOKEN_NAMES])
  })

  it('throws when an md chart token is missing (mis-wired upstream)', () => {
    expect(() => rebrandChart({})).toThrow(/missing md chart token/)
  })
})

describe('applyShadcnChartOverrides', () => {
  const base = Object.fromEntries(SHADCN_CHART_TOKEN_NAMES.map((name, i) => [name, 0x200 + i]))

  it('returns a byte-identical map when the override set is empty (drift-guard baseline)', () => {
    // why: derive.ts relies on the empty-override path being structurally
    // equal to its input so the no-override DOM output stays bit-stable.
    expect(applyShadcnChartOverrides(base, {})).toEqual(base)
  })

  it('replaces only the overridden token with argbFromHex of the pin', () => {
    const out = applyShadcnChartOverrides(base, { '--chart-2': '#ff0000' })
    expect(out['--chart-2']).toBe(0xffff0000)
    // every other token is untouched.
    for (const name of SHADCN_CHART_TOKEN_NAMES) {
      if (name !== '--chart-2') expect(out[name]).toBe(base[name])
    }
  })
})
