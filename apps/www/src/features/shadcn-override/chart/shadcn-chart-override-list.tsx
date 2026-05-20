'use client'

import { useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { SHADCN_CHART_TOKEN_NAMES, type ShadcnChartTokenName } from '@tonex/core/schema'
import { ColorTile } from '@/components/shared/color-tile'
import { SectionHeading } from '@/components/shared/section-heading'
import { createPopoverHandle, Popover, PopoverContent } from '@/components/ui/popover'
import { useActiveMode } from '@/features/theme-mode'
import { ChartEditor } from './chart-editor'

const popoverHandle = createPopoverHandle<ShadcnChartTokenName>()

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

  if (theme === null || mode === null) return null

  const chartLayer = mode === 'light' ? theme.shadcn.lightChart : theme.shadcn.darkChart
  const overrides = allOverrides[mode]
  const hexByToken: Partial<Record<ShadcnChartTokenName, string>> = {}
  for (const token of SHADCN_CHART_TOKEN_NAMES) {
    const argb = chartLayer[token]
    if (argb !== undefined) hexByToken[token] = hexString(argb)
  }

  return (
    <div className="m-px">
      <section>
        <SectionHeading className="mb-2">Chart</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {SHADCN_CHART_TOKEN_NAMES.map((token) => (
            <ColorTile
              key={token}
              payload={token}
              popoverHandle={popoverHandle}
              display={token.slice(2)}
              hex={hexByToken[token] ?? '#000000'}
              overridden={token in overrides}
              size="md"
            />
          ))}
        </div>
      </section>

      <Popover handle={popoverHandle}>
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
