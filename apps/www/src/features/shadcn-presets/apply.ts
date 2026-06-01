import { useSource } from '@tonex/core'
import { type PresetAdoptChoices, SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import { useBindingBaseline } from '@/lib/stores/binding-baseline'

// why: the single www-side seam for actually applying a theme preset. Delegates
// the recipe apply to the core store (setShadcnPreset → resolvePresetApply), then
// stamps the binding rail's fallback baseline (option 1.5) with the preset's
// routing so a later hand-edit measures "custom" against THIS preset, not the
// fixed default. Both apply entries — the snappy requestPresetSwitch path and the
// dirty-gate dialog's Apply button — route through here so the stamp can't be
// forgotten on one path. Plain function (reads .getState()) so it serves the
// imperative request path and React handlers alike. Lives in its own module so
// request.ts and preset-dialog.tsx can both import it without a cycle (request
// imports the dialog handle).
export function applyShadcnPreset(name: ShadcnPresetName, choices?: PresetAdoptChoices): void {
  useSource.getState().actions.setShadcnPreset(name, choices)
  useBindingBaseline.getState().actions.setBaseline(SHADCN_PRESETS[name].shadcnRoleBindings)
}
