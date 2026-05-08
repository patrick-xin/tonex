'use client'

import { cn } from 'tailwind-variants'
import { Label } from '@/components/ui/label'
import { focusWithinRing } from '@/components/ui/styles'

export function NativeColorInput({
  currentHex,
  onColorChange,
  className,
}: {
  currentHex: string
  onColorChange: (hex: string) => void
  className?: string
}) {
  return (
    <Label className={cn('cursor-pointer flex items-center justify-center', focusWithinRing)}>
      <input
        type="color"
        value={currentHex}
        onChange={(e) => {
          onColorChange(e.target.value)
        }}
        className={cn(
          'rounded-lg size-12 border-none outline-0 cursor-pointer appearance-none bg-transparent',
          className,
        )}
      />
    </Label>
  )
}
