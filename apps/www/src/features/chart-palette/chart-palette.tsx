'use client'

import {
  CHART_PALETTES,
  type ChartPalette,
  chartInputsToPalette,
  chartPaletteToInputs,
} from '@tonex/core/schema'
import { useSource } from '@tonex/core-react'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// why: presentation labels only — the picklist itself (CHART_PALETTES) and the
// label↔inputs mapping live in core, shared with the CLI's --chart-palette flag
// so the two surfaces speak one vocabulary (no duplicated hueSpread constants).
const CHART_PALETTE_LABELS: Record<ChartPalette, string> = {
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
        value={[chartInputsToPalette({ scheme: chartScheme, hueSpread: chartHueSpread })]}
        onValueChange={(value) => {
          if (value.length === 0) return
          const inputs = chartPaletteToInputs(value[0] as ChartPalette)
          setChartScheme(inputs.scheme)
          setChartHueSpread(inputs.hueSpread)
        }}
      >
        {CHART_PALETTES.map((v) => (
          <ToggleGroupItem className="h-6" key={v} value={v}>
            {CHART_PALETTE_LABELS[v]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Field>
  )
}
