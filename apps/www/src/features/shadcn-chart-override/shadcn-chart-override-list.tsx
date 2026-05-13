'use client'

import { useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { SHADCN_CHART_TOKEN_NAMES, type ShadcnChartTokenName } from '@tonex/core/schema'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { useActiveMode } from '@/features/theme-mode'
import { ChartEditor } from './chart-editor'
import { ChartSwatch, chartPopoverHandle } from './chart-swatch'

// why: ADR-0027 slice chart-3 — chart override editor surface. Parallel
// component to ShadcnRoleOverrideList (chosen over inlining a Chart group
// into ROLE_GROUPS because token types and theme.shadcn field reads diverge;
// see ADR-0027 c.6 "revisit if grouping is awkward" clause). Reads
// `theme.shadcn.lightChart`/`darkChart` (post-override) so swatches reflect
// the literal pin instantly. SHADCN_CHART_TOKEN_NAMES is flat (no families),
// so renders as a single section.
export function ShadcnChartOverrideList() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const allOverrides = useSource((s) => s.shadcnChartOverrides)

  // why: same two-flag null gate as the role list — theme is source._hydrated,
  // mode is next-themes mounted.
  if (theme === null || mode === null) return null

  const chartLayer = mode === 'light' ? theme.shadcn.lightChart : theme.shadcn.darkChart
  const overrides = allOverrides[mode]
  const hexByToken: Partial<Record<ShadcnChartTokenName, string>> = {}
  for (const token of SHADCN_CHART_TOKEN_NAMES) {
    const argb = chartLayer[token]
    if (argb !== undefined) hexByToken[token] = hexString(argb)
  }

  return (
    <div className="space-y-6 py-6 m-px">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wider mb-2">Chart</p>
        <div className="flex flex-wrap gap-2">
          {SHADCN_CHART_TOKEN_NAMES.map((token) => {
            const hex = hexByToken[token] ?? '#000000'
            return (
              <ChartSwatch key={token} token={token} hex={hex} overridden={token in overrides} />
            )
          })}
        </div>
      </section>

      <Popover handle={chartPopoverHandle}>
        {({ payload: token }) =>
          token !== undefined ? (
            <PopoverContent sideOffset={8} align="start" className="sm:min-w-72">
              <ChartEditor key={token} token={token} mode={mode} />
            </PopoverContent>
          ) : null
        }
      </Popover>
    </div>
  )
}
