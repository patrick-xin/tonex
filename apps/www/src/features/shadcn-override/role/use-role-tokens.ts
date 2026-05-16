'use client'

import { evaluateThemeContrast, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { SHADCN_ROLE_NAMES, type ShadcnRoleName } from '@tonex/core/schema'
import { useActiveMode } from '@/features/theme-mode'

// why: data prep for the role override grid. Returns null until both hydration
// flags resolve (theme = source._hydrated, mode = next-themes mounted) — the
// list renders nothing in that window. The contrast walk reads the same
// memoized ContrastReport the editor reads (ADR-0025 c.8), so extracting here
// doesn't double the work.
export function useRoleTokens() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const allOverrides = useSource((s) => s.shadcnRoleOverrides)

  if (theme === null || mode === null) return null

  const shadcnLayer = theme.shadcn[mode]
  const overrides = allOverrides[mode]
  const hexByRole: Partial<Record<ShadcnRoleName, string>> = {}
  for (const name of SHADCN_ROLE_NAMES) {
    const argb = shadcnLayer[name]
    if (argb !== undefined) hexByRole[name] = hexString(argb)
  }

  const report = evaluateThemeContrast(theme)
  const warnings = new Map<ShadcnRoleName, { partner: ShadcnRoleName; ratio: number }>()
  for (const result of report[mode]) {
    if (result.pair.layer !== 'shadcn' || result.passes) continue
    warnings.set(result.pair.fg as ShadcnRoleName, {
      partner: result.pair.bg as ShadcnRoleName,
      ratio: result.ratio,
    })
  }

  return { mode, hexByRole, warnings, overrides }
}
