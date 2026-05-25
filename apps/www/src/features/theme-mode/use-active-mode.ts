'use client'

import type { Mode } from '@tonex/core'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

// why: two-flag hydration boundary. The source store guards `_hydrated`;
// next-themes guards `mounted`. Both can render `null` pre-mount and only
// flip after the client has reconciled with the persisted/system theme.
// Without this gate, components reading `resolvedTheme` produce different
// markup on SSR (undefined → null) vs first client render (light/dark) —
// a silent hydration mismatch that <html suppressHydrationWarning> does
// NOT cover for subtree text content.
//
// Returns Mode | null. Consumers MUST handle null by rendering
// placeholders, identical contract to useResolvedTokens.
export function useActiveMode(): Mode | null {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return null
  return resolvedTheme
}

// why: ADR-0015 permits next-themes' `setTheme` in event handlers (keypress,
// click) where SSR mismatch is structurally impossible. Co-locating the
// wrapper here keeps next-themes a dep of this one file and gives the
// carve-out a named home — callers don't import `useTheme` directly.
export function useSetMode(): (mode: Mode) => void {
  const { setTheme } = useTheme()
  return (mode) => setTheme(mode)
}

// why: the raw theme *preference* — `'system' | 'light' | 'dark'` — distinct
// from useActiveMode's resolved `Mode`. Cosmetic consumers that mirror the
// user's chosen setting rather than the resolved appearance (the shadcn
// sonner Toaster's `theme` prop) read this. Lives here so next-themes stays
// imported by this one folder (ADR-0015 amendment; issue #128 P3). No
// mounted-guard: the value is presentational, never SSR-critical token
// output, and `'system'` is a safe first-paint default.
export function useThemePreference(): string {
  const { theme = 'system' } = useTheme()
  return theme
}
