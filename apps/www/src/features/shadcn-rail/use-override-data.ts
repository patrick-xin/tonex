'use client'

import { evaluateThemeContrast, useResolvedTokens } from '@tonex/core'
import type { ShadcnChartTokenName, ShadcnRoleName } from '@tonex/core/schema'
import { type ContrastWarning, toContrastWarning } from '@/features/contrast-checker/warning'
import { useActiveMode } from '@/features/theme-mode'

// why: rail-local grid hook. Page surfaces (ShadcnRoleOverrideList, ChartList)
// have their own hooks because their data shape diverges — pages render
// swatches with worst-pair warnings via `useRoleTokens`, the rail renders
// dense rows with full contrast warnings (incl. threshold). One walk per render
// keyed off DerivedTheme reference; rows read from the maps in O(1).
export function useOverrideData() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  if (theme === null || mode === null) return null

  const report = evaluateThemeContrast(theme)

  const roleContrastByRole = new Map<ShadcnRoleName, ContrastWarning>()
  for (const r of report[mode]) {
    if (r.pair.layer !== 'shadcn') continue
    roleContrastByRole.set(r.pair.fg as ShadcnRoleName, toContrastWarning(r))
  }

  // why: chart tokens have multiple partner backgrounds (--background, --card)
  // unlike roles which evaluate against a single partner. Warning surfaces the
  // worst (min) ratio's partner + threshold; `passes` ANDs across all partners
  // so the badge fails if any partner does — `{ ...toContrastWarning(r), passes }`
  // overrides the single-pair `passes` from the helper with the aggregated one.
  const chartContrastByToken = new Map<ShadcnChartTokenName, ContrastWarning>()
  for (const r of report[mode]) {
    if (r.pair.layer !== 'shadcn-chart') continue
    const token = r.pair.fg as ShadcnChartTokenName
    const existing = chartContrastByToken.get(token)
    const passes = (existing?.passes ?? true) && r.passes
    if (existing === undefined || r.ratio < existing.ratio) {
      chartContrastByToken.set(token, { ...toContrastWarning(r), passes })
    } else {
      chartContrastByToken.set(token, { ...existing, passes })
    }
  }

  const chartLayer = mode === 'light' ? theme.shadcn.lightChart : theme.shadcn.darkChart

  return {
    mode,
    roleLayer: theme.shadcn[mode],
    chartLayer,
    roleContrastByRole,
    chartContrastByToken,
  }
}
