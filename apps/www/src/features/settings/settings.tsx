'use client'

import { GearSixIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TwPickerEnableToggle } from '@/features/color-picker'
import { ResetButton } from '@/features/reset-button'
import { PresetPicker, PresetSwitchDialog } from '@/features/shadcn-presets'
import { settingsPopoverHandle } from '@/lib/handles'
import type { Layer } from '@/lib/layer-context'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

export function Settings({ layer }: { layer: Layer }) {
  const [isOpen, setIsOpen] = useState(false)
  useHotkey('S', () => setIsOpen((prev) => !prev))
  const showExtended = useUiPrefs((s) => s.showExtended)
  const setShowExtended = useUiPrefs((s) => s.actions.setShowExtended)

  return (
    <>
      <Popover handle={settingsPopoverHandle} open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger
            id="settings"
            render={
              <PopoverTrigger
                render={<Button variant="secondary" size="icon-sm" aria-label="Settings" />}
              >
                <GearSixIcon />
              </PopoverTrigger>
            }
          />
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" className="w-80 flex flex-col gap-2">
          {layer !== 'md' && (
            <>
              <Field name="preset" className="gap-1">
                <FieldLabel className="items-center justify-between w-full">Preset</FieldLabel>
                <FieldDescription className="max-w-5/6">
                  Start from a curated aesthetic recipe.
                </FieldDescription>
                <div className="mt-0.5">
                  <PresetPicker />
                </div>
              </Field>
              <Separator className="opacity-50" />
            </>
          )}
          {layer === 'md' && (
            <>
              <Field name="extended-colors" className="gap-1">
                <FieldLabel className="items-center justify-between w-full">
                  Extended tokens
                  <Switch size="sm" checked={showExtended} onCheckedChange={setShowExtended} />
                </FieldLabel>
                <FieldDescription className="max-w-5/6">
                  Show additional color roles for tokens.
                </FieldDescription>
              </Field>
              <Separator className="opacity-50" />
            </>
          )}
          <TwPickerEnableToggle />
          <Separator className="opacity-50" />
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium leading-snug text-on-surface">
              Reset to defaults
            </span>
            <ResetButton variant="danger" size="sm" onConfirm={() => settingsPopoverHandle.close()}>
              Reset
            </ResetButton>
          </div>
        </PopoverContent>
      </Popover>
      <PresetSwitchDialog />
    </>
  )
}
