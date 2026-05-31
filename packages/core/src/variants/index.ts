import { cmf } from './cmf'
import { content } from './content'
import { expressive } from './expressive'
import { fidelity } from './fidelity'
import { fruitSalad } from './fruitSalad'
import { monochrome } from './monochrome'
import { neutral } from './neutral'
import { rainbow } from './rainbow'
import { tonalSpot } from './tonalSpot'
import type { VariantGroup, VariantStrategy } from './types'
import { vibrant } from './vibrant'

export type { VariantGroup, VariantStrategy } from './types'

// why: registry shape mirrors color-systems / exporters / importers — a record
// indexed by stable lowercase name. derive.ts looks up `variants[source.variant]`.
// `as const satisfies` keeps keys typed literally so VariantName narrows to
// the actual present keys. One widened VariantStrategy interface carries the
// optional second-source param (cmf) as data — not a per-arity union (ADR-0010).
export const variants = {
  cmf,
  tonalSpot,
  neutral,
  fidelity,
  content,
  vibrant,
  expressive,
  rainbow,
  fruitSalad,
  monochrome,
} as const satisfies Record<string, VariantStrategy>

export type VariantName = keyof typeof variants

export const DEFAULT_VARIANT: VariantName = 'cmf'

// why: canonical render order for variant <optgroup> sections. cmf first
// (current default + 2025 scheme), then standard, expressive, subdued —
// reading flow that locks UI grouping without imposing an ordering on the
// registry itself (variants stays unordered for code lookup).
export const VARIANT_GROUPS_ORDERED: readonly VariantGroup[] = [
  'cmf',
  'standard',
  'expressive',
  'subdued',
] as const
