import { SHADCN_BINDING_PRESETS, type ShadcnBindingPresetName } from '@tonex/core/schema'
import { useSource } from '@tonex/core-react'
import { useBindingBaseline } from '@/lib/stores/binding-baseline'

// why: www-side seam for applying a binding preset — pure routing on the core
// store, then stamp the rail's fallback baseline with the preset's bindings
// (option 1.5), mirroring applyShadcnPreset. Keeps the "custom" dots measuring
// against the last-applied preset after a subsequent hand-edit instead of
// snapping every untouched row back to default-relative.
export function applyShadcnBindingPreset(name: ShadcnBindingPresetName): void {
  useSource.getState().actions.setShadcnBindingPreset(name)
  useBindingBaseline.getState().actions.setBaseline(SHADCN_BINDING_PRESETS[name].shadcnRoleBindings)
}
