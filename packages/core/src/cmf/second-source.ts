import type { PortableTheme } from '../theme/schema'

// why: single source of truth for "is the cmfSecondSourceHex field valid
// given the rest of the source?" Mirrors palette-override/disabled-reason.ts
// — engine consults it to skip applying when disabled, setter consults it to
// no-op disabled writes, UI consults it to disable the input + render the
// returned string as a tooltip.
//
// Returns null when the field is valid, or a human-readable reason string
// explaining why it's disabled. Phrase the string as a sentence the user
// reads at the moment of constraint violation.
//
// Adding a rule: add a new conditional branch with the reason string. Tests
// in second-source.test.ts cover every rule. The selector stays pure
// (no I/O, no closures) so callers can invoke it freely during render.
export function cmfSecondSourceDisabledReason(source: PortableTheme): string | null {
  // why: SchemeCmf is the only MCU variant that reads sourceColorHcts[1].
  // Passing a second hct to any other strategy's `build` is a no-op — they
  // ignore the param. Disabling rather than silently ignoring prevents the
  // "I set it but nothing changed" UX surprise when the user is on a
  // non-cmf variant; the UI flips the input back on the moment they switch
  // to cmf (the value persists across variant flips by design — engine and
  // setter both use this selector).
  if (source.variant !== 'cmf') {
    return 'Second source color is only used by the CMF variant. Switch to CMF to enable.'
  }
  return null
}
