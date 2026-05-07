import type { PaletteName, PortableTheme } from '../schema'

// why: single source of truth for "is this palette override valid given the
// rest of the source?" Engine consults it to skip applying disabled
// overrides; setter consults it to no-op disabled writes; UI consults it
// to disable the input + render the returned string as a tooltip.
//
// Returns null when the override is valid, or a human-readable reason
// string explaining why it's disabled. The string is the UI tooltip text
// — phrase it as a sentence the user reads at the moment of constraint
// violation, not a postmortem.
//
// Adding a rule: add a new conditional branch with the reason string.
// Tests in disabled-reason.test.ts cover every rule. The selector stays
// pure (no I/O, no closures) so callers can invoke it freely during
// render without subscription concerns.
export function paletteOverrideDisabledReason(
  palette: PaletteName,
  source: PortableTheme,
): string | null {
  // why: CMF builds tertiary from a second-source HCT (sourceColorHcts[1]);
  // overriding tertiaryPalette would only half-apply because the spec reads
  // tone from the second source independently of the palette field.
  // Disable rather than half-apply — the user's hex would silently fail to
  // drive the family.
  if (palette === 'tertiary' && source.variant === 'cmf') {
    return 'Tertiary is driven by the CMF second-source picker. Change variant to enable this override.'
  }
  return null
}
