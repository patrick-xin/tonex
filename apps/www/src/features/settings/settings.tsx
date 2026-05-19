'use client'

import { GearSixIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { selectPortable, useSource } from '@tonex/core'
import {
  findActivePreset,
  HUE_SPREAD_DEFAULT,
  SHADCN_PRESETS,
  type ShadcnPresetName,
} from '@tonex/core/schema'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TwPickerEnableToggle } from '@/features/color-picker'
import { ContrastLevelSlider } from '@/features/contrast-level'
import { PresetSwitchDialog, requestPresetSwitch } from '@/features/shadcn-preset-switch'
import { settingsPopoverHandle } from '@/lib/handles'
import type { Layer } from '@/lib/layer-context'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

const CHART_PALETTE_VALUES = ['single', 'multi', 'polychrome'] as const
type ChartPaletteValue = (typeof CHART_PALETTE_VALUES)[number]

const CHART_PALETTE_LABELS: Record<ChartPaletteValue, string> = {
  single: 'Single hue',
  multi: 'Multi hue',
  polychrome: 'Polychrome',
}

const PRESET_NAMES = Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]
const PRESET_GROUP_B: ShadcnPresetName[] = ['soft', 'warm', 'playful']
const PRESET_GROUP_A = PRESET_NAMES.filter((n) => !PRESET_GROUP_B.includes(n))

export function Settings({ layer }: { layer: Layer }) {
  const [isOpen, setIsOpen] = useState(false)
  useHotkey('S', () => setIsOpen((prev) => !prev))
  const showExtended = useUiPrefs((s) => s.showExtended)
  const setShowExtended = useUiPrefs((s) => s.actions.setShowExtended)
  const chartScheme = useSource((s) => s.chart.scheme)
  const chartHueSpread = useSource((s) => s.chart.hueSpread)
  const setChartScheme = useSource((s) => s.actions.setChartScheme)
  const setChartHueSpread = useSource((s) => s.actions.setChartHueSpread)
  const portable = useSource(useShallow(selectPortable))
  const activePreset = findActivePreset(portable)

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
                <div className="mt-0.5 flex flex-col gap-1.5">
                  {[PRESET_GROUP_A, PRESET_GROUP_B].map((group) => (
                    <ToggleGroup
                      key={group.join()}
                      variant="outline"
                      size="xs"
                      value={activePreset && group.includes(activePreset) ? [activePreset] : []}
                      onValueChange={(value) => {
                        if (value.length === 0) return
                        requestPresetSwitch(value[0] as ShadcnPresetName)
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
          <ContrastLevelSlider />
          <Separator className="opacity-50" />
          <Field name="chart-scheme" className="gap-1">
            <FieldLabel className="items-center justify-between w-full">Chart palette</FieldLabel>
            <FieldDescription className="max-w-5/6">
              Shades of one hue, multi-hue rotation, or fully distinct colors.
            </FieldDescription>
            <ToggleGroup
              variant="outline"
              size="xs"
              className="mt-0.5"
              value={[
                chartScheme === 'categorical'
                  ? 'polychrome'
                  : chartHueSpread === 0
                    ? 'single'
                    : 'multi',
              ]}
              onValueChange={(value) => {
                if (value.length === 0) return
                const next = value[0] as ChartPaletteValue
                if (next === 'polychrome') {
                  setChartScheme('categorical')
                  return
                }
                setChartScheme('sequential')
                if (next === 'single') {
                  setChartHueSpread(0)
                } else if (chartHueSpread === 0) {
                  setChartHueSpread(HUE_SPREAD_DEFAULT)
                }
              }}
            >
              {CHART_PALETTE_VALUES.map((v) => (
                <ToggleGroupItem className="h-6" key={v} value={v}>
                  {CHART_PALETTE_LABELS[v]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Field>
        </PopoverContent>
      </Popover>
      <PresetSwitchDialog />
    </>
  )
}
