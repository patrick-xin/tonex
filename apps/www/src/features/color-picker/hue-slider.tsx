'use client'

import { cx } from 'tailwind-variants'
import {
  SliderControl,
  SliderIndicator,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  sliderStyles,
} from '@/components/ui/slider'

interface HueSliderProps {
  hue: number
  onChange: (hue: number) => void
  disabled?: boolean
}

const HUE_GRADIENT =
  'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'

// why: value passes through as decimal HCT; step=0.01 keeps emissions
// aligned with the underlying precision. Pre-fix `Math.round` + `step={1}`
// snapped to integer hue and round-tripped through hexFromHct, drifting
// seedHex (issue #56). This slider has no inline value display so there's
// no `.toFixed(2)` companion to apply here.
export function HueSlider({ hue, onChange, disabled }: HueSliderProps) {
  const sliderStore = sliderStyles()
  return (
    <SliderRoot
      disabled={disabled}
      thumbAlignment="edge-client-only"
      value={hue}
      max={360}
      step={0.01}
      onValueChange={(v) => onChange(v as unknown as number)}
      className="w-full"
      aria-label="Hue"
    >
      <SliderControl className={cx(sliderStore.control())}>
        <SliderTrack
          className="relative h-2.5 w-full rounded-full"
          style={{ background: HUE_GRADIENT }}
        >
          {/* indicator hidden — the gradient is the visual */}
          <SliderIndicator className="absolute h-full rounded-full opacity-0" />
          <SliderThumb className={cx(sliderStore.thumb(), 'size-4.5')} />
        </SliderTrack>
      </SliderControl>
    </SliderRoot>
  )
}
