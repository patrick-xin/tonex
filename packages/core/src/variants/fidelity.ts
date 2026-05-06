import { SchemeFidelity, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const fidelity: VariantStrategy = {
  name: 'fidelity',
  mcuVariant: Variant.FIDELITY,
  group: 'standard',
  build(seedHct, isDark, contrastLevel) {
    return new SchemeFidelity(seedHct, isDark, contrastLevel)
  },
}
