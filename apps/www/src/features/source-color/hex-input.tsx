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

  // why: the seed is the one field that opts into oklch paste,
  // users arrive with an `oklch(L C H)` brand color and can drop it straight in
  // (converted to its sRGB hex on commit). Seed-only by design; the token-pinning
  // pickers stay hex-only so oklch never lands on a WYSIWYG-pinned value.
  const { hexInput, handleChange, inputProps } = useHexFieldState(seedHex, setSeedHex, {
    acceptOklch: true,
  })

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
          aria-label={hideLabel ? 'Seed color, hex or oklch' : undefined}
          className="font-mono w-full"
          inputSize="sm"
          type="text"
          value={hexInput}
          onChange={(e) => handleChange(e.target.value)}
          {...inputProps}
          // why: no maxLength — the seed accepts a pasted oklch(L C H) (~26
          // chars), not just a 7-char hex. The commit gate (hexFromColorInput)
          // is what bounds validity, not the field length.
          spellCheck={false}
          placeholder="#00021d or oklch(…)"
        />
      </div>
    </div>
  )
}
