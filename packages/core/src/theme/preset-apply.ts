import type { PortableTheme } from './schema'
import type { ShadcnPreset } from './shadcn-presets'

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
// and stop superseding. Contrast joins seed as a resolved source field in a
// follow-on slice; today only the seed resolves here.
export function resolvePresetApply(
  theme: PortableTheme,
  preset: ShadcnPreset,
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
  // the user's seed regardless of the touched signal. Otherwise the curated
  // seed supersedes only an untouched seed — a touched one is the user's own.
  if (!theme.seedTouched && !theme.seedHexLock) {
    patch.seed = { ...preset.seed }
  }

  return patch
}
