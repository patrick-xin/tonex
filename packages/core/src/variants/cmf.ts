import { SchemeCmf, Variant } from '@tonex/mcu'
import type { VariantStrategy } from './types'

export const cmf: VariantStrategy = {
  name: 'cmf',
  mcuVariant: Variant.CMF,
  group: 'cmf',
  build(seedHct, isDark, contrastLevel, secondHct) {
    // why: SchemeCmf overload accepts Hct | Hct[]. When secondHct is present,
    // pass [seed, second] — MCU's constructor takes the array, picks
    // `secondarySourceColorHct = extras[0] ?? seed`, and uses it to (a)
    // reassign the tertiaryPalette to one built from second.hue+chroma, and
    // (b) drive the errorPalette hue via getErrorHue(seed.hue, second.hue).
    // Falls back to single-source when secondHct is undefined; MCU itself
    // also falls back to second=seed if the array has length 1, but skipping
    // the array allocation keeps the no-second-source path byte-identical to
    // the pre-feature build.
    return secondHct === undefined
      ? new SchemeCmf(seedHct, isDark, contrastLevel)
      : new SchemeCmf([seedHct, secondHct], isDark, contrastLevel)
  },
}
