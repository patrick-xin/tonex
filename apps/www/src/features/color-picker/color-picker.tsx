'use client'

import type { ChangeEvent } from 'react'
import { cn } from 'tailwind-variants'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { HueSlider } from './hue-slider'
import { Saturation } from './saturation'
import { useColorManipulation } from './use-color-manipulation'

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
  className?: string
  disabled?: boolean
  hideInput?: boolean
  align?: 'end' | 'start'
}

export function ColorPicker({
  value,
  onChange,
  className,
  disabled,
  hideInput = false,
  align = 'end',
}: ColorPickerProps) {
  const [hsva, updateHsva] = useColorManipulation(value, onChange)
  const { hexInput, handleChange, inputProps } = useHexFieldState(value, onChange)

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'size-8 shrink-0 rounded-md cursor-pointer outline-0 data-popup-open:outline-2 data-popup-open:outline-tertiary',
        )}
        style={{
          backgroundColor: hexInput,
        }}
      />

      <PopoverContent align={align}>
        <div className={cn('w-full space-y-3', className)}>
          <Saturation hsva={hsva} onChange={updateHsva} />
          <HueSlider hue={hsva.h} onChange={(h) => updateHsva({ h })} disabled={disabled} />
          {!hideInput && (
            <Input
              type="text"
              value={hexInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e.target.value)}
              {...inputProps}
              disabled={disabled}
              className="font-mono tabular-nums"
              aria-label="Hex value"
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
