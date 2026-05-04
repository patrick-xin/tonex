import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { type DerivedTheme, deriveTheme } from './derive'
import { selectPortable, useSource } from './source'

// why: returns null pre-hydration so SSR and the first client render agree.
// Components MUST handle null by rendering placeholders. This is the
// architectural guard that makes Next.js hydration mismatch errors
// structurally impossible — not a runtime check, a contract. ADR-0015.
//
// Subscription shape: useShallow(selectPortable) gives one stable PortableTheme
// reference across no-op writes — adding a new source field flows through
// selectPortable with no edits here. useMemo keys on the same object so
// deriveTheme runs only when at least one PortableTheme field changes.
export function useResolvedTokens(): DerivedTheme | null {
  const hydrated = useSource((s) => s._hydrated)
  const portable = useSource(useShallow(selectPortable))

  return useMemo(() => {
    if (!hydrated) return null
    return deriveTheme(portable)
  }, [hydrated, portable])
}
