'use client'

import { useSource } from '@tonex/core'
import { useMemo } from 'react'
import { useActiveMode } from '@/features/theme-mode'
import { sweepChroma } from './surface-gradients'

// why: one hook owns all surface store reads/writes + the derived gradients, so
// the view stays pure composition. The two level sliders (tint/desaturate) and
// the text accent each edit their own mode-keyed level — the algo isn't a branch
// here, it's whichever tab is open, so each setter is unconditional.
export function useSurfaceModel() {
  const algo = useSource((s) => s.surfaceAlgo)
  const setAlgo = useSource((s) => s.actions.setSurfaceAlgo)
  const seed = useSource((s) => s.seed)
  const tint = useSource((s) => s.surfaceTintLevel)
  const setTint = useSource((s) => s.actions.setSurfaceTintLevel)
  const text = useSource((s) => s.surfaceTintTextLevel)
  const setText = useSource((s) => s.actions.setSurfaceTintTextLevel)
  const desat = useSource((s) => s.surfaceDesaturateLevel)
  const setDesat = useSource((s) => s.actions.setSurfaceDesaturateLevel)

  // why: pre-mount mode is null. Resolve to light for the value but disable the
  // sliders until mode lands, so the folded panel keeps a stable height across
  // the hydration boundary (mirrors the old SurfaceLevelSlider's isPending).
  const mode = useActiveMode()
  const resolvedMode = mode ?? 'light'
  const isPending = mode === null

  // why: surface tints sit at the neutral surface tone (light: near-white 92,
  // dark: near-black 24); text accent rides the on-surface tone (light: 32,
  // dark: 80). brandC floors the sweep at 40 so a low-chroma seed still shows a
  // legible gradient rather than a flat grey track.
  const surfaceTone = resolvedMode === 'dark' ? 24 : 92
  const textTone = resolvedMode === 'dark' ? 80 : 32
  const brandC = Math.max(seed.chroma, 40)
  const tintG = useMemo(
    () => sweepChroma(seed.hue, 2, brandC, surfaceTone),
    [seed.hue, brandC, surfaceTone],
  )
  const desatG = useMemo(
    () => sweepChroma(seed.hue, brandC, 2, surfaceTone),
    [seed.hue, brandC, surfaceTone],
  )
  const textG = useMemo(
    () => sweepChroma(seed.hue, 2, brandC, textTone),
    [seed.hue, brandC, textTone],
  )

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
    tintG,
    desatG,
    textG,
  }
}
