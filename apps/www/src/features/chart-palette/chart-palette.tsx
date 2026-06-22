'use client'

import { HUE_SPREAD_DEFAULT } from '@tonex/core/schema'
import { useSource } from '@tonex/core-react'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const CHART_PALETTE_VALUES = ['single', 'multi', 'polychrome'] as const
type ChartPaletteValue = (typeof CHART_PALETTE_VALUES)[number]

const CHART_PALETTE_LABELS: Record<ChartPaletteValue, string> = {
  single: 'Single hue',
  multi: 'Multi hue',
  polychrome: 'Polychrome',
}

export function ChartPaletteToggle() {
  const chartScheme = useSource((s) => s.chart.scheme)
  const chartHueSpread = useSource((s) => s.chart.hueSpread)
  const setChartScheme = useSource((s) => s.actions.setChartScheme)
  const setChartHueSpread = useSource((s) => s.actions.setChartHueSpread)

  return (
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
          chartScheme === 'categorical' ? 'polychrome' : chartHueSpread === 0 ? 'single' : 'multi',
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
  )
}
