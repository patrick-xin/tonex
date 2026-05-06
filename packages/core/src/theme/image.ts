import { hexFromArgb, sourceColorFromImage } from '@tonex/mcu'

// why: domain primitive — extract a seed hex from a rendered image. MCU
// returns argb internally; this module is the only place argb appears in
// the seed-extraction pathway. Editor consumers go from
// `hexFromArgb(await sourceColorFromImage(img))` (argb leaks) to
// `await sourceColorHexFromImage(img)` (argb is invisible). The www→core
// boundary stops being a re-export of MCU primitives and becomes a real
// abstraction over them.
export async function sourceColorHexFromImage(image: HTMLImageElement): Promise<string> {
  const argb = await sourceColorFromImage(image)
  return hexFromArgb(argb)
}
