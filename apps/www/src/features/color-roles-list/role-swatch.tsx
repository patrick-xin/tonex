'use client'

import { WarningIcon } from '@phosphor-icons/react'
import type { MdTokenName } from '@tonex/core/schema'
import { cx } from 'tailwind-variants'
import { createPopoverHandle, PopoverTrigger } from '@/components/ui/popover'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { isDarkSwatch, roleDisplayName } from './contrast-utils'

// why: shared handle so all role swatches drive ONE popover. Opening a
// different role slides the editor into a fresh `key={role}` instance —
// state is per-role, layout is shared. Mirrors palette-override's pattern.
export const popoverHandle = createPopoverHandle<MdTokenName>()

interface RoleSwatchProps {
  role: MdTokenName
  hex: string
  warning: { partner: MdTokenName; ratio: number } | undefined
  overridden: boolean
}

export function RoleSwatch({ role, hex, warning, overridden }: RoleSwatchProps) {
  const dark = isDarkSwatch(hex)
  const display = roleDisplayName(role)

  return (
    <PopoverTrigger
      handle={popoverHandle}
      payload={role}
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
        {warning !== undefined && (
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
              <p className="text-xs">
                Fails WCAG AA against{' '}
                <span className="font-mono">{roleDisplayName(warning.partner)}</span>
              </p>
              <p className="text-xs">{warning.ratio.toFixed(1)}:1 (needs 4.5:1)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </PopoverTrigger>
  )
}
