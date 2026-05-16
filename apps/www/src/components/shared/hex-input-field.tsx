'use client'

import { Input } from '@/components/ui/input'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

interface HexInputFieldProps {
  value: string
  onChange: (hex: string) => void
}

export function HexInputField({ value, onChange }: HexInputFieldProps) {
  const { hexInput, handleChange, inputProps } = useHexFieldState(value, onChange)
  return (
    <Input
      autoFocus
      className="font-mono flex-1"
      inputSize="sm"
      type="text"
      value={hexInput}
      onChange={(e) => handleChange(e.target.value)}
      {...inputProps}
      maxLength={7}
      spellCheck={false}
      placeholder="#000000"
    />
  )
}
