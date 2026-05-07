'use client'

import { useSource } from '@tonex/core'
import { ColorPicker } from '../color-picker'
import { HexInput } from './hex-input'
import { TwColorPickerCombobox } from './tw-color-picker-combobox'

export function SourceColorSection() {
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)

  return (
    <div className="flex items-center gap-2">
      <ColorPicker onChange={(hex: string) => setSeedHex(hex)} value={seedHex} />
      <HexInput hideLabel />
      <TwColorPickerCombobox currentColor={seedHex} onSelect={setSeedHex} disabled={seedHexLock} />
    </div>
  )
}
