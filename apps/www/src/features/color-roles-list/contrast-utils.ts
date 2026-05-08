import type { MdTokenName } from '@tonex/core/schema'

// why: lives in the feature, not core — engine already enforces contrast via
// MCU's contrastLevel and tone curves. This sweep only fires after a user
// override drops AA against its MD3 partner, surfacing that user choice.
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const ch = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

export function contrastRatio(fg: string, bg: string): number {
  const a = relativeLuminance(fg)
  const b = relativeLuminance(bg)
  const [hi, lo] = a >= b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

export function isDarkSwatch(hex: string): boolean {
  return relativeLuminance(hex) < 0.5
}

export const AA_THRESHOLD = 4.5

// why: on-surface-variant pairs against surface (not surface-variant) because
// MD3 paints it on surface chips/dividers — the actual rendered background.
export const ROLE_CONTRAST_PAIRS: ReadonlyArray<readonly [MdTokenName, MdTokenName]> = [
  ['--color-on-primary', '--color-primary'],
  ['--color-on-primary-container', '--color-primary-container'],
  ['--color-on-secondary', '--color-secondary'],
  ['--color-on-secondary-container', '--color-secondary-container'],
  ['--color-on-tertiary', '--color-tertiary'],
  ['--color-on-tertiary-container', '--color-tertiary-container'],
  ['--color-on-error', '--color-error'],
  ['--color-on-error-container', '--color-error-container'],
  ['--color-on-surface', '--color-surface'],
  ['--color-on-surface-variant', '--color-surface'],
  ['--color-on-primary-fixed', '--color-primary-fixed'],
  ['--color-on-primary-fixed-variant', '--color-primary-fixed'],
  ['--color-on-secondary-fixed', '--color-secondary-fixed'],
  ['--color-on-secondary-fixed-variant', '--color-secondary-fixed'],
  ['--color-on-tertiary-fixed', '--color-tertiary-fixed'],
  ['--color-on-tertiary-fixed-variant', '--color-tertiary-fixed'],
  ['--color-inverse-on-surface', '--color-inverse-surface'],
  ['--color-inverse-primary', '--color-inverse-surface'],
]

export function roleDisplayName(role: MdTokenName): string {
  return role.slice('--color-'.length)
}
