'use client'

import { useSource } from '@tonex/core'
import { RotateCcwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset'
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
  const untouchContrast = useSource((s) => s.actions.untouchContrast)
  const contrastTouched = useSource((s) => s.contrastTouched)
  const { track, thumb, control, root, indicator } = sliderStyles({ size })

  // why: ADR-0031 #6 — reset is an *un-touch*, not a snap-to-zero. It clears the
  // recorded signal so the next preset supplies its curated contrast; gating on
  // contrastTouched (not value !== 0) means a deliberately-chosen 0 still shows
  // the affordance, and an untouched 0 (the default) hides it.
  const isDirty = contrastTouched

  return (
    <div className="w-full space-y-3">
      <Field name="contrast-level">
        <Fieldset className="gap-2">
          <div className="flex justify-between">
            <FieldsetLegend className="text-sm">Contrast level</FieldsetLegend>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={untouchContrast}
                aria-label="Reset contrast"
                className={isDirty ? '' : 'opacity-0 pointer-events-none'}
              >
                <RotateCcwIcon />
              </Button>
              <span className="font-mono text-xs tabular-nums text-on-surface-variant w-9 text-right">
                {contrastLevel.toFixed(2)}
              </span>
            </div>
          </div>
          <SliderRoot
            thumbAlignment="edge-client-only"
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
        </Fieldset>
      </Field>

      <div className="flex justify-between text-xs text-on-surface-variant mt-1">
        <span>Standard</span>
        <span>Maximum</span>
      </div>
    </div>
  )
}
