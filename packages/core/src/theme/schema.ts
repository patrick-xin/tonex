import { DEFAULT_VARIANT, type VariantName } from '../variants'

export const SCHEMA_VERSION = 1 as const
export type SchemaVersion = typeof SCHEMA_VERSION

export const STORAGE_KEY = 'tonex-theme-v1' as const

// why: canonical list of md tokens deriveTheme emits per mode. Used as the
// value-domain of ShadcnRoleBindings — the type system rejects bindings to
// tokens that don't exist. Adding a new md token: extend this list AND emit
// it in derive.ts (both must move together; the test suite catches drift).
export const MD_TOKEN_NAMES = [
  '--color-primary',
  '--color-on-primary',
  '--color-primary-container',
  '--color-on-primary-container',
  '--color-surface',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-on-surface',
] as const
export type MdTokenName = (typeof MD_TOKEN_NAMES)[number]

// why: shadcn roles tonex currently maps. Slice 7 widens this — for now two
// roles is enough to verify the binding mechanism end-to-end. Listed as a
// const tuple (sibling to MD_TOKEN_NAMES) so iteration sites read from one
// canonical source. Adding a role here forces the type to widen and every
// iterator to surface the new entry.
export const SHADCN_ROLE_NAMES = ['--primary', '--primary-foreground'] as const
export type ShadcnRoleName = (typeof SHADCN_ROLE_NAMES)[number]

export type ShadcnRoleBindings = Record<ShadcnRoleName, MdTokenName>

// why: default bindings preserve slice-1 hardcoded behavior — shadcn primary
// pairs with md primary-container as the "filled surface" tonal pair. Making
// the rule a value (not a literal in derive.ts) is what enables editing.
export const DEFAULT_SHADCN_ROLE_BINDINGS: ShadcnRoleBindings = {
  '--primary': '--color-primary-container',
  '--primary-foreground': '--color-on-primary-container',
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
  md3PrimaryContainerOverride: { light: null, dark: null },
  shadcnRoleBindings: {
    light: DEFAULT_SHADCN_ROLE_BINDINGS,
    dark: DEFAULT_SHADCN_ROLE_BINDINGS,
  },
  surfaceAlgo: 'none',
  surfaceTintLevel: 0,
  surfaceDesaturateLevel: 0,
}
