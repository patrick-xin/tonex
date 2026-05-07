'use client'

import { ArrowCounterClockwiseIcon, CaretDownIcon } from '@phosphor-icons/react'
import { useSource } from '@tonex/core'
import { cmfSecondSourceDisabledReason } from '@tonex/core/schema'
import { type VariantGroup, type VariantName, variants } from '@tonex/core/variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { NativeColorInput } from './native-color-input'
import { useHexFieldState } from './use-hex-field-state'

const SCHEME_VARIANT_GROUPS: VariantGroup[] = ['cmf', 'standard', 'expressive', 'subdued']

const GROUP_LABELS: Record<VariantGroup, string> = {
  cmf: 'CMF',
  standard: 'Standard',
  expressive: 'Expressive',
  subdued: 'Subdued',
}

const VARIANT_LABELS: Record<VariantName, string> = {
  cmf: 'CMF',
  tonalSpot: 'Tonal Spot',
  fidelity: 'Fidelity',
  content: 'Content',
  vibrant: 'Vibrant',
  expressive: 'Expressive',
  fruitSalad: 'Fruit Salad',
  rainbow: 'Rainbow',
  neutral: 'Neutral',
  monochrome: 'Monochrome',
}

const VARIANT_NAMES = Object.keys(variants) as VariantName[]

export function SchemeVariantsToggle() {
  const variant = useSource((s) => s.variant)
  const setVariant = useSource((s) => s.actions.setVariant)

  return (
    <div className="flex flex-col gap-3">
      {SCHEME_VARIANT_GROUPS.map((group) => {
        const items = VARIANT_NAMES.filter((v) => variants[v].group === group)
        if (items.length === 0) return null
        return (
          <div key={group} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase font-semibold text-on-surface/60 tracking-wide">
                {GROUP_LABELS[group]}
              </div>
            </div>
            <ToggleGroup
              variant="outline"
              size="xs"
              className="justify-start min-w-6"
              value={[variant]}
              onValueChange={(value) => {
                if (value.length > 0) setVariant(value[0] as VariantName)
              }}
            >
              {items.map((v) => (
                <ToggleGroupItem key={v} value={v} className="px-1.5 gap-0 text-xs">
                  {VARIANT_LABELS[v]}
                  {group === 'cmf' && <CmfSecondSourcePicker />}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )
      })}
    </div>
  )
}

// why: the second source color is a CMF-only knob (other variants ignore the
// param, see cmf-second-source.ts). Surface the disabled reason as a tooltip
// so non-cmf users see *why* the trigger is inert, matching the
// palette-override AnimatedButtonColorPicker pattern. Core's
// setCmfSecondSourceHex no-ops disabled writes — UI is the friendly seam,
// core is the backstop.
function CmfSecondSourcePicker() {
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

  const trigger = (
    <PopoverTrigger
      disabled={isDisabled}
      render={
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="CMF second source color"
          className="data-popup-open:bg-primary/8 ml-1"
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
        <CmfSecondSourceForm
          formHex={formHex}
          isSet={isSet}
          onChange={setCmfSecondSourceHex}
          onReset={() => setCmfSecondSourceHex(null)}
        />
      </PopoverContent>
    </Popover>
  )
}

function CmfSecondSourceForm({
  formHex,
  isSet,
  onChange,
  onReset,
}: {
  formHex: string
  isSet: boolean
  onChange: (hex: string) => void
  onReset: () => void
}) {
  const { hexInput, handleChange, inputProps } = useHexFieldState(formHex, onChange)

  return (
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
              <Button variant="ghost" size="icon-xs" onClick={onReset}>
                <ArrowCounterClockwiseIcon />
              </Button>
            }
          />
          <TooltipContent variant="inverse">Reset to MCU default</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
