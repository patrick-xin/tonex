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
// roles is enough to verify the binding mechanism end-to-end.
export type ShadcnRoleName = '--primary' | '--primary-foreground'

export type ShadcnRoleBindings = Record<ShadcnRoleName, MdTokenName>

// why: default bindings preserve slice-1 hardcoded behavior — shadcn primary
// pairs with md primary-container as the "filled surface" tonal pair. Making
// the rule a value (not a literal in derive.ts) is what enables editing.
export const DEFAULT_SHADCN_ROLE_BINDINGS: ShadcnRoleBindings = {
  '--primary': '--color-primary-container',
  '--primary-foreground': '--color-on-primary-container',
}

// why: PortableTheme is the portable wire shape — what gets serialized to
// localStorage, files, or the network. SourceState (in source.ts) is the
// in-memory shape and equals: PortableTheme − version + _hydrated + actions.
// Keep this minimal in slice 1; future slices add overrides, locks, etc.
export interface PortableTheme {
  version: SchemaVersion
  seedHex: string
  variant: VariantName
  // why: minimal single-token override to verify the source→derive→DOM→export
  // loop under mutation pressure with light/dark UX. Mode-keyed per ADR-0017.
  // Slice 6 will generalize this to md3TokenOverrides: Record<TokenName, ModeKeyed>.
  md3PrimaryContainerOverride: { light: string | null; dark: string | null }
  // why: cross-layer mapping is data, not code. Mode-keyed because some
  // slice-7 mappings will diverge across modes (e.g. light primary →
  // primary-container, dark primary → primary for contrast). ADR-0017.
  shadcnRoleBindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings }
}

// why: DEFAULT_INPUTS is referenced by source initial state, the baked
// globals.css, and the drift-guard test. Changing seedHex here means
// regenerating globals.css and re-baselining the drift-guard.
export const DEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seedHex: '#6750a4',
  variant: DEFAULT_VARIANT,
  md3PrimaryContainerOverride: { light: null, dark: null },
  shadcnRoleBindings: {
    light: DEFAULT_SHADCN_ROLE_BINDINGS,
    dark: DEFAULT_SHADCN_ROLE_BINDINGS,
  },
}
