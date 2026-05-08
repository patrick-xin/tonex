'use client'

import { ArrowCounterClockwiseIcon, CaretDownIcon } from '@phosphor-icons/react'
import { useSource } from '@tonex/core'
import { cmfSecondSourceDisabledReason } from '@tonex/core/schema'
import { NativeColorInput } from '@/components/shared/native-color-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

// why: the second source color is a CMF-only knob (other variants ignore the
// param, see cmf-second-source.ts). Surface the disabled reason as a tooltip
// so non-cmf users see *why* the trigger is inert, matching the
// palette-override AnimatedButtonColorPicker pattern. Core's
// setCmfSecondSourceHex no-ops disabled writes — UI is the friendly seam,
// core is the backstop.
export function CmfSecondSourcePicker() {
  const seedHex = useSource((s) => s.seedHex)
  const cmfSecondSourceHex = useSource((s) => s.cmfSecondSourceHex)
  const setCmfSecondSourceHex = useSource((s) => s.actions.setCmfSecondSourceHex)
  const disabledReason = useSource((s) => cmfSecondSourceDisabledReason(s))
  const isDisabled = disabledReason !== null
  const isSet = cmfSecondSourceHex !== null
  // why: when unset, MCU picks its own second source — show the seed as the
  // starting point so opening the popover doesn't surprise with an unrelated
  // default. ADR-0003: hex is the canonical seed representation.
  const formHex = cmfSecondSourceHex ?? seedHex

  const { hexInput, handleChange, inputProps } = useHexFieldState(formHex, setCmfSecondSourceHex)

  const trigger = (
    <PopoverTrigger
      disabled={isDisabled}
      render={
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="CMF second source color"
          className="data-popup-open:bg-primary/8 -ml-px"
        >
          <CaretDownIcon className="size-3.5 rounded-full" />
        </Button>
      }
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
      <PopoverContent className="py-2 w-56" showArrow sideOffset={8}>
        <PopoverDescription className="text-xs mb-2">
          Optional — drives the tertiary palette and nudges the error hue via CMF&apos;s formula.
        </PopoverDescription>
        <div className="flex items-center gap-2">
          <NativeColorInput className="size-8" currentHex={formHex} onColorChange={handleChange} />
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
              <TooltipContent variant="inverse">Reset to MCU default</TooltipContent>
            </Tooltip>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
