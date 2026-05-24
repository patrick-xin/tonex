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
// top of the binding-resolved values and persist orthogonally. The curated
// source inputs are the seed and contrastLevel.
export interface ShadcnPreset {
  // why: audience + character caption, NOT identity (findActivePreset never
  // reads it). The preset name is a pure mnemonic; the "who it's for / how it
  // feels" line lives here so the picker's preview popover can show a caption
  // and we never smuggle audience words into the key. Mirrors
  // ShadcnBindingPreset.description. Final wording is the #112 curation pass.
  description: string
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
  // why: curated contrast the preset was tuned against (ADR-0031 #2), sibling
  // to seed. Range [0, 1] like PortableTheme.contrastLevel. Supersedes only an
  // untouched contrast at apply, resolved independently of the seed.
  // Provisional per-preset values land with the machinery (issue #110); final
  // curation is the promotion slice.
  contrastLevel: number
}

// why: build a curated seed from a hex the same way DEFAULT_INPUTS does —
// canonical HCT axes plus the exact bytes — so a superseded seed reads back as
// if the user had pasted that hex. One helper keeps every curated seed on the
// identical construction path.
function seedOf(hex: string): Seed {
  return { ...hctFromHex(hex), exactHex: hex }
}

// why: the shipping preset library. Currently an *exploration set* — the six
// original issue-#36 presets are commented out below in favour of three tuner
// imports (grove/lagoon/breeze) and five freshly-designed presets
// (noir/paper/enterprise/sunset/sage); the set will re-settle in the #112
// curation pass. Curator surface at apps/www/src/features/shadcn-preset-tuner/
// remains live as the editing path; this is the in-core mirror. Each entry
// carries its curated source inputs (seed + contrastLevel) plus the recipe
// (ADR-0031 #2). Asymmetric primary bindings (light=container, dark=primary)
// are intentional and identity-defining; see ADR-0027 for the contrast tradeoff
// that motivated them.
//
// Key order matters: `default` ships first because (a) it is the
// DEFAULT_INPUTS projection and the test pin guards that relationship, and
// (b) Object.entries iteration order determines findActivePreset's match
// precedence when two presets happen to share structure.
export const SHADCN_PRESETS = {
  default: {
    description: 'Balanced, neutral starting point — calm chrome with no strong opinion',
    // why: must equal DEFAULT_INPUTS.seed (#6750a4) — the `default` preset is
    // the boot-default projection (R5 pins this), so its curated seed is the
    // app default itself.
    seed: seedOf('#6750a4'),
    // why: must equal DEFAULT_INPUTS.contrastLevel (0) — `default` is the boot
    // projection (R5).
    contrastLevel: 0,
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
  /* why: the six provisional issue-#36 presets, commented out for the
     exploration pass — `default` stays (R5 pins it to DEFAULT_INPUTS). The live
     set below is the three tuner imports (grove/lagoon/breeze) plus five
     freshly-designed presets (noir/paper/enterprise/sunset/sage). Uncomment any
     block to bring it back; add its key to PRESET_NAMES in the test if so.

  stark: {
    // why: provisional curated seed — near-neutral cool (zinc) for the stark,
    // minimal look. Final curation is the promotion slice.
    seed: seedOf('#3f3f46'),
    // why: provisional — stark leans into legibility, so a lifted contrast.
    // Final curation is the promotion slice.
    contrastLevel: 0.3,
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
    // why: provisional — soft keeps the baseline contrast. Final curation is
    // the promotion slice.
    contrastLevel: 0,
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
    // why: provisional — warm keeps the baseline contrast. Final curation is
    // the promotion slice.
    contrastLevel: 0,
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
    // why: provisional — playful keeps the baseline contrast. Final curation is
    // the promotion slice.
    contrastLevel: 0,
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
    // why: provisional — a slight contrast lift suits the monochrome ramp.
    // Final curation is the promotion slice.
    contrastLevel: 0.15,
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
    // why: provisional — tech keeps the baseline contrast. Final curation is
    // the promotion slice.
    contrastLevel: 0,
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
  */

  // ── Tuner imports ────────────────────────────────────────────────────────
  // Captured live in the preset tuner, renamed from their source-color labels
  // to vibe concepts (Jade→grove, Teal→lagoon, Blue 10→breeze).

  // why: calm jewel-green (cmf keeps the seed's emerald temperature). Audience —
  // health, finance-calm, eco/nature products. Hierarchy: tinted mist surfaces
  // with desaturated light text recede so the green primary carries the eye;
  // primary-fg drops to surface-container-lowest in light for a crisp button.
  grove: {
    description:
      'Grounded jewel-green — trustworthy and organic, for natural or wellness-leaning products',
    seed: seedOf('#27B08B'),
    contrastLevel: 0.25,
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'mist',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0.8, dark: 0.9 },
    surfaceDesaturateLevel: { light: 0.3, dark: 0 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-surface-container-lowest',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-highest',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
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
        '--muted': '--color-surface-container-highest',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-bright',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary-container',
        '--sidebar-primary-foreground': '--color-on-primary-container',
        '--sidebar-accent': '--color-surface-container-highest',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
    },
  },

  // why: deeper blue-green than grove. Audience — fintech, analytics,
  // travel/booking. Hierarchy: asymmetric primary (light=primary,
  // dark=primary-container per ADR-0027) plus a dark-mode tint lift so cards
  // read against a slightly warmed teal ground.
  lagoon: {
    description:
      'Deep blue-green, cool and composed — steady-reading dashboards, fintech, and data tools',
    seed: seedOf('#12A594'),
    contrastLevel: 0,
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'mist',
    surfaceTintLevel: { light: 0, dark: 0.6 },
    surfaceTintTextLevel: { light: 0.9, dark: 0.8 },
    surfaceDesaturateLevel: { light: 0.3, dark: 0 },
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
        '--primary': '--color-primary-container',
        '--primary-foreground': '--color-on-primary-container',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-bright',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-bright',
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

  // why: bright, friendly azure on a desaturated zinc neutral. Audience —
  // mainstream SaaS, onboarding, productivity. Hierarchy: surfaces stay neutral
  // (desaturate) so the saturated blue primary and ring read as the only color;
  // popover drops to surface-container-low in light for a subtle menu lift.
  breeze: {
    description: 'Bright airy azure on clean neutral — fresh and modern, for SaaS and dev tools',
    seed: seedOf('#3B9EFF'),
    contrastLevel: 0,
    variant: 'cmf',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: 'zinc',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0.2, dark: 0 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container-low',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-highest',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
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
        '--sidebar-ring': '--color-primary',
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
        '--sidebar-ring': '--color-primary-container',
      },
    },
  },

  // ── Designed for the exploration pass ────────────────────────────────────

  // why: dark-first drama. Audience — developer tools, media/music players,
  // crypto dashboards (products that live in dark mode). Hierarchy: vibrant
  // manufactures one electric accent; desaturate flattens surfaces to near-
  // neutral so that accent is the *only* color on screen. In dark, card sits
  // flush with the background (no elevation) and borders nearly vanish
  // (outline-variant) — separation comes from the accent and type, not boxes.
  // The lifted contrast (0.2) keeps text legible on the deep ground.
  noir: {
    description:
      'Dark-first drama — one electric accent on near-black surfaces, for dev tools, crypto, and media',
    seed: seedOf('#5B57D6'),
    contrastLevel: 0.2,
    variant: 'vibrant',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: 'neutral',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0.4, dark: 0.6 },
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
        '--muted': '--color-surface-container',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
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
        '--popover': '--color-surface-container',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-primary',
      },
    },
  },

  // why: warm editorial reading surface. Audience — blogs, docs, longform,
  // publishing. Hierarchy: an amber seed tinted into stone gives a cream
  // "paper" ground; cards and popovers stay flat to the page (both → surface)
  // so nothing competes with the text, which carries full on-surface contrast.
  // Chrome is whisper-quiet: soft outline-variant edges, focus ring on outline
  // rather than the brand color. The slight contrast lift (0.1) aids long reads.
  paper: {
    description:
      'Warm editorial cream with quiet chrome that lets text lead — blogs, docs, longform reading',
    seed: seedOf('#a86b3c'),
    contrastLevel: 0.1,
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'stone',
    surfaceTintLevel: { light: 0.25, dark: 0.1 },
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
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container',
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
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
    },
  },

  // why: quiet, professional, dense. Audience — B2B SaaS, fintech, admin
  // dashboards. Hierarchy: a restrained low-chroma navy on desaturated slate,
  // with layered surfaces (card→container, popover→container-low) and *visible*
  // full-strength borders (outline) — the structure does the work so the color
  // can stay subdued. Primary carries the focus ring; nothing shouts.
  enterprise: {
    description:
      'Restrained navy on slate with visible borders — B2B SaaS, fintech, and admin consoles',
    seed: seedOf('#3a5a8c'),
    contrastLevel: 0.15,
    variant: 'cmf',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: 'slate',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0.3, dark: 0.2 },
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface-container-low',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-surface-container-high',
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
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-primary',
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
        '--accent': '--color-surface-container-high',
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
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-primary',
      },
    },
  },

  // why: saturated warm energy. Audience — consumer lifestyle, food, events,
  // marketing landings. Hierarchy: expressive manufactures a vivid coral primary
  // and a contrasting tertiary that drives the accent/secondary slots, so two
  // hot colors set the rhythm against a warm taupe tint. Surfaces stay flat
  // (card/popover → surface) so the color, not elevation, creates the energy.
  sunset: {
    description:
      'Warm coral energy with a second hot accent — consumer, food, events, and lifestyle apps',
    seed: seedOf('#f4633a'),
    contrastLevel: 0,
    variant: 'tonalSpot',
    surfaceAlgo: 'tint',
    surfacePaletteName: 'taupe',
    surfaceTintLevel: { light: 0.4, dark: 0.2 },
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
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-tertiary-container',
        '--sidebar-accent-foreground': '--color-on-tertiary-container',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-primary',
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
        '--secondary': '--color-tertiary-container',
        '--secondary-foreground': '--color-on-tertiary-container',
        '--muted': '--color-surface-container-high',
        '--muted-foreground': '--color-on-surface-variant',
        '--accent': '--color-tertiary-container',
        '--accent-foreground': '--color-on-tertiary-container',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-primary',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-tertiary-container',
        '--sidebar-accent-foreground': '--color-on-tertiary-container',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-primary',
      },
    },
  },

  // why: calm, muted, low-contrast. Audience — wellness, meditation, focus and
  // journaling apps. Hierarchy: a soft sage seed on tonalSpot, heavily
  // desaturated into an olive neutral, with everything held close in value so
  // nothing demands attention. The focus ring is outline (not the brand color)
  // and borders are soft — the calm comes from the *absence* of contrast jumps.
  sage: {
    description:
      'Muted sage held close in value — calm and focused, for wellness, journaling, and mindfulness',
    seed: seedOf('#7c8b6f'),
    contrastLevel: 0,
    variant: 'tonalSpot',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: 'olive',
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0.4, dark: 0.6 },
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
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
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
        '--accent': '--color-surface-container-high',
        '--accent-foreground': '--color-on-surface',
        '--destructive': '--color-error',
        '--border': '--color-outline-variant',
        '--input': '--color-outline-variant',
        '--ring': '--color-outline',
        '--sidebar': '--color-surface-container-low',
        '--sidebar-foreground': '--color-on-surface-variant',
        '--sidebar-primary': '--color-primary',
        '--sidebar-primary-foreground': '--color-on-primary',
        '--sidebar-accent': '--color-surface-container-high',
        '--sidebar-accent-foreground': '--color-on-surface',
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
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
