'use client'

import { GearSixIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { settingsPopoverHandle } from '@/lib/handles'
import type { Layer } from '@/lib/layer-context'
import { SettingsFields } from './settings-fields'
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
        <TooltipContent>
          <div className="flex items-center gap-1">
            Settings
            <Kbd>S</Kbd>
          </div>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        align="center"
        className="w-[min(20rem,calc(100vw-2rem))] flex flex-col gap-2"
      >
        <SettingsFields layer={layer} onAfterReset={() => settingsPopoverHandle.close()} />
      </PopoverContent>
    </Popover>
  )
}
