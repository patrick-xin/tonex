'use client'

import { useSource } from '@tonex/core'
import { cn } from 'tailwind-variants'
import {
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderValue,
  sliderStyles,
} from '@/components/ui/slider'

export function SurfaceLevelSlider({
  disabled,
  label,
  labelClassName,
}: {
  disabled?: boolean
  label?: string
  labelClassName?: string
}) {
  const algo = useSource((s) => s.surfaceAlgo)
  const tintLevel = useSource((s) => s.surfaceTintLevel)
  const desatLevel = useSource((s) => s.surfaceDesaturateLevel)
  const setTintLevel = useSource((s) => s.actions.setSurfaceTintLevel)
  const setDesatLevel = useSource((s) => s.actions.setSurfaceDesaturateLevel)
  const { track, indicator, thumb, control, root } = sliderStyles({
    size: 'sm',
  })

  const level = algo === 'desaturate' ? desatLevel : tintLevel
  const setLevel = algo === 'desaturate' ? setDesatLevel : setTintLevel
  const defaultLabel = algo === 'desaturate' ? 'Desaturate Level' : 'Tint Level'

  return (
    <SliderRoot
      disabled={disabled}
      thumbAlignment="edge-client-only"
      className={root({ className: 'space-y-3' })}
      format={{ style: 'percent' }}
      min={0}
      max={1}
      step={0.1}
      value={[level]}
      onValueChange={(e) => setLevel(Number(e))}
    >
      <SliderControl className={control()}>
        <SliderTrack className={track()}>
          <SliderIndicator className={indicator()} />
          <SliderThumb className={thumb()} />
        </SliderTrack>
      </SliderControl>
      <div className="flex w-full justify-between">
        <SliderLabel
          className={cn(
            'text-sm capitalize text-on-surface-variant',
            labelClassName,
            disabled && 'text-on-surface/38',
          )}
        >
          {label ?? defaultLabel}
        </SliderLabel>
        <SliderValue className={cn('font-mono', labelClassName)} />
      </div>
    </SliderRoot>
  )
}
