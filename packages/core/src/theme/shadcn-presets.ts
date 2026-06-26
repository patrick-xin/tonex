import type { VariantName } from '../variants'
import { hctFromHex } from './hct'
import {
  type PortableTheme,
  type Seed,
  SHADCN_EDGE_ROLES,
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
  // ShadcnBindingPreset.description. Wording curated in #112 (shipped).
  description: string
  variant: VariantName
  surfaceAlgo: SurfaceAlgo
  surfacePaletteName: { light: NeutralPaletteName; dark: NeutralPaletteName }
  surfaceTintLevel: { light: number; dark: number }
  surfaceTintTextLevel: { light: number; dark: number }
  surfaceDesaturateLevel: { light: number; dark: number }
  shadcnRoleBindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }
  // why: curated seed the preset was tuned against (ADR-0031 #2). Stored as the
  // canonical HCT decomposition with exactHex preserved so the hex display
  // reads back the curated bytes verbatim, exactly like a user paste (ADR-0028)
  // — built via `seedOf(hex)` below. Per-preset seeds were curated in #112
  // (adopt machinery: #109).
  seed: Seed
  // why: curated per-mode contrast the preset was tuned against (ADR-0031 #2),
  // sibling to seed. Mirrors PortableTheme.contrastLevel ({ light, dark }, each
  // [0, 1]) so a preset can carry a distinct dark baseline (e.g. OLED). Adopting
  // a preset's contrast is still one decision gated by the single contrastTouched
  // (both modes land together — #123 Decision B's touched granularity stands);
  // per-mode is only the curated value's shape, not the touched granularity.
  // Supersedes an untouched contrast at apply, resolved independently of the
  // seed. Per-preset values curated in #112.
  contrastLevel: { light: number; dark: number }
}

// why: build a curated seed from a hex the same way DEFAULT_INPUTS does —
// canonical HCT axes plus the exact bytes — so a superseded seed reads back as
// if the user had pasted that hex. One helper keeps every curated seed on the
// identical construction path.
function seedOf(hex: string): Seed {
  return { ...hctFromHex(hex), exactHex: hex }
}

export const SHADCN_PRESETS = {
  default: {
    description: 'Balanced, neutral starting point — calm chrome with no strong opinion',
    seed: seedOf('#b8b0a1'),
    contrastLevel: { light: 0, dark: 0 },
    variant: 'cmf',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: { light: 'zinc', dark: 'zinc' },
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
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
  stone: {
    description:
      'Near-black monochrome with the faintest warmth — minimal and high-contrast, for portfolios, agencies, and editorial',
    seed: seedOf('#161616'),
    contrastLevel: { light: 0.25, dark: 0.25 },
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: { light: 'mist', dark: 'mist' },
    surfaceTintLevel: { light: 0.5, dark: 0.3 },
    surfaceTintTextLevel: { light: 0.8, dark: 0.9 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
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
        '--ring': '--color-outline-variant',
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
        '--ring': '--color-outline-variant',
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
  lagoon: {
    description:
      'Deep blue-green, cool and composed — steady-reading dashboards, fintech, and data tools',
    seed: seedOf('#009195'),
    contrastLevel: { light: 0, dark: 0 },
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: { light: 'mist', dark: 'mist' },
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
  breeze: {
    description: 'Bright airy azure on clean neutral — fresh and modern, for SaaS and dev tools',
    seed: seedOf('#2e5bff'),
    contrastLevel: { light: 0, dark: 0 },
    variant: 'cmf',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: { light: 'zinc', dark: 'zinc' },
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
  paper: {
    description:
      'Warm editorial cream with quiet chrome that lets text lead — blogs, docs, longform reading',
    seed: seedOf('#e3bfaa'),
    contrastLevel: { light: 0.1, dark: 0.1 },
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: { light: 'stone', dark: 'stone' },
    surfaceTintLevel: { light: 0.4, dark: 0.3 },
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
  enterprise: {
    description:
      'Restrained navy on slate with visible borders — B2B SaaS, fintech, and admin consoles',
    seed: seedOf('#3a5a8c'),
    contrastLevel: { light: 0.15, dark: 0.15 },
    variant: 'cmf',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: { light: 'slate', dark: 'slate' },
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
  sunset: {
    description:
      'Warm coral energy with a second hot accent — consumer, food, events, and lifestyle apps',
    seed: seedOf('#f4633a'),
    contrastLevel: { light: 0, dark: 0 },
    variant: 'tonalSpot',
    surfaceAlgo: 'tint',
    surfacePaletteName: { light: 'taupe', dark: 'taupe' },
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
  sage: {
    description:
      'Muted sage held close in value — calm and focused, for wellness, journaling, and mindfulness',
    seed: seedOf('#478f5c'),
    contrastLevel: { light: 0, dark: 0 },
    variant: 'tonalSpot',
    surfaceAlgo: 'desaturate',
    surfacePaletteName: { light: 'olive', dark: 'olive' },
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
  fire: {
    description:
      'Vivid signal red on a warm neutral — bold and high-energy, for commerce, sports, and entertainment',
    seed: seedOf('#e60012'),
    contrastLevel: { light: 0, dark: 0 },
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: { light: 'mauve', dark: 'mauve' },
    surfaceTintLevel: { light: 0.5, dark: 0.3 },
    surfaceTintTextLevel: { light: 0, dark: 0 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
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
  electron: {
    description:
      'Electric lime-green on cool slate — energetic and technical, for dev tools, gaming, and developer platforms',
    seed: seedOf('#457b00'),
    contrastLevel: { light: 0, dark: 0 },
    variant: 'cmf',
    surfaceAlgo: 'tint',
    surfacePaletteName: { light: 'slate', dark: 'slate' },
    surfaceTintLevel: { light: 0, dark: 0 },
    surfaceTintTextLevel: { light: 0.3, dark: 0.4 },
    surfaceDesaturateLevel: { light: 0, dark: 0 },
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
        '--popover': '--color-surface-container-low',
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
} satisfies Record<string, ShadcnPreset>

// why: derived from SHADCN_PRESETS so the union of valid preset names is
// always the exact set of declared keys. Renaming/removing/adding a preset
// flows through to call sites (e.g. setShadcnPreset) as a TS error rather
// than a silent runtime miss.
export type ShadcnPresetName = keyof typeof SHADCN_PRESETS

// why: structural equality across every role EXCEPT the edge-weight sub-axis
// (SHADCN_EDGE_ROLES). Edges are a recognized modifier, not identity, so two
// binding maps that differ only on --border/--input/--sidebar-border are the
// same preset — a soft-border toggle keeps the picker lit rather than dropping
// it to "custom". --ring stays compared (soft-border never touches it).
//
// The edge-role set is memoized lazily (not a module-level const): schema.ts and
// shadcn-presets.ts form an import cycle (schema reads SHADCN_PRESETS.default for
// DEFAULT_SHADCN_ROLE_BINDINGS), so SHADCN_EDGE_ROLES is still uninitialized when
// this module's body runs. Resolving it on first call — like SHADCN_ROLE_NAMES
// is read inside the loop — sidesteps the cycle entirely.
let edgeRoleSet: Set<string> | undefined
function bindingsEqualIgnoringEdges(a: ShadcnRoleBindings, b: ShadcnRoleBindings): boolean {
  edgeRoleSet ??= new Set<string>(SHADCN_EDGE_ROLES)
  for (const role of SHADCN_ROLE_NAMES) {
    if (edgeRoleSet.has(role)) continue
    if (a[role] !== b[role]) return false
  }
  return true
}

// why: matches a full PortableTheme against the preset library by structural
// equality on the 6 preset-defining fields, comparing the binding map on every
// role EXCEPT the edge-weight sub-axis (SHADCN_EDGE_ROLES). Returns the first
// preset whose recipe equals the theme's projection, or null if the user has
// drifted off any preset (mutated a NON-edge binding, changed a surface dial,
// swapped variant). Edge weight is a recognized modifier, not identity: a
// soft-border toggle (or any edge rebind) keeps the preset detected so the
// picker stays lit and the switch-confirmation dialog never trips on it. Used
// by the picker UI to highlight the active preset; consumers downstream must
// treat null as "custom" rather than "default" — see ADR-0026.
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
    if (theme.surfacePaletteName.light !== preset.surfacePaletteName.light) continue
    if (theme.surfacePaletteName.dark !== preset.surfacePaletteName.dark) continue
    if (theme.surfaceTintLevel.light !== preset.surfaceTintLevel.light) continue
    if (theme.surfaceTintLevel.dark !== preset.surfaceTintLevel.dark) continue
    if (theme.surfaceTintTextLevel.light !== preset.surfaceTintTextLevel.light) continue
    if (theme.surfaceTintTextLevel.dark !== preset.surfaceTintTextLevel.dark) continue
    if (theme.surfaceDesaturateLevel.light !== preset.surfaceDesaturateLevel.light) continue
    if (theme.surfaceDesaturateLevel.dark !== preset.surfaceDesaturateLevel.dark) continue
    if (
      !bindingsEqualIgnoringEdges(theme.shadcnRoleBindings.light, preset.shadcnRoleBindings.light)
    )
      continue
    if (!bindingsEqualIgnoringEdges(theme.shadcnRoleBindings.dark, preset.shadcnRoleBindings.dark))
      continue
    return name
  }
  return null
}
