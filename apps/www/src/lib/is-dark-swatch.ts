import { argbFromHex, relativeLuminance } from '@tonex/core/oklch'

export function isDarkSwatch(hex: string): boolean {
  return relativeLuminance(argbFromHex(hex)) < 0.5
}
