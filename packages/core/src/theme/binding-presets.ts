import {
  type PortableTheme,
  SHADCN_EDGE_ROLES,
  SHADCN_ROLE_NAMES,
  type ShadcnRoleBindings,
} from './schema'
import { SHADCN_PRESETS } from './shadcn-presets'

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
  default: {
    description: 'Balanced defaults — a neutral surface mapping to start from',
    shadcnRoleBindings: SHADCN_PRESETS.default.shadcnRoleBindings,
  },
  clean: {
    description: 'Flat surfaces — card, popover, and background share one layer',
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
        '--border': '--color-outline',
        '--input': '--color-outline',
        '--ring': '--color-outline',
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
        '--border': '--color-outline',
        '--input': '--color-outline',
        '--ring': '--color-outline',
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
  mixed: {
    description: 'Mode-aware — light and dark route to different layers',
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
  layered: {
    description: 'Stacked depth — each surface sits on its own elevation tier',
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
  seamless: {
    description: 'Subtle depth — cards lift gently while popovers blend into the page',
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

// why: mode-keyed equality across every role EXCEPT the edge-weight sub-axis
// (SHADCN_EDGE_ROLES). A deliberate mirror of the private
// bindingsEqualIgnoringEdges in shadcn-presets.ts, kept local so this module
// stays decoupled — the loop is trivial and the sibling file establishes the
// exact pattern. Edges are a recognized modifier, not identity: softening
// --border/--input/--sidebar-border keeps the binding picker lit on its preset,
// mirroring findActivePreset. --ring stays compared.
// Edge-role set is memoized lazily (matching shadcn-presets.ts) so it never
// reads SHADCN_EDGE_ROLES at module-init time — defensive against import-cycle
// ordering, even though this leaf module currently loads after schema settles.
let edgeRoleSet: Set<string> | undefined
function bindingsEqualIgnoringEdges(a: ShadcnRoleBindings, b: ShadcnRoleBindings): boolean {
  edgeRoleSet ??= new Set<string>(SHADCN_EDGE_ROLES)
  for (const role of SHADCN_ROLE_NAMES) {
    if (edgeRoleSet.has(role)) continue
    if (a[role] !== b[role]) return false
  }
  return true
}

// why: the binding-tier mirror of findActivePreset (shadcn-presets.ts). Matches a
// theme's role→token routing against the catalog by structural equality on BOTH
// modes — across every role EXCEPT the edge-weight sub-axis (SHADCN_EDGE_ROLES),
// so a soft-border toggle keeps the picker lit on its preset — returning the
// first matching name or null ("custom routing"). Reads ONLY shadcnRoleBindings
// (hence the `Pick`, also lets a SourceState pass directly, like selectSeedHex) —
// never the recipe or source inputs: a binding preset is pure routing (ADR-0031
// #1), so its identity is the map alone and survives any seed/variant/surface
// change. This is the tier-independent identity that lets a binding picker
// highlight its own selection while findActivePreset reports the theme tier
// separately — the two pickers never share an identity, by design. Iteration is
// declaration order, so a state matching multiple presets resolves to the
// earliest (none overlap today).
export function findActiveBindingPreset(
  theme: Pick<PortableTheme, 'shadcnRoleBindings'>,
): ShadcnBindingPresetName | null {
  for (const [name, preset] of Object.entries(SHADCN_BINDING_PRESETS) as [
    ShadcnBindingPresetName,
    ShadcnBindingPreset,
  ][]) {
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
