import { DEFAULT_VARIANT, type VariantName } from '../variants'

export const SCHEMA_VERSION = 1 as const
export type SchemaVersion = typeof SCHEMA_VERSION

export const STORAGE_KEY = 'tonex-theme-v1' as const

// why: canonical list of md tokens deriveTheme emits per mode. Used as the
// value-domain of ShadcnRoleBindings — the type system rejects bindings to
// tokens that don't exist. Adding a new md token: extend this list AND
// register a resolver in derive.ts MD_TOKEN_RESOLVERS (both must move
// together; the test suite catches drift).
//
// Order: families grouped, primary first to match M3 spec ordering. Surface
// dim/bright sit between base surface and the container ladder. Outline +
// outline-variant tail. Tertiary family included for md-side completeness
// even though no default shadcn binding currently consumes it — md is its
// own export surface, not just shadcn's substrate.
export const MD_TOKEN_NAMES = [
  '--color-primary',
  '--color-on-primary',
  '--color-primary-container',
  '--color-on-primary-container',
  '--color-secondary',
  '--color-on-secondary',
  '--color-secondary-container',
  '--color-on-secondary-container',
  '--color-tertiary',
  '--color-on-tertiary',
  '--color-tertiary-container',
  '--color-on-tertiary-container',
  '--color-error',
  '--color-on-error',
  '--color-error-container',
  '--color-on-error-container',
  '--color-surface',
  '--color-on-surface',
  '--color-on-surface-variant',
  '--color-surface-dim',
  '--color-surface-bright',
  '--color-surface-container-lowest',
  '--color-surface-container-low',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-surface-container-highest',
  '--color-outline',
  '--color-outline-variant',
] as const
export type MdTokenName = (typeof MD_TOKEN_NAMES)[number]

// why: shadcn-classic role surface. Listed as a const tuple (sibling to
// MD_TOKEN_NAMES) so iteration sites read from one canonical source. Adding
// a role here forces the type to widen, the bindings record to gain the
// key, and every iterator (derive.bindShadcn, globals.css alias bridge,
// testbed UI) to surface the new entry. No --destructive-foreground —
// destructive's contrast partner is already bound via on-error in legacy
// shadcn templates.
export const SHADCN_ROLE_NAMES = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--border',
  '--input',
  '--ring',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
] as const
export type ShadcnRoleName = (typeof SHADCN_ROLE_NAMES)[number]

export type ShadcnRoleBindings = Record<ShadcnRoleName, MdTokenName>

// why: default light bindings — lifted from legacy tonex's MD3_ROLE_MAP.
// Structurally significant pairings:
//   - card → surface-dim (light) / surface-bright (dark) — cards float
//     darker than surface in light mode, lighter in dark mode.
//   - popover → surface (light) / surface-container (dark) — same intent.
//   - sidebar-foreground → on-surface (light) / on-surface-variant (dark) —
//     softer text on dark sidebars.
// border = input = ring = outline by design — outline is M3's edge token
// and shadcn's three edge roles all want the same value at default.
const DEFAULT_SHADCN_BINDINGS_LIGHT: ShadcnRoleBindings = {
  '--background': '--color-surface',
  '--foreground': '--color-on-surface',
  '--card': '--color-surface-dim',
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
  '--ring': '--color-outline',
  '--sidebar': '--color-surface-container-low',
  '--sidebar-foreground': '--color-on-surface',
  '--sidebar-primary': '--color-primary',
  '--sidebar-primary-foreground': '--color-on-primary',
  '--sidebar-accent': '--color-surface-container-highest',
  '--sidebar-accent-foreground': '--color-on-surface',
  '--sidebar-border': '--color-outline',
  '--sidebar-ring': '--color-outline',
}

// why: dark mode diverges from light only on the three asymmetric pairings
// above. Spread + override keeps the delta visible at a glance and prevents
// the two maps from silently drifting on edits — adding a key to LIGHT
// flows through DARK automatically.
const DEFAULT_SHADCN_BINDINGS_DARK: ShadcnRoleBindings = {
  ...DEFAULT_SHADCN_BINDINGS_LIGHT,
  '--card': '--color-surface-bright',
  '--popover': '--color-surface-container',
  '--sidebar-foreground': '--color-on-surface-variant',
}

export const DEFAULT_SHADCN_ROLE_BINDINGS: {
  light: ShadcnRoleBindings
  dark: ShadcnRoleBindings
} = {
  light: DEFAULT_SHADCN_BINDINGS_LIGHT,
  dark: DEFAULT_SHADCN_BINDINGS_DARK,
}

// why: which surface treatment (if any) deriveTheme applies post-md-emit.
// Mutually exclusive — composing tint and desaturate isn't a product feature.
// Default 'none' keeps the drift-guard baseline (globals.css === formatCss(
// deriveTheme(DEFAULT_INPUTS))) trivially green.
export const SURFACE_ALGOS = ['none', 'tint', 'desaturate'] as const
export type SurfaceAlgo = (typeof SURFACE_ALGOS)[number]

// why: PortableTheme is the portable wire shape — what gets serialized to
// localStorage, files, or the network. SourceState (in source.ts) is the
// in-memory shape and equals: PortableTheme − version + _hydrated + actions.
// Keep this minimal in slice 1; future slices add overrides, locks, etc.
export interface PortableTheme {
  version: SchemaVersion
  seedHex: string
  variant: VariantName
  // why: MCU contrastLevel input — fed straight into variant.build(). Range
  // -1..1 per MCU spec; 0 is the baseline. Drives tone offsets across all
  // dynamic colors, so changing it shifts every md token in lockstep.
  contrastLevel: number
  // why: pin primary to an exact hex; on-primary / primary-container /
  // on-primary-container auto-derive from a TonalPalette built off the
  // locked HCT (mode-keyed). This is the "brand color is non-negotiable"
  // product story — variant + contrastLevel still drive non-primary roles.
  // Container/on-* tones use M3 baseline (90/10 light, 30/90 dark); contrast-
  // aware family resolution is later work.
  primaryHexLock: { light: string | null; dark: string | null }
  // why: source-input gate, not a per-token snapshot. When true, setSeedHex
  // becomes a no-op — pathways that mutate the seed (hex input, HCT slider,
  // image extraction) all flow through the same setter. Lock is orthogonal
  // to override: locking after setting overrides preserves overrides because
  // they live on different fields. Boolean (not mode-keyed) — locking the
  // seed locks both modes since seedHex itself isn't mode-keyed.
  seedHexLock: boolean
  // why: minimal single-token override to verify the source→derive→DOM→export
  // loop under mutation pressure with light/dark UX. Mode-keyed per ADR-0017.
  // Slice 6 generalizes this as md3TokenOverrides: { light: Record<MdTokenName,
  // string>; dark: Record<MdTokenName, string> } — mode at the top per ADR-0017
  // commitment 3 (mirrors :root + .dark export blocks one-to-one). Match the
  // shape of shadcnRoleBindings below; do NOT use Record<Token, {light, dark}>.
  md3PrimaryContainerOverride: { light: string | null; dark: string | null }
  // why: cross-layer mapping is data, not code. Mode-keyed because some
  // slice-7 mappings will diverge across modes (e.g. light primary →
  // primary-container, dark primary → primary for contrast). ADR-0017.
  shadcnRoleBindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }
  // why: surface treatment is a post-derive transform applied inside
  // deriveTheme so applyDom AND formatCss reflect it identically — preview
  // === export (ADR-0017). `surfaceAlgo` selects which (if any) algorithm
  // runs; the level for the selected algorithm controls strength.
  // - surfaceTintLevel: 0=neutral zinc → 1=full primary character.
  // - surfaceDesaturateLevel: 0=MCU as-is → 1=chroma stripped.
  surfaceAlgo: SurfaceAlgo
  surfaceTintLevel: number
  surfaceDesaturateLevel: number
}

// why: DEFAULT_INPUTS is referenced by source initial state, the baked
// globals.css, and the drift-guard test. Changing seedHex here means
// regenerating globals.css and re-baselining the drift-guard.
export const DEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seedHex: '#6750a4',
  variant: DEFAULT_VARIANT,
  contrastLevel: 0,
  primaryHexLock: { light: null, dark: null },
  seedHexLock: false,
  md3PrimaryContainerOverride: { light: null, dark: null },
  shadcnRoleBindings: DEFAULT_SHADCN_ROLE_BINDINGS,
  surfaceAlgo: 'none',
  surfaceTintLevel: 0,
  surfaceDesaturateLevel: 0,
}
