'use client'

import type { ShadcnChartTokenName } from '@tonex/core/schema'
import { cx } from 'tailwind-variants'
import { createPopoverHandle, PopoverTrigger } from '@/components/ui/popover'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { isDarkSwatch } from '@/features/color-roles-list/contrast-utils'
import { shadcnChartDisplayName } from './display-name'

// why: ADR-0027 slice chart-3 — parallel chart override surface. Owns its own
// popover handle so the chart picker is independent of the role picker on the
// same page; both can be open against different swatches without colliding.
// No WarningIcon yet — chart-vs-chart pairs are not in CONTRAST_PAIRS today
// (ADR-0025 c.8 extension is a separate slice), so there is nothing to warn
// about. The badge surfaces automatically when chart pairs land in the spine.
export const chartPopoverHandle = createPopoverHandle<ShadcnChartTokenName>()

interface ChartSwatchProps {
  token: ShadcnChartTokenName
  hex: string
  overridden: boolean
}

export function ChartSwatch({ token, hex, overridden }: ChartSwatchProps) {
  const dark = isDarkSwatch(hex)
  const display = shadcnChartDisplayName(token)

  return (
    <PopoverTrigger
      handle={chartPopoverHandle}
      payload={token}
      className={cx(
        'group relative cursor-pointer rounded-md outline-transparent transition-all m-1 data-popup-open:outline-2 data-popup-open:outline-offset-2 data-popup-open:outline-primary',
        focusVisiblePrimaryRing,
      )}
    >
      <div
        className="h-20 w-36 sm:w-50 rounded-lg flex flex-col justify-end p-2 shrink-0"
        style={{ backgroundColor: hex }}
      >
        <p
          className="text-xs font-mono leading-tight truncate"
          style={{ color: dark ? '#ffffff' : '#000000' }}
        >
          {display}
        </p>
        <p className="text-[10px] font-mono" style={{ color: dark ? '#ffffff' : '#000000' }}>
          {hex}
        </p>
        {overridden && <div className="absolute top-1 right-1 size-2 rounded-full bg-tertiary" />}
      </div>
    </PopoverTrigger>
  )
}
