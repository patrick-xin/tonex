import type { SurfaceAlgo } from '@tonex/core/schema'

// why: Tint@0 still rebuilds surfaces from the plain neutral, while Desaturate@0
// is a true no-op — so only Tint-at-zero needs the asymmetry nudge. Pure so the
// trigger rule is unit-tested without the store.
export function showsTintZeroHint(algo: SurfaceAlgo, level: number): boolean {
  return algo === 'tint' && level === 0
}
