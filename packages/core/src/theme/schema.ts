import { DEFAULT_VARIANT, type VariantName } from '../variants'

export const SCHEMA_VERSION = 1 as const
export type SchemaVersion = typeof SCHEMA_VERSION

export const STORAGE_KEY = 'tonex-theme-v1' as const

// why: PortableTheme is the portable wire shape — what gets serialized to
// localStorage, files, or the network. SourceState (in source.ts) is the
// in-memory shape and equals: PortableTheme − version + _hydrated + actions.
// Keep this minimal in slice 1; future slices add overrides, locks, etc.
export interface PortableTheme {
  version: SchemaVersion
  seedHex: string
  variant: VariantName
}

// why: DEFAULT_INPUTS is referenced by source initial state, the baked
// globals.css, and the drift-guard test. Changing seedHex here means
// regenerating globals.css and re-baselining the drift-guard.
export const DEFAULT_INPUTS: PortableTheme = {
  version: SCHEMA_VERSION,
  seedHex: '#6750a4',
  variant: DEFAULT_VARIANT,
}
