'use client'

import { EyeIcon } from '@phosphor-icons/react'
import { useSource } from '@tonex/core'
import { CHART_SCHEMES, type ChartScheme } from '@tonex/core/schema'
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
  const chartScheme = useSource((s) => s.chart.scheme)
  const setChartScheme = useSource((s) => s.actions.setChartScheme)

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button variant="secondary" size="icon-sm" aria-label="Display preferences" />
              }
            >
              <EyeIcon />
            </PopoverTrigger>
          }
        />
        <TooltipContent>Display preferences</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-60">
        <p className="text-xs text-on-surface-variant mb-3 font-medium">Display preferences</p>
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
            value={[chartScheme]}
            onValueChange={(value) => {
              if (value.length === 0) return
              setChartScheme(value[0] as ChartScheme)
            }}
          >
            {CHART_SCHEMES.map((s) => (
              <ToggleGroupItem className="h-6 capitalize" key={s} value={s}>
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}
