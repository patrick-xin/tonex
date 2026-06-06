'use client'

import { selectSeedHex } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import { cn } from 'tailwind-variants'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ColorPicker, TwColorPicker } from '@/features/color-picker'
import { useUiPrefs } from '@/lib/stores/ui-prefs'
import { ColorLock } from './color-lock'
import { HexInput } from './hex-input'

export function SourceColorSection() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const twPickerEnabled = useUiPrefs((s) => s.twPickerEnabled)

  return (
    <div className="flex items-center gap-2 px-2">
      <ColorPicker
        triggerClassName="size-12"
        onChange={(hex: string) => setSeedHex(hex)}
        value={seedHex}
        disabled={seedHexLock}
      />
      <div className="space-y-1">
        <div
          className={cn('font-medium text-xs text-on-surface-variant', seedHexLock && 'opacity-38')}
        >
          <Tooltip>
            <TooltipTrigger
              delay={100}
              render={<span>Current Seed</span>}
              className={cn('cursor-help', seedHexLock && 'opacity-38')}
            />
            <TooltipContent side="right">
              Supported oklch value format: <span className="font-mono">oklch(0.7 0.1 327)</span>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HexInput hideLabel />
            {twPickerEnabled && (
              <TwColorPicker currentColor={seedHex} onSelect={setSeedHex} disabled={seedHexLock} />
            )}
          </div>
          <ColorLock className="-mr-1" />
        </div>
      </div>
    </div>
  )
}
