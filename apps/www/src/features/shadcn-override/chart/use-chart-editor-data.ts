'use client'

import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { ShadcnChartTokenName } from '@tonex/core/schema'
import type { ContrastBadgeData } from '@/components/shared/contrast-badge'

export function useChartEditorData(token: ShadcnChartTokenName, mode: Mode) {
  const theme = useResolvedTokens()
  const overrides = useSource((s) => s.shadcnChartOverrides[mode])
  const customColors = useSource((s) => s.customColors)

  const chartLayer =
    theme === null ? null : mode === 'light' ? theme.shadcn.lightChart : theme.shadcn.darkChart
  const argb = chartLayer?.[token]
  // why: '#000000' fallback fires only if theme is null (popover re-render
  // pre-hydration) or the token somehow drops out of the closed enum.
  const currentHex = argb !== undefined ? hexString(argb) : '#000000'

  // why: chart tokens evaluate against multiple bg partners (--background, --card).
  // Badge surfaces the worst (min) ratio's partner + threshold; `passes` ANDs
  // across all partners so the badge fails if any partner does.
  let contrast: ContrastBadgeData | null = null
  if (theme !== null) {
    const pairs = evaluateThemeContrast(theme, customColors)[mode].filter(
      (r) => r.pair.layer === 'shadcn-chart' && r.pair.fg === token,
    )
    if (pairs.length > 0) {
      const worst = pairs.reduce((acc, r) => (r.ratio < acc.ratio ? r : acc))
      contrast = {
        ratio: worst.ratio,
        passes: pairs.every((r) => r.passes),
        partner: worst.pair.bg,
        threshold: worst.pair.threshold,
      }
    }
  }

  return {
    currentHex,
    overridden: token in overrides,
    contrast,
  }
}
