import { argbFromHex, hexFromArgb, customColor as mdCustomColor } from '@tonex/mcu'

// why: preview helper for the create/edit dialogs. Mirrors the customColor()
// call deriveTheme makes internally (derive.ts:154) but returns hex strings
// instead of feeding the result into the md/shadcn pipeline. www can render
// the 4-role swatch without depending on @tonex/mcu — MCU stays internal to
// core, which keeps the layer rule (www → core; core → mcu) intact.
//
// blend mirrors CustomColorEntry.blend semantics (harmonize toward seedHex).
// Tones are MCU's choice — we don't override them; this is a *preview*, so
// users see exactly what deriveTheme will emit on commit.
export interface CustomColorPreviewRoles {
  color: string
  onColor: string
  colorContainer: string
  onColorContainer: string
}

export interface CustomColorPreview {
  light: CustomColorPreviewRoles
  dark: CustomColorPreviewRoles
}

export function previewCustomColor(
  seedHex: string,
  entry: { hex: string; blend: boolean },
): CustomColorPreview {
  const group = mdCustomColor(argbFromHex(seedHex), {
    value: argbFromHex(entry.hex),
    name: 'preview',
    blend: entry.blend,
  })
  return {
    light: {
      color: hexFromArgb(group.light.color),
      onColor: hexFromArgb(group.light.onColor),
      colorContainer: hexFromArgb(group.light.colorContainer),
      onColorContainer: hexFromArgb(group.light.onColorContainer),
    },
    dark: {
      color: hexFromArgb(group.dark.color),
      onColor: hexFromArgb(group.dark.onColor),
      colorContainer: hexFromArgb(group.dark.colorContainer),
      onColorContainer: hexFromArgb(group.dark.onColorContainer),
    },
  }
}
