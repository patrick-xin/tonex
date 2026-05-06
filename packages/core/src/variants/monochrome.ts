import { SchemeMonochrome, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const monochrome: VariantStrategy = {
  name: 'monochrome',
  mcuVariant: Variant.MONOCHROME,
  group: 'subdued',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeMonochrome(seedHct, isDark, contrastLevel)
  },
}
