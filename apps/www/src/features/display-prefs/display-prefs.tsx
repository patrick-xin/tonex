'use client'

import { EyeIcon } from '@phosphor-icons/react'
import { useSource } from '@tonex/core'
import { CHART_MODES, type ChartMode } from '@tonex/core/schema'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

export function DisplayPrefs() {
  const showExtended = useUiPrefs((s) => s.showExtended)
  const setShowExtended = useUiPrefs((s) => s.actions.setShowExtended)
  const chartMode = useSource((s) => s.chartMode)
  const setChartMode = useSource((s) => s.actions.setChartMode)

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button variant="secondary" size="icon-sm" aria-label="Display Preferences" />
              }
            >
              <EyeIcon />
            </PopoverTrigger>
          }
        />
        <TooltipContent>Display Preferences</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-60">
        <p className="text-xs text-on-surface-variant mb-3 font-medium">Display</p>
        <div className="flex items-center gap-2 mb-3">
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
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs select-none">Chart palette</Label>
          <ToggleGroup
            variant="outline"
            size="xs"
            value={[chartMode]}
            onValueChange={(value) => {
              if (value.length === 0) return
              setChartMode(value[0] as ChartMode)
            }}
          >
            {CHART_MODES.map((m) => (
              <ToggleGroupItem className="h-6 capitalize" key={m} value={m}>
                {m}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}
