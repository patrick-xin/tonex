import { SchemeTonalSpot, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const tonalSpot: VariantStrategy = {
  name: 'tonalSpot',
  mcuVariant: Variant.TONAL_SPOT,
  group: 'standard',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeTonalSpot(seedHct, isDark, contrastLevel)
  },
}
