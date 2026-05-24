'use client'

import { selectPortable, useSource } from '@tonex/core'
import { findActivePreset, SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { useShallow } from 'zustand/react/shallow'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { requestPresetSwitch } from './request'

// why: shadcn-only. Presets are a curated bundle of variant + surface scalars +
// bindings (ADR-0026); md has no preset concept. Two visual rows split the
// shipped names so a single ToggleGroup never wraps awkwardly in the rail width.
const PRESET_NAMES = Object.keys(SHADCN_PRESETS) as ShadcnPresetName[]
const PRESET_GROUP_B: ShadcnPresetName[] = ['paper', 'enterprise', 'sunset', 'sage']
const PRESET_GROUP_A = PRESET_NAMES.filter((n) => !PRESET_GROUP_B.includes(n))

// why: extracted from features/settings so the picker can live in the rail as a
// first-class control rather than buried in the settings popover. The switch
// machinery (dirty-gate + confirm dialog) stays in this folder — requestPresetSwitch
// is the one entry point, so a stray click can't silently wipe user customizations.
export function PresetPicker() {
  const portable = useSource(useShallow(selectPortable))
  const activePreset = findActivePreset(portable)

  return (
    <div className="flex flex-col gap-1.5">
      {[PRESET_GROUP_A, PRESET_GROUP_B].map((group) => (
        <ToggleGroup
          key={group.join()}
          variant="outline"
          size="xs"
          value={activePreset && group.includes(activePreset) ? [activePreset] : []}
          onValueChange={(value) => {
            if (value.length === 0) return
            requestPresetSwitch(value[0] as ShadcnPresetName)
          }}
        >
          {group.map((name) => (
            <ToggleGroupItem className="h-6 capitalize" key={name} value={name}>
              {name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ))}
    </div>
  )
}
