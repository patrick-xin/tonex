'use client'

import { selectSeedHex, useSource } from '@tonex/core'
import { ColorPicker, TwColorPicker } from '@/features/color-picker'
import { useUiPrefs } from '@/lib/stores/ui-prefs'
import { HexInput } from './hex-input'

export function SourceColorSection() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const twPickerEnabled = useUiPrefs((s) => s.twPickerEnabled)

  return (
    <div className="flex items-center gap-2">
      <ColorPicker onChange={(hex: string) => setSeedHex(hex)} value={seedHex} />
      <HexInput hideLabel />
      {twPickerEnabled && (
        <TwColorPicker currentColor={seedHex} onSelect={setSeedHex} disabled={seedHexLock} />
      )}
    </div>
  )
}
