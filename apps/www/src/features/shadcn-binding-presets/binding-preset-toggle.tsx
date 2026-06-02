'use client'

import {
  findActiveBindingPreset,
  SHADCN_BINDING_PRESETS,
  type ShadcnBindingPresetName,
} from '@tonex/core/schema'
import { useSource } from '@tonex/core-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { applyShadcnBindingPreset } from './apply'

// why: app-only display labels (ADR-0016 — www owns presentation strings). The
// exhaustive Record means a binding preset added in core surfaces here as a
// compile error, mirroring scheme-variant's VARIANT_LABELS.
const BINDING_PRESET_LABELS: Record<ShadcnBindingPresetName, string> = {
  default: 'Default',
  mixed: 'Mixed',
  layered: 'Layered',
  seamless: 'Seamless',
  clean: 'Clean',
}

const BINDING_PRESET_NAMES = Object.keys(SHADCN_BINDING_PRESETS) as ShadcnBindingPresetName[]

// why: binding-tier picker, mirroring SchemeVariantsToggle — a single-select
// ToggleGroup over the routing catalog. Applies straight through
// setShadcnBindingPreset (ADR-0031 #1: pure routing overwrites no recipe, so no
// dirty-gate dialog). Selection reflects findActiveBindingPreset, independent of
// the theme tier: an empty value (no item lit) is the "Custom" state whenever
// bindings sit off the catalog — including right after a theme-preset pick. The
// empty-guard makes deselecting a no-op, so Custom is only reached by drifting,
// never chosen here.
export function BindingPresetToggle() {
  const bindings = useSource((s) => s.shadcnRoleBindings)
  const active = findActiveBindingPreset({ shadcnRoleBindings: bindings })

  return (
    <ToggleGroup
      variant="outline"
      size="xs"
      className="justify-start"
      value={active ? [active] : []}
      onValueChange={(value) => {
        if (value.length > 0) applyShadcnBindingPreset(value[0] as ShadcnBindingPresetName)
      }}
    >
      {BINDING_PRESET_NAMES.map((name) => (
        <ToggleGroupItem key={name} value={name} className="px-1.5">
          {BINDING_PRESET_LABELS[name]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
