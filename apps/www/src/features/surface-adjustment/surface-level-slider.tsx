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
import { showsTintZeroHint } from './hints'

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
  const mode = useActiveMode()
  const { track, indicator, thumb, control, root } = sliderStyles({
    size: 'sm',
  })

  // why: pre-mount mode is null. Show the light value disabled rather than
  // unmount — keeps the rail layout stable across the hydration boundary.
  // Once mode resolves, the slider edits the active mode independently.
  const resolvedMode = mode ?? 'light'
  const isPending = mode === null
  const level = algo === 'desaturate' ? desatLevel[resolvedMode] : tintLevel[resolvedMode]
  const setLevel =
    algo === 'desaturate'
      ? (next: number) => setDesatLevel(resolvedMode, next)
      : (next: number) => setTintLevel(resolvedMode, next)
  const defaultLabel = algo === 'desaturate' ? 'Desaturate level' : 'Tint level'

  return (
    <div className="space-y-2">
      <SliderRoot
        disabled={disabled || isPending}
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
              (disabled || isPending) && 'text-on-surface/38',
            )}
          >
            {label ?? defaultLabel}
          </SliderLabel>
          <SliderValue className={cn('font-mono', labelClassName)} />
        </div>
      </SliderRoot>
      {showsTintZeroHint(algo, level) && (
        <p className="text-xs text-on-surface-variant">
          At 0%, Tint still applies the plain neutral palette — switch to Desaturate for untouched
          Material surfaces.
        </p>
      )}
    </div>
  )
}
