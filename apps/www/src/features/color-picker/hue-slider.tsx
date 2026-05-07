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

export function HueSlider({ hue, onChange, disabled }: HueSliderProps) {
  const sliderStore = sliderStyles()
  return (
    <SliderRoot
      disabled={disabled}
      thumbAlignment="edge-client-only"
      value={Math.round(hue)}
      max={360}
      step={1}
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
