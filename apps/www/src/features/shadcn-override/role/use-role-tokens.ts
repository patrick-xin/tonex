'use client'

import { evaluateThemeContrast } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { SHADCN_ROLE_NAMES, type ShadcnRoleName } from '@tonex/core/schema'
import { useResolvedTokens, useSource } from '@tonex/core-react'
import { type ContrastWarning, toContrastWarning } from '@/features/contrast-checker/warning'
import { useActiveMode } from '@/features/theme-mode'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

// why: data prep for the role override grid. Returns null until both hydration
// flags resolve (theme = source._hydrated, mode = next-themes mounted) — the
// list renders nothing in that window. The contrast walk reads the same
// memoized ContrastReport the editor reads (ADR-0025 c.8), so extracting here
// doesn't double the work.
export function useRoleTokens() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const allOverrides = useSource((s) => s.shadcnRoleOverrides)
  const brandEnabled = useUiPrefs((s) => s.brandEnabled)

  if (theme === null || mode === null) return null

  const shadcnLayer = theme.shadcn[mode]
  const overrides = allOverrides[mode]
  const hexByRole: Partial<Record<ShadcnRoleName, string>> = {}
  for (const name of SHADCN_ROLE_NAMES) {
    const argb = shadcnLayer[name]
    if (argb !== undefined) hexByRole[name] = hexString(argb)
  }

  const report = evaluateThemeContrast(theme)
  const warnings = new Map<ShadcnRoleName, ContrastWarning>()
  for (const result of report[mode]) {
    if (result.pair.layer !== 'shadcn' || result.passes) continue
    warnings.set(result.pair.fg as ShadcnRoleName, toContrastWarning(result))
  }

  const brandTokens = brandEnabled
    ? [
        {
          name: '--brand',
          display: 'brand',
          hex: hexString(theme.shadcn.brand['--brand'] as number),
        },
        {
          name: '--brand-foreground',
          display: 'brand-foreground',
          hex: hexString(theme.shadcn.brand['--brand-foreground'] as number),
        },
      ]
    : null

  return { mode, hexByRole, warnings, overrides, brandTokens }
}
