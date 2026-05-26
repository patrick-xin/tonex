'use client'

import { GearSixIcon, TrashIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TwPickerEnableToggle } from '@/features/color-picker'
import { ResetButton } from '@/features/reset-button'
import { settingsPopoverHandle } from '@/lib/handles'
import type { Layer } from '@/lib/layer-context'
import { useUiPrefs } from '@/lib/stores/ui-prefs'
import { toggleSettingsPopover } from './toggle-popover'

export function Settings({ layer }: { layer: Layer }) {
  // why: handle-driven (uncontrolled). The handle's singleton store is the
  // single source of truth, so the command menu, the `S` hotkey and ResetButton
  // all act through it. Binding a controlled `open` prop here would tie that
  // shared store to per-mount React state, which thrashes when NavTabs remounts
  // on route changes — the "unstable / sometimes can't open" bug.
  useHotkey('S', () => toggleSettingsPopover(settingsPopoverHandle))
  // Leave the shared store closed when this instance unmounts (route change), so
  // the next mount never inherits a stale open state anchored to a gone trigger.
  useEffect(() => () => settingsPopoverHandle.close(), [])
  const showExtended = useUiPrefs((s) => s.showExtended)
  const setShowExtended = useUiPrefs((s) => s.actions.setShowExtended)

  return (
    <Popover handle={settingsPopoverHandle}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              id="settings"
              render={<Button variant="secondary" size="icon-sm" aria-label="Settings" />}
            >
              <GearSixIcon />
            </PopoverTrigger>
          }
        />
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
      <PopoverContent
        align="center"
        className="w-[min(20rem,calc(100vw-2rem))] flex flex-col gap-2"
      >
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
          <div>
            <span className="text-sm font-medium leading-snug text-on-surface">Reset</span>
            <p className="text-xs text-on-surface-variant">Reset current theme to app's default</p>
          </div>

          <ResetButton
            variant="danger"
            size="icon-xs"
            onConfirm={() => settingsPopoverHandle.close()}
          >
            <TrashIcon />
          </ResetButton>
        </div>
      </PopoverContent>
    </Popover>
  )
}
