// why: outline-variant on surface is decorative per M3 spec — purely
// visual dividers, exempt from WCAG 1.4.11. Excluded from pass/fail
// tallies so a correctly-implemented theme doesn't read as broken.
const DECORATIVE_PAIRS = new Set(['--color-outline-variant|--color-surface'])

export function isDecorative(pair: { fg: string; bg: string }): boolean {
  return DECORATIVE_PAIRS.has(`${pair.fg}|${pair.bg}`)
}
