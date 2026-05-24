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

// why: the preset-apply dialog now serves two jobs — confirm a destructive
// recipe replacement (isPresetSwitchDirty) AND collect the per-field "keep mine
// vs use preset's" choice for any touched source input. So it must open on
// either: a drifted recipe, or a touched-and-unlocked seed / touched contrast
// whose switch needs showing. A locked seed is kept by the resolver no matter
// what, so it raises no decision on its own. Nothing dirty + nothing touched →
// the call site applies straight through, no dialog hop.
export function presetSwitchNeedsDialog(theme: PortableTheme): boolean {
  return (
    isPresetSwitchDirty(theme) || (theme.seedTouched && !theme.seedHexLock) || theme.contrastTouched
  )
}
