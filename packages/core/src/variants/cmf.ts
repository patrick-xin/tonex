import { SchemeCmf, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const cmf: VariantStrategy = {
  name: 'cmf',
  mcuVariant: Variant.CMF,
  group: 'cmf',
  build(seedHct, isDark, contrastLevel) {
    // why: SchemeCmf accepts Hct | Hct[]. cmfSecondSourceHex (the second-source
    // feature) is a flat source field added in a later slice. Until then,
    // single-source matches MCU's documented fallback (second = first).
    return new SchemeCmf(seedHct, isDark, contrastLevel)
  },
}
