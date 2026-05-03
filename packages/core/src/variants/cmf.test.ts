import { argbFromHex, Hct, Variant } from '@tonex/mcu'
import { describe, expect, it } from 'vitest'
import { cmf } from './cmf'

const SEED = Hct.fromInt(argbFromHex('#6750a4'))

describe('cmf variant strategy', () => {
  it('declares its identity', () => {
    expect(cmf.name).toBe('cmf')
    expect(cmf.mcuVariant).toBe(Variant.CMF)
  })

  it('builds a light DynamicScheme', () => {
    const scheme = cmf.build(SEED, false, 0)
    expect(scheme.variant).toBe(Variant.CMF)
    expect(scheme.isDark).toBe(false)
    expect(scheme.contrastLevel).toBe(0)
  })

  it('builds a dark DynamicScheme', () => {
    const scheme = cmf.build(SEED, true, 0)
    expect(scheme.isDark).toBe(true)
  })

  it('honors contrast level', () => {
    const scheme = cmf.build(SEED, false, 0.5)
    expect(scheme.contrastLevel).toBe(0.5)
  })
})
