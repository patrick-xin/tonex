'use client'

import { useSource } from '@tonex/core'
import { RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  sliderStyles,
} from '@/components/ui/slider'

// why: MCU's contrastLevel range is -1..1 per the spec docstring, but in the
// 2025 and 2026 color specs every ContrastCurve has `low === normal`, so
// negative values are completely inert. tonex runs on 2026, so we clamp the
// UI to 0..1 — there's no point exposing a control that does nothing. Base
// UI Slider needs explicit min/max/step; without them it silently defaults
// to 0..100.
export function ContrastLevelSlider({ size = 'sm' }: { size?: 'sm' | 'default' }) {
  const contrastLevel = useSource((s) => s.contrastLevel)
  const setContrastLevel = useSource((s) => s.actions.setContrastLevel)
  const { track, thumb, control, root, indicator } = sliderStyles({ size })

  const isDirty = contrastLevel !== 0

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-on-surface">Contrast</span>
        <div className="flex items-center gap-0.5">
          <span className="font-mono text-xs tabular-nums text-on-surface-variant w-9 text-right">
            {contrastLevel.toFixed(2)}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setContrastLevel(0)}
            aria-label="Reset contrast to standard"
            className={isDirty ? '' : 'opacity-0 pointer-events-none'}
          >
            <RotateCcwIcon />
          </Button>
        </div>
      </div>
      <SliderRoot
        className={root()}
        min={0}
        max={1}
        step={0.05}
        value={contrastLevel}
        onValueChange={(v) => setContrastLevel(Number(v))}
      >
        <SliderControl className={control()}>
          <SliderTrack className={track()}>
            <SliderIndicator className={indicator()} />
            <SliderThumb className={thumb()} />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>
      <div className="flex justify-between text-[10px] text-on-surface-variant px-0.5">
        <span>Standard</span>
        <span>Maximum</span>
      </div>
    </div>
  )
}
