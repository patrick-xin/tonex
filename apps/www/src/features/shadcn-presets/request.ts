import { useSource } from '@tonex/core'
import type { ShadcnPresetName } from '@tonex/core/schema'
import { presetSwitchAlertHandle } from './dialog'
import { isPresetSwitchDirty } from './predicate'

// why: imperative entry for the preset chip onValueChange handler. Reads the
// store directly (single snapshot) so dirty-check and dispatch can't tear
// between renders; gates on isPresetSwitchDirty so the predicate is the one
// authoritative answer to "would this preset switch wipe user work?". Clean
// state applies directly with no dialog hop — preset chip clicks stay snappy
// when the user is on a known recipe.
export function requestPresetSwitch(name: ShadcnPresetName): void {
  const state = useSource.getState()
  if (isPresetSwitchDirty(state)) {
    presetSwitchAlertHandle.openWithPayload(name)
  } else {
    state.actions.setShadcnPreset(name)
  }
}
