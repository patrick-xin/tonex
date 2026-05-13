'use client'

import { useSource } from '@tonex/core'
import { SURFACE_ALGOS, type SurfaceAlgo } from '@tonex/core/schema'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SurfaceLevelSlider } from './surface-level-slider'
import { SurfacePaletteSelect } from './surface-palette-select'

export const SurfaceAdjustment = ({
  triggerRef,
}: {
  triggerRef?: (el: HTMLDivElement | null) => void
}) => {
  const surfaceAlgo = useSource((s) => s.surfaceAlgo)
  const setSurfaceAlgo = useSource((s) => s.actions.setSurfaceAlgo)
  return (
    <div className="p-2 space-y-3" ref={triggerRef}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-on-surface">Surface adjustment</div>
        <ToggleGroup
          variant="outline"
          size="xs"
          value={[surfaceAlgo]}
          onValueChange={(value) => {
            if (value.length === 0) return
            setSurfaceAlgo(value[0] as SurfaceAlgo)
          }}
        >
          {SURFACE_ALGOS.map((v) => (
            <ToggleGroupItem className="h-6 capitalize" key={v} value={v}>
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="space-y-3">
        <SurfaceLevelSlider labelClassName="text-xs" />
        {surfaceAlgo === 'tint' && <SurfacePaletteSelect />}
      </div>
    </div>
  )
}
