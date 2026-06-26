import type { NeutralPaletteName } from '@tonex/core/data'
import {
  DEFAULT_INPUTS,
  type PortableTheme,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  type ShadcnRoleName,
  type SurfaceAlgo,
} from '@tonex/core/schema'
import type { VariantName } from '@tonex/core/variants'

// why: PresetBundle mirrors the engineering-slice contract from issue #36.
// Pure data — no actions, no IDs. variant + surface fields + bindings only;
// per ADR-0026 overrides are NOT in the bundle.
export interface PresetBundle {
  variant: VariantName
  surfaceAlgo: SurfaceAlgo
  surfacePaletteName: { light: NeutralPaletteName; dark: NeutralPaletteName }
  surfaceTintLevel: { light: number; dark: number }
  surfaceTintTextLevel: { light: number; dark: number }
  surfaceDesaturateLevel: { light: number; dark: number }
  shadcnRoleBindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }
}

export interface BundleDiff {
  variantChanged: boolean
  surfaceAlgoChanged: boolean
  surfacePaletteName: { light: boolean; dark: boolean }
  surfaceTintLevel: { light: boolean; dark: boolean }
  surfaceTintTextLevel: { light: boolean; dark: boolean }
  surfaceDesaturateLevel: { light: boolean; dark: boolean }
  bindings: { light: ShadcnRoleName[]; dark: ShadcnRoleName[] }
  totalChanges: number
}

export function snapshotBundle(source: PortableTheme): PresetBundle {
  return {
    variant: source.variant,
    surfaceAlgo: source.surfaceAlgo,
    surfacePaletteName: { ...source.surfacePaletteName },
    surfaceTintLevel: { ...source.surfaceTintLevel },
    surfaceTintTextLevel: { ...source.surfaceTintTextLevel },
    surfaceDesaturateLevel: { ...source.surfaceDesaturateLevel },
    shadcnRoleBindings: {
      light: { ...source.shadcnRoleBindings.light },
      dark: { ...source.shadcnRoleBindings.dark },
    },
  }
}

// why: baseline is the engineering-slice "reference preset" — what the user
// is diffing against to see what they've changed for this preset.
// DEFAULT_INPUTS is the natural baseline because the user resets to it
// between presets per the curator workflow.
export const DEFAULT_BUNDLE: PresetBundle = snapshotBundle(DEFAULT_INPUTS)

export function diffBindings(
  current: ShadcnRoleBindings,
  baseline: ShadcnRoleBindings,
): ShadcnRoleName[] {
  const changed: ShadcnRoleName[] = []
  for (const role of SHADCN_ROLE_NAMES) {
    if (current[role] !== baseline[role]) changed.push(role)
  }
  return changed
}

export function diffBundle(bundle: PresetBundle, baseline: PresetBundle): BundleDiff {
  const lightBindings = diffBindings(
    bundle.shadcnRoleBindings.light,
    baseline.shadcnRoleBindings.light,
  )
  const darkBindings = diffBindings(
    bundle.shadcnRoleBindings.dark,
    baseline.shadcnRoleBindings.dark,
  )
  const variantChanged = bundle.variant !== baseline.variant
  const surfaceAlgoChanged = bundle.surfaceAlgo !== baseline.surfaceAlgo
  const paletteLight = bundle.surfacePaletteName.light !== baseline.surfacePaletteName.light
  const paletteDark = bundle.surfacePaletteName.dark !== baseline.surfacePaletteName.dark
  const tintLight = bundle.surfaceTintLevel.light !== baseline.surfaceTintLevel.light
  const tintDark = bundle.surfaceTintLevel.dark !== baseline.surfaceTintLevel.dark
  const textTintLight = bundle.surfaceTintTextLevel.light !== baseline.surfaceTintTextLevel.light
  const textTintDark = bundle.surfaceTintTextLevel.dark !== baseline.surfaceTintTextLevel.dark
  const desatLight = bundle.surfaceDesaturateLevel.light !== baseline.surfaceDesaturateLevel.light
  const desatDark = bundle.surfaceDesaturateLevel.dark !== baseline.surfaceDesaturateLevel.dark

  const totalChanges =
    (variantChanged ? 1 : 0) +
    (surfaceAlgoChanged ? 1 : 0) +
    (paletteLight ? 1 : 0) +
    (paletteDark ? 1 : 0) +
    (tintLight ? 1 : 0) +
    (tintDark ? 1 : 0) +
    (textTintLight ? 1 : 0) +
    (textTintDark ? 1 : 0) +
    (desatLight ? 1 : 0) +
    (desatDark ? 1 : 0) +
    lightBindings.length +
    darkBindings.length

  return {
    variantChanged,
    surfaceAlgoChanged,
    surfacePaletteName: { light: paletteLight, dark: paletteDark },
    surfaceTintLevel: { light: tintLight, dark: tintDark },
    surfaceTintTextLevel: { light: textTintLight, dark: textTintDark },
    surfaceDesaturateLevel: { light: desatLight, dark: desatDark },
    bindings: { light: lightBindings, dark: darkBindings },
    totalChanges,
  }
}
