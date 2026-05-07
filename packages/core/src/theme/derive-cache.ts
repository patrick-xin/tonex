import { type DerivedTheme, deriveTheme } from './derive'
import type { PortableTheme } from './schema'

// why: deriveTheme is the spine pipeline (Hct + MCU variant.build × 2 +
// applyPaletteOverrides + buildMdLayer × 2 + applyMd3TokenOverrides + surface
// treatment + customColors + bindShadcn). Without a shared cache, every
// useResolvedTokens consumer runs it once per source change AND applyDom
// runs it again — (N+1)× per slider tick. One module-scope cell collapses
// that to 1× per distinct source, regardless of consumer count. Issue #9.
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
// Compare iterates Object.keys so new PortableTheme fields flow through
// without edits here, mirroring how selectPortable + partialize stay
// maintenance-free.
//
// Drift-guard (ADR-0017) holds because the cached value IS deriveTheme's
// output for that source — applyDom and exporters still consume identical
// {md, shadcn, warnings} maps; we just compute once instead of twice.

let cachedSource: PortableTheme | null = null
let cachedDerived: DerivedTheme | null = null

export function getDerivedTheme(source: PortableTheme): DerivedTheme {
  if (cachedSource !== null && cachedDerived !== null) {
    if (cachedSource === source) return cachedDerived
    if (isShallowEqualPortable(cachedSource, source)) return cachedDerived
  }
  const derived = deriveTheme(source)
  cachedSource = source
  cachedDerived = derived
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
  cachedSource = null
  cachedDerived = null
}
