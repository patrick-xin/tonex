'use client'

import { GearSixIcon } from '@phosphor-icons/react'
import { selectPortable, useSource } from '@tonex/core'
import {
  CHART_SCHEMES,
  type ChartScheme,
  findActivePreset,
  SHADCN_PRESETS,
  type ShadcnPresetName,
} from '@tonex/core/schema'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ContrastLevelSlider } from '@/features/contrast-level'
import { TwPickerEnableToggle } from '@/features/tw-color-picker'
import type { Layer } from '@/lib/layer-context'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

const CHART_SCHEME_LABELS: Record<ChartScheme, string> = {
  sequential: 'Monochrome',
  categorical: 'Polychrome',
}

const PRESET_NAMES = Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]
const PRESET_GROUP_B: ShadcnPresetName[] = ['soft', 'warm', 'playful']
const PRESET_GROUP_A = PRESET_NAMES.filter((n) => !PRESET_GROUP_B.includes(n))

export function Settings({ layer }: { layer: Layer }) {
  const showExtended = useUiPrefs((s) => s.showExtended)
  const setShowExtended = useUiPrefs((s) => s.actions.setShowExtended)
  const chartScheme = useSource((s) => s.chart.scheme)
  const setChartScheme = useSource((s) => s.actions.setChartScheme)
  const portable = useSource(useShallow(selectPortable))
  const activePreset = findActivePreset(portable)
  const setShadcnPreset = useSource((s) => s.actions.setShadcnPreset)

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
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
        <Field name="preset" className="gap-1">
          <FieldLabel className="items-center justify-between w-full">Preset</FieldLabel>
          <FieldDescription className="max-w-5/6">
            Start from a curated aesthetic recipe.
          </FieldDescription>
          <div className="mt-0.5 flex flex-col gap-1.5">
            {[PRESET_GROUP_A, PRESET_GROUP_B].map((group) => (
              <ToggleGroup
                key={group.join()}
                variant="outline"
                size="xs"
                value={activePreset && group.includes(activePreset) ? [activePreset] : []}
                onValueChange={(value) => {
                  if (value.length === 0) return
                  setShadcnPreset(value[0] as ShadcnPresetName)
                }}
              >
                {group.map((name) => (
                  <ToggleGroupItem className="h-6 capitalize" key={name} value={name}>
                    {name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ))}
          </div>
        </Field>
        <Separator className="opacity-50" />
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
        <ContrastLevelSlider />
        <Separator className="opacity-50" />
        <Field name="chart-scheme" className="gap-1">
          <FieldLabel className="items-center justify-between w-full">Chart palette</FieldLabel>
          <FieldDescription className="max-w-5/6">
            Color each series differently, or use shades of one color.
          </FieldDescription>
          <ToggleGroup
            variant="outline"
            size="xs"
            className="mt-0.5"
            value={[chartScheme]}
            onValueChange={(value) => {
              if (value.length === 0) return
              setChartScheme(value[0] as ChartScheme)
            }}
          >
            {CHART_SCHEMES.map((s) => (
              <ToggleGroupItem className="h-6" key={s} value={s}>
                {CHART_SCHEME_LABELS[s]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      </PopoverContent>
    </Popover>
  )
}
