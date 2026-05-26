'use client'

import { CheckIcon } from '@phosphor-icons/react'
import type { ShadcnPresetName } from '@tonex/core/schema'
import { cn } from 'tailwind-variants'
import { PreviewCardTrigger } from '@/components/ui/preview-card'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { COLUMN_ORDER, presetPreviewHandle } from './preset-preview-card'
import type { Swatches } from './preview-swatches'
import { usePresetPreview } from './use-preset-preview'

function HexChip({ hex, label }: { hex: string; label?: string }) {
  return (
    <span className="flex items-center gap-1.5 px-0.5 font-mono text-xs text-on-surface-variant">
      {label && <span>{label}</span>}
      <span
        className="size-2.5 rounded-sm border border-outline-variant/60"
        style={{ backgroundColor: hex }}
      />
      {hex}
    </span>
  )
}

function TriggerStrip({ swatches }: { swatches: Swatches }) {
  return (
    <span className="flex h-4 overflow-hidden rounded-sm border border-outline-variant">
      {COLUMN_ORDER.map((k) => (
        <span key={k} className="flex-1" style={{ backgroundColor: swatches[k] }} />
      ))}
    </span>
  )
}

export function PresetPreviewTrigger({
  name,
  active,
  onSelect,
}: {
  name: ShadcnPresetName
  active: boolean
  onSelect: () => void
}) {
  const { swatches, presetHex, currentHex } = usePresetPreview(name, active)
  return (
    <PreviewCardTrigger
      delay={0}
      handle={presetPreviewHandle}
      payload={name}
      render={
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            'flex w-full flex-col gap-1.5 rounded-md p-2 text-left transition-colors data-popup-open:hover:bg-primary/8 outline-transparent hover:bg-surface-container-highest',
            active && 'bg-primary/12 hover:bg-primary/12!',
            focusVisiblePrimaryRing,
          )}
        >
          <TriggerStrip swatches={swatches} />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 px-0.5 text-xs capitalize text-on-surface">
              {name}
              {active && <CheckIcon weight="bold" className="size-3 text-primary" />}
            </div>
            <div className="flex min-w-0 items-center gap-2">
              {currentHex && <HexChip label="Current:" hex={currentHex} />}
              <HexChip hex={presetHex} />
            </div>
          </div>
        </button>
      }
    />
  )
}
