'use client'

import { useSource } from '@tonex/core-react'
import { useActiveMode } from '@/features/theme-mode'

// why: one hook owns all surface store reads/writes so the view stays pure
// composition. The two level sliders (tint/desaturate) and the text accent each
// edit their own mode-keyed level — the algo isn't a branch here, it's whichever
// tab is open, so each setter is unconditional.
export function useSurfaceModel() {
  const algo = useSource((s) => s.surfaceAlgo)
  const setAlgo = useSource((s) => s.actions.setSurfaceAlgo)
  const tint = useSource((s) => s.surfaceTintLevel)
  const setTint = useSource((s) => s.actions.setSurfaceTintLevel)
  const text = useSource((s) => s.surfaceTintTextLevel)
  const setText = useSource((s) => s.actions.setSurfaceTintTextLevel)
  const desat = useSource((s) => s.surfaceDesaturateLevel)
  const setDesat = useSource((s) => s.actions.setSurfaceDesaturateLevel)
  const palette = useSource((s) => s.surfacePaletteName)
  const setPalette = useSource((s) => s.actions.setSurfacePaletteName)

  // why: pre-mount mode is null. Resolve to light for the value but disable the
  // sliders until mode lands, so the folded panel keeps a stable height across
  // the hydration boundary (mirrors the old SurfaceLevelSlider's isPending).
  const mode = useActiveMode()
  const resolvedMode = mode ?? 'light'
  const isPending = mode === null

  return {
    algo,
    setAlgo,
    resolvedMode,
    isPending,
    tintLevel: tint[resolvedMode],
    setTint,
    textLevel: text[resolvedMode],
    setText,
    desatLevel: desat[resolvedMode],
    setDesat,
    // why: the neutral family is per-mode (#242) like the levels above — read
    // the resolved mode's family, write it back through the mode-keyed setter.
    paletteName: palette[resolvedMode],
    setPalette,
  }
}
