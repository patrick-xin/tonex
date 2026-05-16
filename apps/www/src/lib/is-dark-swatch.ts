import { relativeLuminance } from '@tonex/color-utils'
import { argbFromHex } from '@tonex/mcu'

export function isDarkSwatch(hex: string): boolean {
  return relativeLuminance(argbFromHex(hex)) < 0.5
}
