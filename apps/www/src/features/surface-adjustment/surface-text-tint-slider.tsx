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
import { useActiveMode } from '@/features/theme-mode'

// why: opt-in brand text accent (GH #92). A SEPARATE slider from
// SurfaceLevelSlider on purpose — text-tint is decoupled from the surface tint
// level so "neutral surfaces + brand-accented text" is reachable. Rendered only
// under surfaceAlgo='tint' (the only algo that reads surfaceTintTextLevel), so
// unlike SurfaceLevelSlider this one never branches on algo.
export function SurfaceTextTintSlider({ labelClassName }: { labelClassName?: string }) {
  const textLevel = useSource((s) => s.surfaceTintTextLevel)
  const setTextLevel = useSource((s) => s.actions.setSurfaceTintTextLevel)
  const mode = useActiveMode()
  const { track, indicator, thumb, control, root } = sliderStyles({ size: 'sm' })

  // why: pre-mount mode is null. Show the light value disabled rather than
  // unmount — keeps the rail layout stable across the hydration boundary.
  const resolvedMode = mode ?? 'light'
  const isPending = mode === null

  return (
    <SliderRoot
      disabled={isPending}
      thumbAlignment="edge-client-only"
      className={root({ className: 'space-y-3' })}
      format={{ style: 'percent' }}
      min={0}
      max={1}
      step={0.1}
      value={[textLevel[resolvedMode]]}
      onValueChange={(e) => setTextLevel(resolvedMode, Number(e))}
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
            isPending && 'text-on-surface/38',
          )}
        >
          Text accent
        </SliderLabel>
        <SliderValue className={cn('font-mono', labelClassName)} />
      </div>
    </SliderRoot>
  )
}
