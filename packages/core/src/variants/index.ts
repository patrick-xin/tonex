import type { VariantStrategy } from './cmf'
import { cmf } from './cmf'
import { tonalSpot } from './tonalSpot'

export type { VariantStrategy } from './cmf'

// why: registry shape mirrors color-systems / exporters / importers — a record
// indexed by stable lowercase name. derive.ts looks up `variants[source.variant]`.
// `as const satisfies` keeps keys typed literally so VariantName narrows to
// the actual present keys. Two entries today force the dispatch path to be
// real lookup-by-name; new variants widen the union.
export const variants = {
  cmf,
  tonalSpot,
} as const satisfies Record<string, VariantStrategy>

export type VariantName = keyof typeof variants

export const DEFAULT_VARIANT: VariantName = 'cmf'
