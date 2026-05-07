import { useShallow } from 'zustand/react/shallow'
import type { DerivedTheme } from './derive'
import { getDerivedTheme } from './derive-cache'
import { selectPortable, useSource } from './source'

// why: returns null pre-hydration so SSR and the first client render agree.
// Components MUST handle null by rendering placeholders. This is the
// architectural guard that makes Next.js hydration mismatch errors
// structurally impossible — not a runtime check, a contract. ADR-0015.
//
// Subscription shape: useShallow(selectPortable) gives one stable PortableTheme
// reference across no-op writes — adding a new source field flows through
// selectPortable with no edits here. getDerivedTheme then memoizes at module
// scope so all consumers share one derive per source change instead of
// running the spine pipeline once per hook call. Issue #9.
export function useResolvedTokens(): DerivedTheme | null {
  const hydrated = useSource((s) => s._hydrated)
  const portable = useSource(useShallow(selectPortable))

  if (!hydrated) return null
  return getDerivedTheme(portable)
}
