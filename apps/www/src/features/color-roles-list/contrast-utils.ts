import { relativeLuminance } from '@tonex/color-utils'
import type { MdTokenName } from '@tonex/core/schema'
import { argbFromHex } from '@tonex/mcu'

// why: UI-only helpers per ADR-0025 commitment 5 — contrast math and pair
// definitions live in `@tonex/color-utils` / `@tonex/core/contrast`. This
// module keeps two presentation concerns: light-text-on-swatch decision and
// the kebab-strip display name.

export function isDarkSwatch(hex: string): boolean {
  return relativeLuminance(argbFromHex(hex)) < 0.5
}

export function roleDisplayName(role: MdTokenName): string {
  return role.slice('--color-'.length)
}
