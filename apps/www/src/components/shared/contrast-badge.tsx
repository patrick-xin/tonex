'use client'

import type { ReactElement } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ContrastWarning } from '@/features/contrast-checker/warning'
import { ContrastWarningTooltipBody } from './contrast-warning-tooltip'

interface ContrastBadgeProps {
  warning: ContrastWarning | null
  render?: ReactElement
}

// why: default trigger is a fail-only indicator on the rail row — passing
// and decorative pairs don't add visual noise. Callers supplying `render` are
// state indicators (e.g. role-editor's "Pass / Fail / Exempt" chip) that want
// every state visible; they take responsibility for their own styling and read
// the warning fields to drive it.
export function ContrastBadge({ warning, render }: ContrastBadgeProps) {
  if (warning === null) return null
  if (render === undefined && (warning.passes || warning.decorative)) return null

  const trigger = render ?? (
    <span className="text-xs tabular-nums text-error cursor-help">
      {warning.ratio.toFixed(1)}:1
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger delay={0} render={trigger} />
      <TooltipContent side="top">
        <ContrastWarningTooltipBody warning={warning} />
      </TooltipContent>
    </Tooltip>
  )
}
