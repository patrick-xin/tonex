import { SchemeFruitSalad, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const fruitSalad: VariantStrategy = {
  name: 'fruitSalad',
  mcuVariant: Variant.FRUIT_SALAD,
  group: 'expressive',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeFruitSalad(seedHct, isDark, contrastLevel)
  },
}
