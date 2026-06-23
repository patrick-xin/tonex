import { describe, expect, it } from 'vitest'
import {
  CHART_PALETTE_DESCRIPTIONS,
  CHART_PALETTES,
  type ChartPalette,
  chartInputsToPalette,
  chartPaletteToInputs,
  isChartPalette,
} from './palette'
import { HUE_SPREAD_DEFAULT } from './schema'

describe('chart palette taxonomy', () => {
  it('forward map matches the www toggle constants', () => {
    expect(chartPaletteToInputs('single')).toEqual({ scheme: 'sequential', hueSpread: 0 })
    expect(chartPaletteToInputs('multi')).toEqual({
      scheme: 'sequential',
      hueSpread: HUE_SPREAD_DEFAULT,
    })
    expect(chartPaletteToInputs('polychrome')).toEqual({
      scheme: 'categorical',
      hueSpread: HUE_SPREAD_DEFAULT,
    })
  })

  it('inverse map lights the right label for the toggle / recipe', () => {
    expect(chartInputsToPalette({ scheme: 'sequential', hueSpread: 0 })).toBe('single')
    expect(chartInputsToPalette({ scheme: 'sequential', hueSpread: HUE_SPREAD_DEFAULT })).toBe(
      'multi',
    )
    // categorical ignores hueSpread — any value still reads polychrome
    expect(chartInputsToPalette({ scheme: 'categorical', hueSpread: 0 })).toBe('polychrome')
    expect(chartInputsToPalette({ scheme: 'categorical', hueSpread: 999 })).toBe('polychrome')
  })

  it('round-trips inputs→palette→inputs for every canonical palette', () => {
    for (const palette of CHART_PALETTES) {
      expect(chartInputsToPalette(chartPaletteToInputs(palette))).toBe(palette)
    }
  })

  it('isChartPalette accepts the picklist and rejects anything else', () => {
    for (const palette of CHART_PALETTES) expect(isChartPalette(palette)).toBe(true)
    expect(isChartPalette('sequential')).toBe(false)
    expect(isChartPalette('rainbow')).toBe(false)
    expect(isChartPalette('')).toBe(false)
  })

  it('every palette carries an intent description (the describe.chart contract)', () => {
    for (const palette of CHART_PALETTES) {
      expect(CHART_PALETTE_DESCRIPTIONS[palette as ChartPalette]).toBeTruthy()
    }
  })
})
