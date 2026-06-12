// why: outline-variant is decorative per M3 spec — purely visual dividers,
// exempt from WCAG 1.4.11. The role itself is decorative (not the specific
// pair), so every outline-variant pair across the full surface ladder is
// exempt: base --color-surface plus each --color-surface-container variant
// the issue #47 sweep added. Excluded from pass/fail tallies so a correctly-
// implemented M3 theme doesn't read as broken. --color-outline (the load-
// bearing edge token) is NOT in this set — its pairs stay functional.
const DECORATIVE_PAIRS = new Set([
  '--color-outline-variant|--color-surface',
  '--color-outline-variant|--color-surface-container-lowest',
  '--color-outline-variant|--color-surface-container-low',
  '--color-outline-variant|--color-surface-container',
  '--color-outline-variant|--color-surface-container-high',
  '--color-outline-variant|--color-surface-container-highest',
])

export function isDecorative(pair: { fg: string; bg: string }): boolean {
  return DECORATIVE_PAIRS.has(`${pair.fg}|${pair.bg}`)
}
