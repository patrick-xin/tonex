import { useMemo } from 'react'
import { type DerivedTheme, deriveTheme } from './derive'
import { SCHEMA_VERSION } from './schema'
import { useSource } from './source'

// why: returns null pre-hydration so SSR and the first client render agree.
// Components MUST handle null by rendering placeholders. This is the
// architectural guard that makes Next.js hydration mismatch errors
// structurally impossible — not a runtime check, a contract. ADR-0015.
//
// Each selector returns a primitive so referential equality is automatic
// and useMemo only re-derives when an input field actually changes.
export function useResolvedTokens(): DerivedTheme | null {
  const hydrated = useSource((s) => s._hydrated)
  const seedHex = useSource((s) => s.seedHex)
  const variant = useSource((s) => s.variant)

  return useMemo(() => {
    if (!hydrated) return null
    return deriveTheme({ version: SCHEMA_VERSION, seedHex, variant })
  }, [hydrated, seedHex, variant])
}
