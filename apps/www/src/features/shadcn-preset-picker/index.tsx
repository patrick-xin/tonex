'use client'

import { selectPortable, useSource } from '@tonex/core'
import { findActivePreset, SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// why: preset library entry point in the shadcn nav. Picks a recipe in one
// click; active recipe is whatever matches the current state (6-field deep
// equality via findActivePreset). Chip styling is provisional — design pass
// deferred.
const PRESET_NAMES = Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]

export function ShadcnPresetPicker() {
  const portable = useSource(useShallow(selectPortable))
  const active = findActivePreset(portable)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1">
            <span className="text-on-surface font-medium capitalize">{active ?? 'custom'}</span>
          </Button>
        }
      />
      <PopoverContent align="end" side="bottom" className="w-auto max-w-[min(20rem,90vw)]">
        <div className="flex flex-wrap gap-1.5">
          {PRESET_NAMES.map((name) => {
            const isActive = active === name
            return (
              <Chip
                key={name}
                variant={isActive ? 'filled' : 'outline'}
                size="sm"
                aria-pressed={isActive}
                onClick={() => {
                  useSource.getState().actions.setShadcnPreset(name)
                }}
                className="capitalize"
              >
                {name}
              </Chip>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
