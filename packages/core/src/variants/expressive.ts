import { SchemeExpressive, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const expressive: VariantStrategy = {
  name: 'expressive',
  mcuVariant: Variant.EXPRESSIVE,
  group: 'expressive',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeExpressive(seedHct, isDark, contrastLevel)
  },
}
