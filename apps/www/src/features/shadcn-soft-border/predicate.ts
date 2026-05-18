import type { ShadcnRoleBindings } from '@tonex/core/schema'

// why: "soft border on" is a derived predicate over the persisted bindings —
// not a separate boolean in PortableTheme. The three roles (--border, --input,
// --sidebar-border) being bound to outline-variant in BOTH modes IS the on
// state (single source of truth, no drift between toggle and binding).
// Asymmetric state (one mode soft, one hard; or sidebar-border out of sync
// with --border) reads as off — the switch surfaces a global stylistic choice,
// so any asymmetry returns "indeterminate / off" rather than green-checking on
// a half-applied state. ADR-0022 rule 5: composition of core data into a
// www-feature predicate, not a new core field.
export function isSoftBorderOn(bindings: {
  light: ShadcnRoleBindings
  dark: ShadcnRoleBindings
}): boolean {
  return (
    bindings.light['--border'] === '--color-outline-variant' &&
    bindings.light['--input'] === '--color-outline-variant' &&
    bindings.light['--sidebar-border'] === '--color-outline-variant' &&
    bindings.dark['--border'] === '--color-outline-variant' &&
    bindings.dark['--input'] === '--color-outline-variant' &&
    bindings.dark['--sidebar-border'] === '--color-outline-variant'
  )
}
