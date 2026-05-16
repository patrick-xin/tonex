'use client'

import type { ReactElement } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export interface ContrastBadgeData {
  ratio: number
  passes: boolean
  partner: string
  threshold: number
  decorative?: boolean
}

interface ContrastBadgeProps {
  contrast: ContrastBadgeData | null
  render?: ReactElement
}

export function ContrastBadge({ contrast, render }: ContrastBadgeProps) {
  if (contrast === null) return null
  if (render === undefined && contrast.passes) return null

  const partnerLabel = contrast.partner.replace(/^--(?:color-)?/, '')
  const trigger = render ?? (
    <span className="text-xs tabular-nums text-error cursor-help">
      {contrast.ratio.toFixed(1)}:1
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger delay={0} render={trigger} />
      <TooltipContent variant="inverse" side="top">
        <p className="text-xs">
          {contrast.decorative
            ? 'Decorative pair (exempt)'
            : contrast.passes
              ? 'Contrast'
              : 'Fails contrast'}{' '}
          against <span className="font-mono">{partnerLabel}</span>
        </p>
        <p className="text-xs">
          {contrast.ratio.toFixed(1)}:1
          {!contrast.decorative && ` (needs ${contrast.threshold}:1)`}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
