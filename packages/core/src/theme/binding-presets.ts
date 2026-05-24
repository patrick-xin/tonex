import type { ShadcnRoleBindings } from './schema'

// why: a role binding preset is a *named, described starting point* for the
// shadcn role→md-token map — ADR-0031 #1's "convenience input to the binding
// knob, not a preset." It carries no seed, contrast, variant, or surface: it is
// pure routing that composes on top of whatever theme/seed the user already
// has. Applying one stamps `shadcnRoleBindings` and leaves the user editing
// bindings — it has no preset identity (findActivePreset never inspects it) and
// triggers no switch confirmation, unlike a theme preset (SHADCN_PRESETS).
//
// `description` is the user-facing explanation of the visual intent, so a
// non-expert picks by outcome ("popover & card share one background") without
// needing the md-token vocabulary — the whole reason these are curated.
export interface ShadcnBindingPreset {
  description: string
  shadcnRoleBindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }
}

// why: curator-authored library — the record this session exists to capture.
// Binding tokens is the curator's job, so each entry is hand-authored: tune the
// role→token map in the preset tuner (/theme/shadcn/tuner → Bindings), copy the
// emitted `shadcnRoleBindings` from the Changes tab, and paste it here under a
// new key with a description. No app UI consumes this yet — the binding-knob
// picker is a separate, later feature (the convenience-input surface ADR-0031
// #1 floats). Entries are provisional until that curation pass settles.
//
// Add: a new key with a description + full light/dark binding maps.
// Remove: delete the key.
export const SHADCN_BINDING_PRESETS = {
  // why: provisional placeholder (= default routing) commented out during the
  // exploration pass — replaced by the three curated maps below, each authored
  // in the preset tuner and named for the *elevation behaviour* it produces
  // (not a hue, since a binding preset carries no color).
  // clean: {
  //   description: 'Popover & card share one background',
  //   shadcnRoleBindings: {
  //     light: { ...DEFAULT_SHADCN_ROLE_BINDINGS.light },
  //     dark: { ...DEFAULT_SHADCN_ROLE_BINDINGS.dark },
  //   },
  // },

  // why: bright cards lift off the page, controls get crisp full-strength
  // outlines (--border/--input → --color-outline). The high-energy routing —
  // edges are stated, not whispered. (imported from tuner: "Lime")
  crisp: {
    description: 'Bright cards lift off the page with crisp, outlined controls',
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-bright',
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
        '--muted': '--color-surface-container-highest',
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
        '--sidebar-ring': '--color-primary',
      },
    },
  },

  // why: popovers sit *below* cards (--popover → surface-container-low while
  // --card → surface-container) and muted reads dim (--color-surface-dim), so
  // the UI feels recessed and stacked. Soft outline-variant edges. (imported
  // from tuner: "Crimson 9")
  layered: {
    description: 'Popovers recede beneath cards; dim, layered surfaces',
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
        '--border': '--color-outline-variant',
        '--input': '--color-outline',
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
        '--sidebar-border': '--color-outline-variant',
        '--sidebar-ring': '--color-outline',
      },
    },
  },

  // why: popovers blend flat into the page (light --popover → --color-surface,
  // i.e. the background itself) while cards still lift to surface-container —
  // only cards read as raised. Calm, minimal-chrome routing. (imported from
  // tuner: "Grass 9")
  seamless: {
    description: 'Popovers blend flat into the page; only cards lift',
    shadcnRoleBindings: {
      light: {
        '--background': '--color-surface',
        '--foreground': '--color-on-surface',
        '--card': '--color-surface-container',
        '--card-foreground': '--color-on-surface',
        '--popover': '--color-surface',
        '--popover-foreground': '--color-on-surface',
        '--primary': '--color-primary',
        '--primary-foreground': '--color-on-primary',
        '--secondary': '--color-secondary-container',
        '--secondary-foreground': '--color-on-secondary-container',
        '--muted': '--color-surface-dim',
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
} satisfies Record<string, ShadcnBindingPreset>

// why: derived from SHADCN_BINDING_PRESETS so the union of valid names is always
// the exact set of declared keys — renaming/removing flows to call sites as a
// TS error, mirroring ShadcnPresetName.
export type ShadcnBindingPresetName = keyof typeof SHADCN_BINDING_PRESETS
