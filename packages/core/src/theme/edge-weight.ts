import { type MdTokenName, SHADCN_EDGE_ROLES, type ShadcnRoleBindings } from './schema'

// why: the two ends of the edge-weight sub-axis (SHADCN_EDGE_ROLES) — M3's
// hairline edge (--color-outline-variant, "soft") vs M3's primary edge
// (--color-outline, "hard", the project default). Core owns these so the
// ambient preset-apply rule and the www soft-border toggle share one definition
// instead of each hard-coding the token strings.
export const SOFT_EDGE_TOKEN: MdTokenName = '--color-outline-variant'
export const HARD_EDGE_TOKEN: MdTokenName = '--color-outline'

type EdgePair = { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }

// why: "soft edge weight" is the all-or-nothing state in which every edge role
// maps to the soft token in BOTH modes — the same rule the www soft-border
// toggle reads as "on". Any asymmetry (one mode soft, one hard; a single edge
// drifted; an off-outline custom edge) reads as not-soft, because soft-border is
// a single global stylistic choice, not a per-mode/per-role one.
export function isSoftEdgeWeight(bindings: EdgePair): boolean {
  for (const role of SHADCN_EDGE_ROLES) {
    if (bindings.light[role] !== SOFT_EDGE_TOKEN) return false
    if (bindings.dark[role] !== SOFT_EDGE_TOKEN) return false
  }
  return true
}

// why: re-assert the soft edge weight onto a bindings pair, returning a fresh
// pair (input untouched). Used by ambient preset-apply to carry a sticky
// soft-border across a switch: the three edge roles in both modes are forced to
// the soft token, every other role left exactly as the preset stamped it.
export function withSoftEdges(bindings: EdgePair): EdgePair {
  const next: EdgePair = { light: { ...bindings.light }, dark: { ...bindings.dark } }
  for (const role of SHADCN_EDGE_ROLES) {
    next.light[role] = SOFT_EDGE_TOKEN
    next.dark[role] = SOFT_EDGE_TOKEN
  }
  return next
}
