'use client'

import { selectSeedHex } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

export function HexInput({ hideLabel = false }: { hideLabel?: boolean }) {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)

  const { hexInput, handleChange, inputProps } = useHexFieldState(seedHex, setSeedHex)

  // why: the editor renders this rail twice (desktop aside + sm:hidden mobile
  // drawer), so a hard-coded id would collide — two elements sharing it is
  // invalid HTML and binds htmlFor/getElementById to only the first. useId gives
  // each mount its own id, matching the codebase convention (hct-color-picker).
  const hexInputId = useId()

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex items-center gap-2 text-sm flex-1">
        {!hideLabel && <Label htmlFor={hexInputId}>Hex</Label>}
        <Input
          disabled={seedHexLock}
          id={hexInputId}
          // why: this is the seed input; when the visible "Hex" label is hidden
          // (the rail uses hideLabel) it would otherwise have no accessible name.
          aria-label={hideLabel ? 'Seed color hex' : undefined}
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
