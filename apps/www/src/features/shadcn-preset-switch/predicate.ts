import { findActivePreset, type PortableTheme } from '@tonex/core/schema'

// why: "dirty" for preset-switch confirmation = theme has drifted off every
// shipped preset on any of the six fields setShadcnPreset overwrites (variant
// + surfaceAlgo + surfacePaletteName + surfaceTintLevel + surfaceDesaturateLevel
// + shadcnRoleBindings). Wraps findActivePreset's null sentinel into a named
// predicate so the confirm-gate reads as intent rather than as a structural
// quirk, and so the rule has one read site if the bundle definition ever
// shifts. Hex overrides (shadcnRoleOverrides etc.) are orthogonal per ADR-0026
// and stay invisible to this predicate by construction — findActivePreset only
// reads the bundle fields.
export function isPresetSwitchDirty(theme: PortableTheme): boolean {
  return findActivePreset(theme) === null
}
