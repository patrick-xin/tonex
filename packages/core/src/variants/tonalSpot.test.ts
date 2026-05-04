import { argbFromHex, Hct, Variant } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { tonalSpot } from './tonalSpot'

const SEED = Hct.fromInt(argbFromHex('#6750a4'))

describe('tonalSpot variant strategy', () => {
  it('declares its identity', () => {
    expect(tonalSpot.name).toBe('tonalSpot')
    expect(tonalSpot.mcuVariant).toBe(Variant.TONAL_SPOT)
  })

  it('builds a light DynamicScheme', () => {
    const scheme = tonalSpot.build(SEED, false, 0)
    expect(scheme.variant).toBe(Variant.TONAL_SPOT)
    expect(scheme.isDark).toBe(false)
    expect(scheme.contrastLevel).toBe(0)
  })

  it('builds a dark DynamicScheme', () => {
    const scheme = tonalSpot.build(SEED, true, 0)
    expect(scheme.isDark).toBe(true)
  })

  it('honors contrast level', () => {
    const scheme = tonalSpot.build(SEED, false, 0.5)
    expect(scheme.contrastLevel).toBe(0.5)
  })
})
