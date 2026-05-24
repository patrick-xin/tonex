import { useSource } from '@tonex/core'
import type { ShadcnPresetName } from '@tonex/core/schema'
import { presetSwitchNeedsDialog } from './predicate'
import { presetSwitchDialogHandle } from './preset-dialog'

// why: imperative entry for a preset chip click. Reads the store directly
// (single snapshot) so the decision-check and dispatch can't tear between
// renders. Gates on presetSwitchNeedsDialog — the one authoritative answer to
// "does applying this preset raise any decision?": a custom recipe to confirm,
// or a touched source input whose keep-vs-adopt switch must be shown. With
// nothing to decide, applies straight through so clean clicks stay snappy.
export function requestPresetSwitch(name: ShadcnPresetName): void {
  const state = useSource.getState()
  if (presetSwitchNeedsDialog(state)) {
    presetSwitchDialogHandle.openWithPayload(name)
  } else {
    state.actions.setShadcnPreset(name)
  }
}
