'use client'

import { useSource } from '@tonex/core'
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
import { useActiveMode } from '@/features/theme-mode'

// why: MCU's contrastLevel range is -1..1 per the spec docstring, but in the
// 2025 and 2026 color specs every ContrastCurve has `low === normal`, so
// negative values are completely inert. tonex runs on 2026, so we clamp the
// UI to 0..1 — there's no point exposing a control that does nothing. Base
// UI Slider needs explicit min/max/step; without them it silently defaults
// to 0..100.
//
// why: contrast is per-mode (#123) — the slider edits whichever mode is
// active, mirroring surface-adjustment. Pre-mount mode is null; resolve to
// light for display and disable the slider until next-themes lands so the
// control's height stays stable across hydration.
export function ContrastLevelSlider({ size = 'sm' }: { size?: 'sm' | 'default' }) {
  const contrastLevel = useSource((s) => s.contrastLevel)
  const setContrastLevel = useSource((s) => s.actions.setContrastLevel)
  const mode = useActiveMode()
  const resolvedMode = mode ?? 'light'
  const level = contrastLevel[resolvedMode]
  const { track, thumb, control, root, indicator } = sliderStyles({ size })

  return (
    <div className="w-full space-y-3">
      <Field name="contrast-level">
        <Fieldset className="gap-2">
          <div className="flex justify-between">
            <FieldsetLegend className="text-sm">Contrast level</FieldsetLegend>
            <span className="font-mono text-xs tabular-nums text-on-surface-variant w-9 text-right">
              {level.toFixed(2)}
            </span>
          </div>
          <SliderRoot
            thumbAlignment="edge-client-only"
            className={root()}
            min={0}
            max={1}
            step={0.05}
            disabled={mode === null}
            value={level}
            onValueChange={(v) => setContrastLevel(resolvedMode, Number(v))}
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
