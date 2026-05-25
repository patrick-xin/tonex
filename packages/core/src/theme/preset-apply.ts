import type { PortableTheme } from './schema'
import type { ShadcnPreset } from './shadcn-presets'

// why: per-field overrides the preset-apply dialog collects from its switches.
// A `true` adopts the preset's curated value even over a touched field; absent
// or `false` leaves the keep-if-touched default in force. Keyed only by the
// source fields a user can drift (seed, contrast) — recipe is never optional.
export type PresetAdoptChoices = { seed?: boolean; contrast?: boolean }

// why: ADR-0031 #2/#3 — the deep module of theme-preset apply. A pure function
// of (current theme, target preset) → the patch to apply, isolated from the
// store and UI so the per-field supersede/keep rule is exhaustively testable.
// The store's setShadcnPreset is a thin caller of this.
//
// Recipe fields (variant + surface treatment + role bindings) always overwrite
// — they ARE the preset's identity (findActivePreset compares exactly this set,
// see issue #108). Source fields resolve per-field against the recorded touched
// signal: an untouched, unlocked field adopts the preset's curated value; a
// touched or locked field keeps the user's value and drops the curated one.
//
// Critically the patch NEVER carries a touched signal: a curated value this
// resolver supplies must not count as a user choice (ADR-0031 #3, story 12), or
// a second preset switch would read the previous preset's color as the user's
// and stop superseding. Seed and contrast each resolve against their own
// touched signal, independently — the per-field point of ADR-0031 #3.
export function resolvePresetApply(
  theme: PortableTheme,
  preset: ShadcnPreset,
  choices: PresetAdoptChoices = {},
): Partial<PortableTheme> {
  const patch: Partial<PortableTheme> = {
    variant: preset.variant,
    surfaceAlgo: preset.surfaceAlgo,
    surfacePaletteName: preset.surfacePaletteName,
    surfaceTintLevel: { ...preset.surfaceTintLevel },
    surfaceTintTextLevel: { ...preset.surfaceTintTextLevel },
    surfaceDesaturateLevel: { ...preset.surfaceDesaturateLevel },
    shadcnRoleBindings: {
      light: { ...preset.shadcnRoleBindings.light },
      dark: { ...preset.shadcnRoleBindings.dark },
    },
  }

  // why: a locked seed means "do not move this" (CONTEXT: Lock), so lock keeps
  // the user's seed regardless of the touched signal or any dialog choice.
  // Otherwise the curated seed supersedes an untouched seed automatically, or a
  // touched one when the dialog's "Use {preset}'s" switch opted in — in which
  // case we also clear the signal so the adopted seed reads as curated, not a
  // user choice, on the next switch (ADR-0031 #3, story 12).
  if (!theme.seedHexLock) {
    if (!theme.seedTouched) {
      patch.seed = { ...preset.seed }
    } else if (choices.seed) {
      patch.seed = { ...preset.seed }
      patch.seedTouched = false
    }
  }

  // why: contrast resolves independently of the seed (ADR-0031 #3) — the whole
  // point is per-field honoring. Same two-tier rule, minus the lock: contrast
  // has none, so the touched signal and the dialog choice are the only gates.
  // The preset's curated contrast is a per-mode pair; adopting it lands BOTH
  // modes at once — still one decision, matching contrastTouched staying a
  // single boolean (#123 Decision B's touched granularity stands).
  if (!theme.contrastTouched) {
    patch.contrastLevel = { ...preset.contrastLevel }
  } else if (choices.contrast) {
    patch.contrastLevel = { ...preset.contrastLevel }
    patch.contrastTouched = false
  }

  return patch
}
