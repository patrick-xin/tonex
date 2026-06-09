import type { PairResult } from '@tonex/core'
import { isDecorative } from '@tonex/core/audit'
import { hexString } from '@tonex/core/oklch'

// why: unified data shape for every shadcn contrast warning surface (rails,
// color-roles, role override list, popover editors). Sourced from a PairResult
// via toContrastWarning so the four surfaces show identical fields — partner +
// hex + ratio + threshold + intent + pass/decorative state. Previously each
// surface invented its own subset (ContrastBadgeData carried threshold but no
// intent; ColorTileWarning carried neither — hence color-tile's hardcoded
// "needs 4.5:1" lie on non-text pairs). Future remediation/suggestion engine
// reads the same shape — one warning, many renderers.
export interface ContrastWarning {
  partner: string
  partnerHex: string
  ratio: number
  threshold: number
  intent: 'text' | 'non-text'
  passes: boolean
  decorative: boolean
}

// why: `role` flips the perspective when the caller's role is the pair's bg
// (popover editor hooks find a pair where either slot may hold the role —
// `--background` as the role being edited would mean the partner is the fg).
// Omitting `role` is the rail/page case where iteration is keyed by fg and
// the partner is always bg. Decorative is computed via the canonical
// isDecorative predicate so callers can't drift from the WCAG carve-out.
export function toContrastWarning(p: PairResult, role?: string): ContrastWarning {
  const roleIsFg = role === undefined || p.pair.fg === role
  return {
    partner: roleIsFg ? p.pair.bg : p.pair.fg,
    partnerHex: hexString(roleIsFg ? p.bgArgb : p.fgArgb),
    ratio: p.ratio,
    threshold: p.pair.threshold,
    intent: p.pair.intent,
    passes: p.passes,
    decorative: isDecorative(p.pair),
  }
}
