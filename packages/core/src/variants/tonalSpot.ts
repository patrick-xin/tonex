import { type DynamicScheme, type Hct, SchemeTonalSpot, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './cmf'

// why: second registry entry forces the dispatch path to be real lookup-by-name
// rather than a hardcoded `cmf`. Shape matches cmf.ts verbatim — VariantStrategy
// stays in cmf.ts until a third variant proves it should move to a shared
// types.ts.

export const tonalSpot: VariantStrategy = {
  name: 'tonalSpot',
  mcuVariant: Variant.TONAL_SPOT,
  build(seedHct, isDark, contrastLevel): DynamicScheme {
    return new SchemeTonalSpot(seedHct, isDark, contrastLevel)
  },
}
