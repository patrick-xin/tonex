import { isDecorative } from './decorative'
import type { DualIntentTier } from './dual-intent'
import type { EvaluatedPair } from './types'

// why: the result/severity axis is THE source of truth for the audit — the
// status badge, legend chip, summary tally, and result filter all map from
// these four values, so none can drift into its own vocabulary (the bug issue
// #1 exposed). The values are semantic, NOT presentational: 'fail'/'warn' name
// the severity, while the human label ("Hard to read"/"Faint") is data hanging
// off them — change the copy and no logic moves. pass = clears the bar, fail =
// text too faint (must fix), warn = a UI/non-text judgment call, none =
// decorative/exempt.
export type Result = 'pass' | 'fail' | 'warn' | 'none'

export interface ResultMeta {
  /** badge + legend label */
  label: string
  /** one-line plain-language explanation (legend tooltip) */
  note: string
  /** text + bg classes for the pill badge */
  badgeClass: string
  /** legend dot classes */
  dotClass: string
}

// why: pass/warn render through the INTERNAL tnx semantic tokens (success /
// warning) as MD base/on pairs — `bg-tnx-X text-on-tnx-X`, mirroring fail's
// `bg-error text-on-error`. No dark: needed: each tnx token mode-switches its
// own value (light = vivid base, dark = muted container shade) WITHIN its role,
// so the base/on pairing stays correct in both modes. fail rides the seed error
// role, swapping base→container in dark for a softer badge; none stays neutral.
export const RESULT: Record<Result, ResultMeta> = {
  pass: {
    label: 'Pass',
    note: 'readable, good contrast',
    badgeClass: 'text-on-tnx-success bg-tnx-success',
    dotClass: 'bg-tnx-success dark:bg-on-tnx-success',
  },
  fail: {
    label: 'Hard to read',
    note: 'text is too faint against its background',
    badgeClass: 'text-on-error-container bg-error-container',
    dotClass: 'bg-error-container dark:bg-error',
  },
  warn: {
    label: 'Faint',
    note: 'a border, icon, or fill is low-contrast; fine for some uses',
    badgeClass: 'text-on-tnx-warning bg-tnx-warning',
    dotClass: 'bg-tnx-warning',
  },
  none: {
    label: 'Decorative',
    note: 'purely visual, no contrast needed',
    badgeClass: 'bg-surface-container-highest text-on-surface-variant',
    dotClass: 'bg-surface-container ring ring-outline-variant/60',
  },
}

// why: legend + tally reading order — reassurance first (pass), then severity-
// descending (fail → warn), then the exempt carve-out trailing.
export const RESULT_ORDER: readonly Result[] = ['pass', 'fail', 'warn', 'none']

// why: the single classification point — resolves a pair's evaluation into one
// result. Decorative short-circuits (no WCAG requirement); then pass; then a
// fail splits by role — failing text is 'fail' (red, must fix), failing
// non-text is 'warn' (amber, judgment call). Mirrors summarizeContrast's
// textFail/uiFail split so the tally and the row badges always agree.
export function resultOf(p: EvaluatedPair): Result {
  if (isDecorative(p.pair)) return 'none'
  if (p.effectivePasses) return 'pass'
  return p.pair.intent === 'text' ? 'fail' : 'warn'
}

// why: maps the collapsed --destructive tier onto a result so its badge colour
// matches the rest of the table. 'fills-only' is the amber 'warn' band — though
// the row keeps the more specific "Fills only" wording (see TIER_LABEL). 'fail'
// clears neither bar, so as text it's a hard-to-read 'fail'.
export function tierResult(tier: DualIntentTier): Result {
  return tier === 'pass' ? 'pass' : tier === 'fills-only' ? 'warn' : 'fail'
}
