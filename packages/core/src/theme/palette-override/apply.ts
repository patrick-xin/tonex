import {
  argbFromHex,
  type DynamicScheme,
  type TonalPalette,
  TonalPalette as TonalPaletteClass,
} from '@tonex/mcu'
import { PALETTE_FAMILIES, type PortableTheme } from '../schema'
import { paletteOverrideDisabledReason } from './disabled-reason'

// why: MCU's DynamicScheme exposes its six tonal palettes as fields
// (primaryPalette, secondaryPalette, tertiaryPalette, neutralPalette,
// neutralVariantPalette, errorPalette). TypeScript marks them readonly;
// at runtime they're plain properties. Replacing the field swaps the
// upstream tone source without touching MCU's variant-specific tone
// choices — primary at tone 40 (light) / 80 (dark) for tonalSpot stays
// at those tones, just sourced from the override palette. This is the
// architectural reason post-construction mutation works: variants pick
// tones, palettes provide them; we're swapping the provider.
type MutableScheme = {
  primaryPalette: TonalPalette
  secondaryPalette: TonalPalette
  tertiaryPalette: TonalPalette
  neutralPalette: TonalPalette
  neutralVariantPalette: TonalPalette
  errorPalette: TonalPalette
}

// why: applies paletteOverrides in place to BOTH light + dark schemes. Same
// palette object replaces both — the palette is a tone ramp, the scheme
// picks tones from it per mode. Mutates rather than constructing a new
// scheme because MCU's Scheme* subclasses bake palette construction into
// their constructors; subclassing each one to inject overrides would
// duplicate ten constructor signatures. Mutation is cheap, validated by
// MCU not touching its own palette fields after construction.
//
// Disabled overrides are skipped via paletteOverrideDisabledReason — engine
// and UI both consult that selector so the disable rule lives in one
// place. Ordering note: this runs BEFORE buildMdLayer in deriveTheme, so
// every md token derived from MCU sees the overridden palette. Token
// overrides (md3TokenOverrides) still run AFTER buildMdLayer and beat
// palette overrides per-token — the broader regen loses to the surgical
// pin, by design.
export function applyPaletteOverrides(
  light: DynamicScheme,
  dark: DynamicScheme,
  source: PortableTheme,
): void {
  for (const { paletteName, schemeField } of PALETTE_FAMILIES) {
    const hex = source.paletteOverrides[paletteName]
    if (hex === undefined) continue
    if (paletteOverrideDisabledReason(paletteName, source) !== null) continue
    const tonalPalette = TonalPaletteClass.fromInt(argbFromHex(hex))
    const field = schemeField as keyof MutableScheme
    ;(light as unknown as MutableScheme)[field] = tonalPalette
    ;(dark as unknown as MutableScheme)[field] = tonalPalette
  }
}
