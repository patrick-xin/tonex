'use client'

import { useSource } from '@tonex/core'
import { TwColorPicker } from '@/features/tw-color-picker'
import { ColorPicker } from '../color-picker'
import { HexInput } from './hex-input'

export function SourceColorSection() {
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)

  return (
    <div className="flex items-center gap-2">
      <ColorPicker onChange={(hex: string) => setSeedHex(hex)} value={seedHex} />
      <HexInput hideLabel />
      <TwColorPicker currentColor={seedHex} onSelect={setSeedHex} disabled={seedHexLock} />
    </div>
  )
}
