import { SchemeVibrant, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const vibrant: VariantStrategy = {
  name: 'vibrant',
  mcuVariant: Variant.VIBRANT,
  group: 'expressive',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeVibrant(seedHct, isDark, contrastLevel)
  },
}
