'use client'

import { PaintBrushIcon } from '@phosphor-icons/react'
import { selectPortable, useSource } from '@tonex/core'
import { findActivePreset, SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PresetSwitchDialog } from './preset-dialog'
import { PresetPreviewCard, presetPreviewHandle } from './preset-preview-card'
import { PresetPreviewTrigger } from './preset-preview-trigger'
import { requestPresetSwitch } from './request'

// why: shadcn-only first-class rail control (ADR-0026 — md has no preset
// concept; nav-tabs gates this on layer). Each preset shows its palette as a
// swatch strip; hover surfaces a morphing preview card with the recipe.
// Clicking routes through requestPresetSwitch — the one dirty-gated entry point
// — so a stray pick can't silently wipe user customizations.
const PRESET_NAMES = Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]

export function PresetPicker() {
  const [open, setOpen] = useState(false)
  const portable = useSource(useShallow(selectPortable))
  const activePreset = findActivePreset(portable)

  // why: the preview handle is module-scoped, so its open state outlives the
  // popover. Clicking a preset closes the popover while a trigger is still
  // hovered — mouseleave never fires, so the handle stays open and the next
  // open paints the card at the viewport origin until a trigger re-anchors it.
  // Closing the handle alongside the popover keeps the two in lockstep.
  const close = () => {
    presetPreviewHandle.close()
    setOpen(false)
  }

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (!next) presetPreviewHandle.close()
          setOpen(next)
        }}
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={<Button variant="secondary" size="icon-sm" aria-label="Preset" />}
              >
                <PaintBrushIcon />
              </PopoverTrigger>
            }
          />
          <TooltipContent>Preset</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" matchAnchorWidth={false} className="w-80 space-y-2 p-2">
          <div className="px-2">
            <PopoverTitle className="text-sm font-medium text-on-surface">Preset</PopoverTitle>
            <PopoverDescription className="text-xs text-on-surface-variant">
              Start from a curated aesthetic recipe.
            </PopoverDescription>
          </div>
          <div className="flex flex-col gap-1">
            {PRESET_NAMES.map((name) => (
              <PresetPreviewTrigger
                key={name}
                name={name}
                active={name === activePreset}
                onSelect={() => {
                  requestPresetSwitch(name)
                  close()
                }}
              />
            ))}
          </div>
          <PresetPreviewCard />
        </PopoverContent>
      </Popover>
      <PresetSwitchDialog />
    </>
  )
}
