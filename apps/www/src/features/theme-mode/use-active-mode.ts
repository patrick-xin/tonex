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
