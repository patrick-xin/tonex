import { SchemeContent, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const content: VariantStrategy = {
  name: 'content',
  mcuVariant: Variant.CONTENT,
  group: 'standard',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeContent(seedHct, isDark, contrastLevel)
  },
}
