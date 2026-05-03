import { type DynamicScheme, type Hct, SchemeCmf, Variant } from '@tonex/mcu'

// why: this file is THE template for the variants registry. Subsequent variants
// (mcu-2025.ts and any future additions) match this shape: a frozen object with
// { name, mcuVariant, build(...) }. The interface lives here, not in a shared
// types.ts, until a second variant proves it should be extracted.

export interface VariantStrategy {
  /** Stable lowercase name. Used in source.variant and registry lookup. */
  readonly name: string
  /** MCU enum value. derive.ts uses this when an MCU API needs the enum. */
  readonly mcuVariant: Variant
  /** Build a DynamicScheme from seed hct + mode + contrast. */
  build(seedHct: Hct, isDark: boolean, contrastLevel: number): DynamicScheme
}

export const cmf: VariantStrategy = {
  name: 'cmf',
  mcuVariant: Variant.CMF,
  build(seedHct, isDark, contrastLevel) {
    // why: SchemeCmf accepts Hct | Hct[]. cmfSecondSourceHex (the second-source
    // feature) is a flat source field added in a later slice. Until then,
    // single-source matches MCU's documented fallback (second = first).
    return new SchemeCmf(seedHct, isDark, contrastLevel)
  },
}
