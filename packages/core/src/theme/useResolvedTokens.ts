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
  const overrideLight = useSource((s) => s.md3PrimaryContainerOverride.light)
  const overrideDark = useSource((s) => s.md3PrimaryContainerOverride.dark)
  const bindLightPrimary = useSource((s) => s.shadcnRoleBindings.light['--primary'])
  const bindLightFg = useSource((s) => s.shadcnRoleBindings.light['--primary-foreground'])
  const bindDarkPrimary = useSource((s) => s.shadcnRoleBindings.dark['--primary'])
  const bindDarkFg = useSource((s) => s.shadcnRoleBindings.dark['--primary-foreground'])

  return useMemo(() => {
    if (!hydrated) return null
    return deriveTheme({
      version: SCHEMA_VERSION,
      seedHex,
      variant,
      md3PrimaryContainerOverride: { light: overrideLight, dark: overrideDark },
      shadcnRoleBindings: {
        light: { '--primary': bindLightPrimary, '--primary-foreground': bindLightFg },
        dark: { '--primary': bindDarkPrimary, '--primary-foreground': bindDarkFg },
      },
    })
  }, [
    hydrated,
    seedHex,
    variant,
    overrideLight,
    overrideDark,
    bindLightPrimary,
    bindLightFg,
    bindDarkPrimary,
    bindDarkFg,
  ])
}
