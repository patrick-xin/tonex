'use client'

import { useSource } from '@tonex/core'
import type { SurfaceAlgo } from '@tonex/core/schema'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SurfaceLevelSlider } from './surface-level-slider'
import { SurfacePaletteSelect } from './surface-palette-select'

const ALGOS: ReadonlyArray<SurfaceAlgo> = ['tint', 'desaturate']

export const SurfaceAdjustment = ({
  triggerRef,
}: {
  triggerRef?: (el: HTMLDivElement | null) => void
}) => {
  const surfaceAlgo = useSource((s) => s.surfaceAlgo)
  const setSurfaceAlgo = useSource((s) => s.actions.setSurfaceAlgo)
  return (
    <div className="space-y-3" ref={triggerRef}>
      <div className="flex flex-row justify-between items-center">
        <div className="leading-snug font-medium select-none transition-colors text-on-surface text-sm">
          Surface Adjustment
        </div>
        <ToggleGroup
          variant="outline"
          size="xs"
          value={[surfaceAlgo]}
          onValueChange={(value) => {
            if (value.length === 0) return
            setSurfaceAlgo(value[0] as SurfaceAlgo)
          }}
        >
          {ALGOS.map((v) => (
            <ToggleGroupItem className="h-6" key={v} value={v}>
              {v}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div>
        <SurfaceLevelSlider labelClassName="text-xs" />

        <div className="-mx-2 mt-3">{surfaceAlgo === 'tint' && <SurfacePaletteSelect />}</div>
      </div>
    </div>
  )
}
