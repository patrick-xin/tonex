import { SchemeRainbow, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const rainbow: VariantStrategy = {
  name: 'rainbow',
  mcuVariant: Variant.RAINBOW,
  group: 'expressive',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeRainbow(seedHct, isDark, contrastLevel)
  },
}
