'use client'

import { CHROMA_HUE_LOCK, hctFromHex, maxChroma, useSource } from '@tonex/core'
import { useMemo } from 'react'
import { ChromaSlider } from './chroma-slider'
import { chromaGradient, hueGradient, toneGradient } from './gradients'
import { HctSlider } from './hct-slider'

// why: HCT decomposition is derived from seedHex on every render. Cheap (one
// MCU solve) and correct — no stale draft state, no commit boundary. If
// profiling ever shows slider drag stutters, drop a useDeferredValue or
// reintroduce the draft pattern; until then, the simpler shape wins.
export function HctControlSliders() {
  const seedHex = useSource((s) => s.seedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const setSeedHue = useSource((s) => s.actions.setSeedHue)
  const setSeedChroma = useSource((s) => s.actions.setSeedChroma)
  const setSeedTone = useSource((s) => s.actions.setSeedTone)

  const { hue, chroma, tone } = hctFromHex(seedHex)
  const gamutLimit = useMemo(() => maxChroma(hue, tone), [hue, tone])

  // why: hue gradient is hue+chroma+tone-independent — the wheel is the
  // wheel. Memoize at module scope would also work; useMemo with [] keeps
  // the lifecycle predictable inside React DevTools.
  const hueG = useMemo(() => hueGradient(), [])
  const chromaG = useMemo(() => chromaGradient(hue, tone, gamutLimit), [hue, tone, gamutLimit])
  const toneG = useMemo(() => toneGradient(hue, chroma), [hue, chroma])

  // why: hue carries no perceptual signal below CHROMA_HUE_LOCK chroma —
  // the color is achromatic, so dragging hue produces no visible change.
  // Disable the slider rather than let users grind it for nothing. seedHexLock
  // disables all three (seed is fully locked).
  const hueDisabled = seedHexLock || chroma < CHROMA_HUE_LOCK

  return (
    <div className="flex flex-col space-y-4">
      <HctSlider
        label="Hue"
        value={hue}
        max={360}
        gradient={hueG}
        onValueChange={setSeedHue}
        disabled={hueDisabled}
      />
      <ChromaSlider
        disabled={seedHexLock}
        value={chroma}
        gamutLimit={gamutLimit}
        gradient={chromaG}
        onValueChange={setSeedChroma}
      />
      <HctSlider
        disabled={seedHexLock}
        label="Tone"
        value={tone}
        max={100}
        gradient={toneG}
        onValueChange={setSeedTone}
      />
    </div>
  )
}
