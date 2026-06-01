'use client'

import { useSource } from '@tonex/core'
import {
  findActiveBindingPreset,
  SHADCN_BINDING_PRESETS,
  type ShadcnBindingPresetName,
} from '@tonex/core/schema'

// why: the binding tier is pure routing (ADR-0031 #1), so a pick applies
// straight through setShadcnBindingPreset with no dirty-gate dialog — unlike the
// theme PresetPicker, overwriting bindings destroys no recipe, so there is
// nothing to confirm. Active reads findActiveBindingPreset, independent of
// findActivePreset: this shows "Custom" whenever bindings sit off the catalog,
// including right after a theme-preset pick (no theme map coincides with a
// binding preset). Native <select> is the wiring affordance; the popover+preview
// production UI lands separately.
const BINDING_PRESET_NAMES = Object.keys(SHADCN_BINDING_PRESETS) as ShadcnBindingPresetName[]

export function BindingPresetPicker() {
  const bindings = useSource((s) => s.shadcnRoleBindings)
  const setBindingPreset = useSource((s) => s.actions.setShadcnBindingPreset)
  const active = findActiveBindingPreset({ shadcnRoleBindings: bindings })

  return (
    <label className="flex items-center gap-1.5">
      <span className="text-xs text-on-surface-variant">Binding</span>
      <select
        value={active ?? ''}
        onChange={(e) => setBindingPreset(e.target.value as ShadcnBindingPresetName)}
        className="rounded border border-outline-variant bg-surface px-2 py-1 text-xs text-on-surface capitalize"
        aria-label="Binding preset"
      >
        {/* why: the off-catalog sentinel — always present but unselectable, so a
            preset value never lacks a matching option, while "Custom" can only be
            reached by drifting bindings, not chosen from the menu. */}
        <option value="" disabled>
          Custom
        </option>
        {BINDING_PRESET_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
