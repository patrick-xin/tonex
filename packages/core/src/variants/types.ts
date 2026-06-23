import type { DynamicScheme, Hct, Variant } from '@tonex/mcu'

/**
 * Bucket for picker UIs and docs. Lives on `VariantStrategy` so consumers
 * never need to re-derive the taxonomy themselves.
 *
 * - `cmf`: the 2025 spec scheme. Structurally distinct (extra roles, fixed
 *   colors), so it stands alone.
 * - `standard`: source-faithful schemes — produce a palette that stays close
 *   to the seed.
 * - `expressive`: high-chroma, playful schemes that intentionally diverge
 *   from the seed.
 * - `subdued`: low-chroma / near-grayscale schemes.
 */
export type VariantGroup = 'cmf' | 'standard' | 'expressive' | 'subdued'

export interface VariantStrategy {
  /** Stable lowercase name. Used in source.variant and registry lookup. */
  readonly name: string
  /** MCU enum value. derive.ts uses this when an MCU API needs the enum. */
  readonly mcuVariant: Variant
  /** Picker / docs grouping bucket. */
  readonly group: VariantGroup
  /**
   * Build a DynamicScheme from seed hct + mode + contrast. Optional
   * `secondHct` is the variant-specific extra source — currently only cmf
   * consumes it (drives `secondarySourceColorHct`, which reassigns the
   * tertiaryPalette and shifts the errorPalette hue). Other strategies
   * ignore it. derive.ts resolves `source.cmfSecondSourceHex` and threads
   * the hct here.
   */
  build(seedHct: Hct, isDark: boolean, contrastLevel: number, secondHct?: Hct): DynamicScheme
}
