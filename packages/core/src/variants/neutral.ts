import { SchemeNeutral, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const neutral: VariantStrategy = {
  name: 'neutral',
  mcuVariant: Variant.NEUTRAL,
  group: 'subdued',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeNeutral(seedHct, isDark, contrastLevel)
  },
}
