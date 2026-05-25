'use client'

import { WarningIcon } from '@phosphor-icons/react'
import { cx } from 'tailwind-variants'
import { type createPopoverHandle, PopoverTrigger } from '@/components/ui/popover'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ContrastWarning } from '@/features/contrast-checker/warning'
import { isDarkSwatch } from '@/lib/is-dark-swatch'
import { ContrastWarningTooltipBody } from './contrast-warning-tooltip'

interface ColorTileProps<T> {
  payload: T
  popoverHandle: ReturnType<typeof createPopoverHandle<T>>
  display: string
  hex: string
  overridden: boolean
  warning?: ContrastWarning
  size?: 'sm' | 'md'
}

export function ColorTile<T>({
  payload,
  popoverHandle,
  display,
  hex,
  overridden,
  warning,
  size = 'sm',
}: ColorTileProps<T>) {
  const dark = isDarkSwatch(hex)
  const textColor = dark ? '#ffffff' : '#000000'

  return (
    <PopoverTrigger
      handle={popoverHandle}
      payload={payload}
      className={cx(
        'group relative cursor-pointer rounded-md transition-all m-1 data-popup-open:outline-2 data-popup-open:outline-offset-2 data-popup-open:outline-primary',
        focusVisiblePrimaryRing,
        size === 'sm'
          ? 'outline outline-outline-variant'
          : 'outline outline-outline-variant w-[calc(50%-0.75rem)] sm:w-60',
      )}
    >
      <div
        className={cx(
          'h-20 flex flex-col justify-end p-2 shrink-0 rounded-md',
          size === 'sm' && 'w-36 sm:w-50',
        )}
        style={{ backgroundColor: hex }}
      >
        <p
          className={cx('font-mono leading-tight truncate', size === 'sm' ? 'text-xs' : 'text-sm')}
          style={{ color: textColor }}
        >
          {display}
        </p>
        <p
          className={cx('font-mono', size === 'sm' ? 'text-[10px]' : 'text-xs')}
          style={{ color: textColor }}
        >
          {hex}
        </p>
        {overridden && <div className="absolute top-1 right-1 size-2 rounded-full bg-tertiary" />}
        {warning !== undefined && !warning.passes && !warning.decorative && (
          <Tooltip>
            <TooltipTrigger
              delay={0}
              render={
                <div className="absolute top-1 left-1 flex items-center justify-center size-4 rounded-full bg-error">
                  <WarningIcon className="size-3 text-on-error" weight="fill" />
                </div>
              }
            />
            <TooltipContent variant="inverse" side="top">
              <ContrastWarningTooltipBody warning={warning} />
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </PopoverTrigger>
  )
}
