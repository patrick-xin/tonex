import { useSource } from '@tonex/core'
import type { MdTokenName } from '@tonex/core/schema'
import { isSoftBorderOn } from './predicate'

// why: which md token each state binds to. Soft = outline-variant (M3's
// hairline edge); hard = outline (M3's primary edge, the project default).
// Symmetric across modes — the switch is a global stylistic choice; per-mode
// soft-border would force the user to think about edge weight as a mode-axis
// concept, which it isn't.
const SOFT_TOKEN: MdTokenName = '--color-outline-variant'
const HARD_TOKEN: MdTokenName = '--color-outline'

// why: imperative composer over the existing setShadcnRoleBinding action — no
// new core action, no new schema field. Four writes (border/input × light/
// dark) collapse to one user-visible toggle. Calling setSoftBorder(false) does
// NOT remember whatever exotic value the user might have had on --border
// before flipping the switch on; "off" deterministically restores the project
// default (--color-outline). That trade-off is documented at the call site
// because the alternative (storing prior values somewhere) would split state
// between www-local memory and the persisted source store, and exports
// wouldn't reflect it. Stylistic switches favor determinism over fidelity.
export function setSoftBorder(enabled: boolean): void {
  const target = enabled ? SOFT_TOKEN : HARD_TOKEN
  const { setShadcnRoleBinding } = useSource.getState().actions
  setShadcnRoleBinding('light', '--border', target)
  setShadcnRoleBinding('light', '--input', target)
  setShadcnRoleBinding('dark', '--border', target)
  setShadcnRoleBinding('dark', '--input', target)
}

// why: thin React hook — subscribes the consumer to the binding shape so the
// switch's checked state stays reactive without each consumer wiring its own
// useSource selector + isSoftBorderOn call. Returning the predicate here
// (instead of just exposing it) is the point: one hook, one source of truth
// for "is the switch on right now."
export function useSoftBorder(): { enabled: boolean; setEnabled: (next: boolean) => void } {
  const enabled = useSource((s) => isSoftBorderOn(s.shadcnRoleBindings))
  return { enabled, setEnabled: setSoftBorder }
}
