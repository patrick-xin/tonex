'use client'

import { ArrowCounterClockwiseIcon, CaretDownIcon } from '@phosphor-icons/react'
import { selectSeedHex } from '@tonex/core'
import { cmfSecondSourceDisabledReason, findActivePreset } from '@tonex/core/schema'
import { selectPortable, useSource } from '@tonex/core-react'
import { cn } from 'tailwind-variants'
import { useShallow } from 'zustand/react/shallow'
import { HctColorPicker } from '@/components/shared/hct-color-picker'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLayer } from '@/lib/layer-context'
import { presetUsesTertiary } from './hints'

// why: the second source color is a CMF-only knob (other variants ignore the
// param, see variants/cmf-second-source.ts). Surface the disabled reason as a tooltip
// so non-cmf users see *why* the trigger is inert. Core's
// setCmfSecondSourceHex no-ops disabled writes — UI is the friendly seam,
// core is the backstop.
export function CmfSecondSourcePicker({ className }: { className?: string }) {
  const seedHex = useSource(selectSeedHex)
  const cmfSecondSourceHex = useSource((s) => s.cmfSecondSourceHex)
  const setCmfSecondSourceHex = useSource((s) => s.actions.setCmfSecondSourceHex)
  const disabledReason = useSource((s) => cmfSecondSourceDisabledReason(s))
  const isDisabled = disabledReason !== null
  const isSet = cmfSecondSourceHex !== null
  // why: when unset, MCU picks its own second source — show the seed hex
  // projection as the starting point so opening the popover doesn't surprise
  // with an unrelated default. ADR-0028: seedHex is derived from the canonical
  // HCT via selectSeedHex (preserves user's pasted bytes when present).
  const formHex = cmfSecondSourceHex ?? seedHex

  // why: the second source drives the tertiary palette. On md that's always a
  // visible role; on shadcn it only reaches the export if the active preset
  // binds a role to a --color-tertiary* token (Finding 2). Tell the truth per
  // layer + preset so a shadcn user on a non-tertiary preset isn't left
  // wondering why nothing changed — depth lives in the cmf-no-effect-shadcn Q&A.
  const layer = useLayer()
  const portable = useSource(useShallow(selectPortable))
  const activePreset = findActivePreset(portable)
  const description =
    layer === 'md'
      ? 'Drives the tertiary color palette.'
      : presetUsesTertiary(activePreset)
        ? 'Drives the tertiary palette — current preset maps it onto accent and border roles.'
        : "Drives the tertiary palette, current preset doesn't use it"

  const trigger = (
    <PopoverTrigger
      disabled={isDisabled}
      render={
        <div
          className={cn(
            'flex items-center',
            isDisabled && 'bg-transparent! border-outline-variant! cursor-not-allowed',
            className,
          )}
        >
          <CaretDownIcon className="size-3" />
        </div>
      }
      nativeButton={false}
    />
  )

  return (
    <Popover>
      {isDisabled ? (
        <Tooltip>
          <TooltipTrigger delay={100} render={trigger} />
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <PopoverContent className="w-72" showArrow sideOffset={8}>
        <div className="mb-2 flex items-start justify-between gap-2">
          <PopoverDescription className="text-xs">{description}</PopoverDescription>
          {isSet && (
            <Tooltip>
              <TooltipTrigger
                delay={100}
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="-mt-1 shrink-0"
                    onClick={() => setCmfSecondSourceHex(null)}
                  >
                    <ArrowCounterClockwiseIcon />
                  </Button>
                }
              />
              <TooltipContent>Reset</TooltipContent>
            </Tooltip>
          )}
        </div>
        <HctColorPicker value={formHex} onChange={setCmfSecondSourceHex} />
      </PopoverContent>
    </Popover>
  )
}
