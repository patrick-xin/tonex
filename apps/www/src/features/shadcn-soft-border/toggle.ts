import type { MdTokenName } from '@tonex/core/schema'
import { useSource } from '@tonex/core-react'
import { isSoftBorderOn } from './predicate'

// why: which md token each state binds to. Soft = outline-variant (M3's
// hairline edge); hard = outline (M3's primary edge, the project default).
// Symmetric across modes — the switch is a global stylistic choice; per-mode
// soft-border would force the user to think about edge weight as a mode-axis
// concept, which it isn't.
const SOFT_TOKEN: MdTokenName = '--color-outline-variant'
const HARD_TOKEN: MdTokenName = '--color-outline'

// why: imperative composer over the existing setShadcnRoleBinding action — no
// new core action, no new schema field. Six writes (border/input/sidebar-border
// × light/dark) collapse to one user-visible toggle. --sidebar-border rides
// along because the sidebar's hairline IS a border in the same visual class —
// leaving it on --color-outline while --border softens would create a louder
// edge on the sidebar than anywhere else, defeating the toggle's intent.
// Calling setSoftBorder(false) does NOT remember whatever exotic value the
// user might have had on --border before flipping the switch on; "off"
// deterministically restores the project default (--color-outline). That
// trade-off is documented at the call site because the alternative (storing
// prior values somewhere) would split state between www-local memory and the
// persisted source store, and exports wouldn't reflect it. Stylistic switches
// favor determinism over fidelity.
export function setSoftBorder(enabled: boolean): void {
  const target = enabled ? SOFT_TOKEN : HARD_TOKEN
  const { setShadcnRoleBinding } = useSource.getState().actions
  setShadcnRoleBinding('light', '--border', target)
  setShadcnRoleBinding('light', '--input', target)
  setShadcnRoleBinding('light', '--sidebar-border', target)
  setShadcnRoleBinding('dark', '--border', target)
  setShadcnRoleBinding('dark', '--input', target)
  setShadcnRoleBinding('dark', '--sidebar-border', target)
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
