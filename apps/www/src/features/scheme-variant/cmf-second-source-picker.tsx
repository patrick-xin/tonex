'use client'

import { ArrowCounterClockwiseIcon, CaretDownIcon } from '@phosphor-icons/react'
import { selectPortable, selectSeedHex, useSource } from '@tonex/core'
import { cmfSecondSourceDisabledReason, findActivePreset } from '@tonex/core/schema'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ColorPicker } from '@/features/color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { useLayer } from '@/lib/layer-context'
import { presetUsesTertiary } from './hints'

// why: the second source color is a CMF-only knob (other variants ignore the
// param, see variants/cmf-second-source.ts). Surface the disabled reason as a tooltip
// so non-cmf users see *why* the trigger is inert, matching the
// palette-override AnimatedButtonColorPicker pattern. Core's
// setCmfSecondSourceHex no-ops disabled writes — UI is the friendly seam,
// core is the backstop.
export function CmfSecondSourcePicker() {
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

  const { hexInput, handleChange, inputProps } = useHexFieldState(formHex, setCmfSecondSourceHex)

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
        ? 'Drives the tertiary palette — your current preset maps it onto accent and border roles.'
        : "Drives the tertiary palette, but your current shadcn preset doesn't use tertiary — switch to a tertiary-driven preset (e.g. Playful) or the md layer to see it. Press H for details."

  const trigger = (
    <PopoverTrigger
      disabled={isDisabled}
      render={
        <div className="flex items-center">
          <CaretDownIcon className="size-3" />
        </div>
      }
      nativeButton={false}
      className="ml-0.5"
    />
  )

  return (
    <Popover>
      {isDisabled ? (
        <Tooltip>
          <TooltipTrigger delay={100} render={trigger} />
          <TooltipContent variant="inverse">{disabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <PopoverContent className="py-2 w-56" showArrow sideOffset={14}>
        <PopoverDescription className="text-xs mb-2">{description}</PopoverDescription>
        <div className="flex items-center gap-2">
          <ColorPicker value={formHex} onChange={handleChange} align="start" />
          <Input
            className="font-mono w-full"
            inputSize="sm"
            type="text"
            value={hexInput}
            onChange={(e) => handleChange(e.target.value)}
            {...inputProps}
            maxLength={7}
            spellCheck={false}
            placeholder="#rrggbb"
          />
          {isSet && (
            <Tooltip>
              <TooltipTrigger
                delay={100}
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setCmfSecondSourceHex(null)}
                  >
                    <ArrowCounterClockwiseIcon />
                  </Button>
                }
              />
              <TooltipContent variant="inverse">Reset</TooltipContent>
            </Tooltip>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
