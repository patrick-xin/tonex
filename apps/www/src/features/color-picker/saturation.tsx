'use client'

import { cn } from 'tailwind-variants'
import { clamp, type HsvaColor, hsvaToHslString, round } from './color-utils'
import { type Interaction, Interactive } from './interactive'
import { Pointer } from './pointer'

interface Props {
  hsva: HsvaColor
  onChange: (color: { s: number; v: number }) => void
  className?: string
}

export function Saturation({ hsva, onChange, className }: Props) {
  const handleMove = (interaction: Interaction) => {
    onChange({
      s: interaction.left * 100,
      v: 100 - interaction.top * 100,
    })
  }

  const handleKey = (offset: Interaction) => {
    onChange({
      s: clamp(hsva.s + offset.left * 100, 0, 100),
      v: clamp(hsva.v - offset.top * 100, 0, 100),
    })
  }

  const containerStyle = {
    backgroundColor: hsvaToHslString({ h: hsva.h, s: 100, v: 100, a: 1 }),
    backgroundImage:
      'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
  }

  return (
    <div
      className={cn('relative h-40 min-w-66 w-full rounded-lg', className)}
      style={containerStyle}
    >
      <Interactive
        className="absolute inset-0 cursor-pointer rounded-lg"
        onMove={handleMove}
        onKey={handleKey}
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${round(hsva.s)}%, Brightness ${round(hsva.v)}%`}
        aria-valuenow={round(hsva.s)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <Pointer top={1 - hsva.v / 100} left={hsva.s / 100} color={hsvaToHslString(hsva)} />
      </Interactive>
    </div>
  )
}
