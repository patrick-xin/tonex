'use client'

import { selectSeedHex, useSource } from '@tonex/core'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

export function HexInput({ hideLabel = false }: { hideLabel?: boolean }) {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)

  const { hexInput, handleChange, inputProps } = useHexFieldState(seedHex, setSeedHex)

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex items-center gap-2 text-sm flex-1">
        {!hideLabel && <Label htmlFor="hex-input">Hex</Label>}
        <Input
          disabled={seedHexLock}
          id="hex-input"
          className="font-mono w-full"
          inputSize="sm"
          type="text"
          value={hexInput}
          onChange={(e) => handleChange(e.target.value)}
          {...inputProps}
          maxLength={7}
          spellCheck={false}
          placeholder="#00021d"
        />
      </div>
    </div>
  )
}
