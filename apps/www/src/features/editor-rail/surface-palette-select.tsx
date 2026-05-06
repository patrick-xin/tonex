'use client'

import { useSource } from '@tonex/core'
import {
  NEUTRAL_PALETTE_NAMES,
  type NeutralPaletteName,
  TAILWIND_PALETTE_OKLCH,
} from '@tonex/core/data'
import { ChevronsUpDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItemContent,
  SelectTriggerGroup,
} from '@/components/ui/select'

export function SurfacePaletteSelect() {
  const surfacePaletteName = useSource((s) => s.surfacePaletteName)
  const setSurfacePaletteName = useSource((s) => s.actions.setSurfacePaletteName)

  return (
    <Select
      items={NEUTRAL_PALETTE_NAMES.map((name) => ({ label: name, value: name }))}
      value={surfacePaletteName}
      onValueChange={(v) => setSurfacePaletteName(v as NeutralPaletteName)}
    >
      <SelectTriggerGroup
        indicatorIcon={<ChevronsUpDown className="size-3.5" />}
        size="sm"
        variant="ghost"
        className="capitalize data-popup-open:bg-primary/8 text-xs px-2"
        placeholder="Select palette"
      />
      <SelectContent align="start">
        {NEUTRAL_PALETTE_NAMES.map((name) => (
          <SelectItemContent key={name} value={name}>
            <div className="flex items-center gap-2 pl-px">
              <PalettePreview palette={name} />
              <span className="capitalize text-xs">{name}</span>
            </div>
          </SelectItemContent>
        ))}
      </SelectContent>
    </Select>
  )
}

function PalettePreview({ palette }: { palette: NeutralPaletteName }) {
  const shades = TAILWIND_PALETTE_OKLCH[palette] as Record<string, string> | undefined
  if (!shades) return null

  return (
    <div className="flex rounded-sm overflow-hidden ring ring-outline-variant">
      {(['100', '300', '500', '700', '900'] as const).map((shade) => (
        <div key={shade} className="size-3" style={{ backgroundColor: shades[shade] }} />
      ))}
    </div>
  )
}
