import type { Result } from '@tonex/core/audit'
import type { DualIntentTier } from './dual-intent'

// why: the result/severity axis (Result + resultOf) is THE source of truth for
// the audit — now owned by the engine's `@tonex/core/audit` module and
// re-exported here so this feature's existing `./result` consumers don't churn.
// The values are semantic, NOT presentational: pass = clears the bar, fail =
// text too faint (must fix), warn = a UI/non-text judgment call, none =
// decorative/exempt. The presentation (labels, badge classes) lives below,
// app-side — change the copy and no engine logic moves.
export { type Result, resultOf } from '@tonex/core/audit'

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

// why: maps the collapsed --destructive tier onto a result so its badge colour
// matches the rest of the table. 'fills-only' is the amber 'warn' band — though
// the row keeps the more specific "Fills only" wording (see TIER_LABEL). 'fail'
// clears neither bar, so as text it's a hard-to-read 'fail'. Stays app-side
// because DualIntentTier is a www-only presentation concern (the --destructive
// dual-intent row collapse).
export function tierResult(tier: DualIntentTier): Result {
  return tier === 'pass' ? 'pass' : tier === 'fills-only' ? 'warn' : 'fail'
}
