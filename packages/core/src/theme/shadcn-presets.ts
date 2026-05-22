import type { VariantName } from '../variants'
import { hctFromHex } from './hct'
import {
  type PortableTheme,
  type Seed,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
  type SurfaceAlgo,
} from './schema'
import type { NeutralPaletteName } from './surface'

// why: ShadcnPreset is a theme bundle — the aesthetic recipe (variant +
// surface treatment + 26-role binding map for both modes) PLUS the curated
// source inputs it was tuned against (ADR-0031 #2). The recipe is the preset's
// identity (findActivePreset compares exactly the recipe fields, never the
// source inputs — ADR-0031 #5). The curated `seed` travels with the preset so
// "editor's choice" can deliver its color to a user who never picked one; it
// supersedes only an untouched seed at apply (resolvePresetApply). Per ADR-0026
// a preset still excludes `shadcnRoleOverrides` — overrides are user pins on
// top of the binding-resolved values and persist orthogonally. contrastLevel
// joins seed as a curated source input in a follow-on slice.
export interface ShadcnPreset {
  variant: VariantName
  surfaceAlgo: SurfaceAlgo
  surfacePaletteName: NeutralPaletteName
  surfaceTintLevel: { light: number; dark: number }
  surfaceTintTextLevel: { light: number; dark: number }
  surfaceDesaturateLevel: { light: number; dark: number }
  shadcnRoleBindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }
  // why: curated seed the preset was tuned against (ADR-0031 #2). Stored as the
  // canonical HCT decomposition with exactHex preserved so the hex display
  // reads back the curated bytes verbatim, exactly like a user paste (ADR-0028)
  // — built via `seedOf(hex)` below. Provisional per-preset values land with
  // the machinery (issue #109); final curation is the promotion slice.
  seed: Seed
}

// why: build a curated seed from a hex the same way DEFAULT_INPUTS does —
// canonical HCT axes plus the exact bytes — so a superseded seed reads back as
// if the user had pasted that hex. One helper keeps every curated seed on the
// identical construction path.
function seedOf(hex: string): Seed {
  return { ...hctFromHex(hex), exactHex: hex }
}

// why: durable shipping set — finalized 2026-05-13 in the issue #36 curation
// phase. Curator surface at apps/www/src/features/shadcn-preset-tuner/
// remains live post-launch as the editing path; this is the in-core mirror.
// Each entry is a structure-only recipe — no seed, no overrides — so all
// seven render against the user's own seed (or a curated demo seed on the
// landing surface). Asymmetric primary bindings (light=container,
// dark=primary) are intentional and identity-defining; see ADR-0027 for the
// contrast tradeoff that motivated them.
//
// Key order matters: `default` ships first because (a) it is the
// DEFAULT_INPUTS projection and the test pin guards that relationship, and
// (b) Object.entries iteration order determines findActivePreset's match
// precedence when two presets happen to share structure.
export const SHADCN_PRESETS = {
  default: {
    // why: must equal DEFAULT_INPUTS.seed (#6750a4) — the `default` preset is
    // the boot-default projection (R5 pins this), so its curated seed is the
    // app default itself.
    seed: seedOf('#6750a4'),
    variant: 'cmf',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: 'zinc',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0.3, dark: 0 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary-container',
        '--primary-foreground': '--color-on-primary-container',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-dim',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-highest',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline',
        '--input': '--color-outline',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline',
        '--sidebar-ring': '--color-outline',
      },
      dark: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-bright',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-highest',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline',
        '--input': '--color-outline',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-highest',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline',
        '--sidebar-ring': '--color-outline',
      },
    },
  },
  stark: {
    // why: provisional curated seed — near-neutral cool (zinc) for the stark,
    // minimal look. Final curation is the promotion slice.
    seed: seedOf('#3f3f46'),
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'zinc',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary-container',
        '--primary-foreground': '--color-on-primary-container',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
      dark: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary-container',
        '--primary-foreground': '--color-on-primary-container',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
    },
  },
  soft: {
    // why: provisional curated seed — muted soft blue. Final curation is the
    // promotion slice.
    seed: seedOf('#8fa8c8'),
    variant: 'tonalSpot',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: 'stone',
    surfaceTintLevel: { light: 0.1, dark: 0.3 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0.2, dark: 1 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-highest',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
      dark: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-highest',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-highest',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
    },
  },
  warm: {
    // why: provisional curated seed — warm terracotta so "warm" reads warm even
    // on the faithful cmf family (the seed is the chroma/temperature ceiling,
    // ADR-0031). Final curation is the promotion slice.
    seed: seedOf('#c2683a'),
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'taupe',
    surfaceTintLevel: { light: 0.1, dark: 0.1 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0, dark: 1 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-secondary-container',
        '--primary-foreground': '--color-on-secondary-container',
        '--secondary': '--color-secondary',
        '--secondary-foreground': '--color-on-secondary',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline-variant',
        '--sidebar': '--color-surface-container',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline-variant',
      },
      dark: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-secondary',
        '--primary-foreground': '--color-on-secondary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-outline-variant',
        '--muted-foreground': '--color-on-surface',
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline-variant',
      },
    },
  },
  playful: {
    // why: provisional curated seed — vivid magenta-pink for the playful look.
    // Final curation is the promotion slice.
    seed: seedOf('#d6409f'),
    variant: 'expressive',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: 'mauve',
    surfaceTintLevel: { light: 1, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-tertiary-container',
        '--secondary-foreground': '--color-on-tertiary-container',
        '--muted': '--color-surface-container',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-tertiary-container',
        '--accent-foreground': '--color-on-tertiary-container',
        '--destructive': '--color-error',
        '--border': '--color-tertiary-fixed-dim',
        '--input': '--color-tertiary-fixed-dim',
        '--ring': '--color-tertiary-fixed-dim',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-tertiary-container',
        '--sidebar-accent-foreground': '--color-on-tertiary-container',
        '--sidebar-border': '--color-outline',
        '--sidebar-ring': '--color-outline',
      },
      dark: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-tertiary-container',
        '--secondary-foreground': '--color-on-tertiary-container',
        '--muted': '--color-surface-container',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-tertiary-container',
        '--accent-foreground': '--color-on-tertiary-container',
        '--destructive': '--color-error',
        '--border': '--color-tertiary-container',
        '--input': '--color-tertiary-container',
        '--ring': '--color-tertiary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-tertiary-container',
        '--sidebar-accent-foreground': '--color-on-tertiary-container',
        '--sidebar-border': '--color-tertiary-container',
        '--sidebar-ring': '--color-tertiary',
      },
    },
  },
  monotone: {
    // why: provisional curated seed — low-chroma grey. monotone runs the
    // monochrome variant which manufactures its own neutral ramp, so the seed
    // mainly anchors hue; kept near-neutral. Final curation is the promotion
    // slice.
    seed: seedOf('#52525b'),
    variant: 'monochrome',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'zinc',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary-container',
        '--primary-foreground': '--color-on-primary-container',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-highest',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
      dark: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-highest',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-highest',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-highest',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
    },
  },
  tech: {
    // why: provisional curated seed — cool tech blue. Final curation is the
    // promotion slice.
    seed: seedOf('#2563eb'),
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'mist',
    surfaceTintLevel: { light: 1, dark: 1 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary-container',
        '--primary-foreground': '--color-on-primary-container',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-highest',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-primary-container',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-highest',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-inverse-primary',
        '--sidebar-ring': '--color-outline',
      },
      dark: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary-container',
        '--primary-foreground': '--color-on-primary-container',
        '--secondary': '--color-secondary',
        '--secondary-foreground': '--color-on-secondary',
        '--muted': '--color-surface-bright',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-tertiary-container',
        '--accent-foreground': '--color-on-tertiary-container',
        '--destructive': '--color-error',
        '--border': '--color-inverse-primary',
        '--input': '--color-inverse-primary',
        '--ring': '--color-primary-container',
        '--sidebar': '--color-surface-dim',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-tertiary-fixed-dim',
        '--sidebar-accent-foreground': '--color-on-tertiary-container',
        '--sidebar-border': '--color-inverse-primary',
        '--sidebar-ring': '--color-surface-tint',
      },
    },
  },
} satisfies Record<string, ShadcnPreset>

// why: derived from SHADCN_PRESETS so the union of valid preset names is
// always the exact set of declared keys. Renaming/removing/adding a preset
// flows through to call sites (e.g. setShadcnPreset) as a TS error rather
// than a silent runtime miss.
export type ShadcnPresetName = keyof typeof SHADCN_PRESETS

function bindingsEqual(a: ShadcnRoleBindings, b: ShadcnRoleBindings): boolean {
  for (const role of SHADCN_ROLE_NAMES) {
    if (a[role] !== b[role]) return false
  }
  return true
}

// why: matches a full PortableTheme against the preset library by structural
// equality on the 6 preset-defining fields. Returns the first preset whose
// recipe equals the theme's projection, or null if the user has drifted off
// any preset (mutated a binding, changed a surface dial, swapped variant).
// Used by the picker UI to highlight the active preset; consumers downstream
// must treat null as "custom" rather than "default" — see ADR-0026.
//
// Iteration order is `Object.entries(SHADCN_PRESETS)` which follows literal
// declaration order — `default` ships first, so a state matching multiple
// presets resolves to the earliest one.
export function findActivePreset(theme: PortableTheme): ShadcnPresetName | null {
  for (const [name, preset] of Object.entries(SHADCN_PRESETS) as [
    ShadcnPresetName,
    ShadcnPreset,
  ][]) {
    if (theme.variant !== preset.variant) continue
    if (theme.surfaceAlgo !== preset.surfaceAlgo) continue
    if (theme.surfacePaletteName !== preset.surfacePaletteName) continue
    if (theme.surfaceTintLevel.light !== preset.surfaceTintLevel.light) continue
    if (theme.surfaceTintLevel.dark !== preset.surfaceTintLevel.dark) continue
    if (theme.surfaceTintTextLevel.light !== preset.surfaceTintTextLevel.light) continue
    if (theme.surfaceTintTextLevel.dark !== preset.surfaceTintTextLevel.dark) continue
    if (theme.surfaceDesaturateLevel.light !== preset.surfaceDesaturateLevel.light) continue
    if (theme.surfaceDesaturateLevel.dark !== preset.surfaceDesaturateLevel.dark) continue
    if (!bindingsEqual(theme.shadcnRoleBindings.light, preset.shadcnRoleBindings.light)) continue
    if (!bindingsEqual(theme.shadcnRoleBindings.dark, preset.shadcnRoleBindings.dark)) continue
    return name
  }
  return null
}
