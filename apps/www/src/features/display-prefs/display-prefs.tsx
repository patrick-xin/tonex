'use client'

import { EyeIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

export function DisplayPrefs() {
  const showExtended = useUiPrefs((s) => s.showExtended)
  const setShowExtended = useUiPrefs((s) => s.actions.setShowExtended)

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Display" />}>
              <EyeIcon />
            </PopoverTrigger>
          }
        />
        <TooltipContent>Display</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-52">
        <p className="text-xs text-on-surface-variant mb-3 font-medium">Display</p>
        <div className="flex items-center gap-2">
          <Switch
            id="display-show-extended"
            size="sm"
            checked={showExtended}
            onCheckedChange={setShowExtended}
          />
          <Label htmlFor="display-show-extended" className="text-xs cursor-pointer select-none">
            Show extended tokens
          </Label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
