// why: derive/ groups the theme-derivation spine. deriveTheme produces the
// DerivedTheme that every sink (applyDom, exporters) consumes. cache.ts is
// the per-call memoization adapter (issue #9, extended for #20) — repeat
// calls with byte-identical inputs return the same DerivedTheme reference,
// so React-side useShallow subscriptions can compare by identity. Internal
// cross-file imports inside derive/ stay on direct sibling paths (./derive,
// ./cache) so the barrel doesn't introduce circular-import risk within the
// folder. The test-only __resetDeriveCache seam stays off the barrel —
// tests reach it via direct './derive/cache' import to keep the public
// surface clean.

export { getDerivedTheme } from './cache'
export {
  type DerivedTheme,
  deriveTheme,
  type MdLayer,
  type ResolvedLayer,
  type ShadcnLayer,
  type TokenMap,
} from './derive'
