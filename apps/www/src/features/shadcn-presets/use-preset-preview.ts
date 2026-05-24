'use client'

import { selectPortable, selectSeedHex, useSource } from '@tonex/core'
import {
  findActivePreset,
  resolvePresetApply,
  SHADCN_PRESETS,
  type ShadcnPresetName,
} from '@tonex/core/schema'
import { useShallow } from 'zustand/react/shallow'
import { useActiveMode } from '@/features/theme-mode'
import { presetSwatches } from './preview-swatches'

// why: only the *active* chip is resolved against the live source — it already
// equals the live app, so when the user kept their own seed it should wear that
// color and surface it as "Current". Every other chip stays its curated
// identity, so the gallery remains a true reference of what each recipe looks
// like instead of nine copies of the user's color. Resolution reuses
// resolvePresetApply, keeping it in lockstep with the commit rule (ADR-0031).
// `active` is passed by the trigger (the picker already knows it) and computed
// here for the detached card, which only receives the name.
export function usePresetPreview(name: ShadcnPresetName, activeOverride?: boolean) {
  const mode = useActiveMode() ?? 'light'
  const portable = useSource(useShallow(selectPortable))
  const active = activeOverride ?? findActivePreset(portable) === name
  const recipe = SHADCN_PRESETS[name]
  const patch = resolvePresetApply(portable, recipe)
  const resolved = {
    seed: patch.seed ?? portable.seed,
    contrastLevel: patch.contrastLevel ?? portable.contrastLevel,
  }
  const presetHex = selectSeedHex(recipe)
  const liveHex = selectSeedHex({ seed: resolved.seed })
  const swatches = (active ? presetSwatches(name, resolved) : presetSwatches(name))[mode]
  return {
    swatches,
    // The preset's curated seed — always shown. currentHex is set only on the
    // active chip when the user kept their own seed, so the row reads "what
    // you're on now" next to "what this preset's seed is".
    presetHex,
    currentHex: active && liveHex !== presetHex ? liveHex : null,
  }
}
