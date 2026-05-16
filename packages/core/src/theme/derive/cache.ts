import type { PortableTheme } from '../schema'
import { type DerivedTheme, deriveTheme } from './derive'

// why: deriveTheme is the spine pipeline (Hct + MCU variant.build × 2 +
// applyPaletteOverrides + buildMdLayer × 2 + applyMd3TokenOverrides + surface
// treatment + customColors + bindShadcn). Without a shared cache, every
// useResolvedTokens consumer runs it once per source change AND applyDom
// runs it again — (N+1)× per slider tick. A bounded entry list collapses
// that to 1× per distinct (source, contrastLevel) pair, regardless of
// consumer count. Issue #9, extended for #20.
//
// Cache strategy:
//   1. Identity short-circuit — hot path. useShallow(selectPortable) gives
//      every consumer the same stable reference per source change, so all
//      hooks past the first hit on `===`.
//   2. Shallow-equal fallback — cold path. applyDom calls selectPortable(s)
//      directly inside its subscribe callback, producing a fresh object each
//      tick that's structurally equal to what consumers see. Falling through
//      to a key-by-key compare lets applyDom hit the cache too.
//
// why: keyed on (source, contrastLevel) — issue #20. buildContrastBundle's
// medium/high tiers derive at canonical 0.5/1.0 against the same source
// reference. With a single-cell cache, tier B evicted tier A on every call;
// with a (source, contrastLevel)-keyed cache they coexist. Cap at 6 covers
// 2 sources × 3 tiers, the worst realistic working set (preview tier +
// medium + high during an open export dialog with a recently-changed seed
// still warm). FIFO eviction (Map insertion order, drop the oldest entry
// when the next miss would overflow) is sufficient for this access pattern;
// LRU's complexity isn't justified at N=6.
//
// Compare iterates Object.keys so new PortableTheme fields flow through
// without edits here, mirroring how selectPortable + partialize stay
// maintenance-free.
//
// Drift-guard (ADR-0017) holds because the cached value IS deriveTheme's
// output for the (source, contrastLevel) pair — applyDom and exporters still
// consume identical {md, shadcn, warnings} maps; we just compute once
// instead of N times.

const MAX_CACHE_SIZE = 6

interface CacheEntry {
  source: PortableTheme
  contrastLevel: number
  derived: DerivedTheme
}

const cache: CacheEntry[] = []

export function getDerivedTheme(source: PortableTheme, contrastLevel?: number): DerivedTheme {
  const level = contrastLevel ?? source.contrastLevel
  for (const entry of cache) {
    if (entry.contrastLevel !== level) continue
    if (entry.source === source) return entry.derived
    if (isShallowEqualPortable(entry.source, source)) return entry.derived
  }
  // why: when caller passes a contrastLevel that differs from the source's
  // own field, the spine call needs the override propagated — deriveTheme
  // reads source.contrastLevel internally, not a separate arg. Spreading is
  // free: deriveTheme doesn't retain the source past return.
  const effectiveSource =
    level === source.contrastLevel ? source : { ...source, contrastLevel: level }
  const derived = deriveTheme(effectiveSource)
  cache.push({ source, contrastLevel: level, derived })
  if (cache.length > MAX_CACHE_SIZE) cache.shift()
  return derived
}

// why: outer-key reference compare. Setters in source.ts always return a new
// outer for any mutated field (e.g. `{...s.md3TokenOverrides, [mode]: next}`),
// so `!==` on a key reliably indicates change. Same comparator model as
// zustand's useShallow.
function isShallowEqualPortable(a: PortableTheme, b: PortableTheme): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  const ar = a as unknown as Record<string, unknown>
  const br = b as unknown as Record<string, unknown>
  for (const key of aKeys) {
    if (ar[key] !== br[key]) return false
  }
  return true
}

// why: test-only seam. Cache is implicit module state; without a reset
// hook, one test's cached result leaks into the next when fixtures overlap.
// Double-underscore prefix marks it as not part of the public surface — not
// re-exported from the package index.
export function __resetDeriveCache(): void {
  cache.length = 0
}
