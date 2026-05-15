'use client'

import { CHROMA_HUE_LOCK, maxChroma, useSource } from '@tonex/core'
import { useMemo } from 'react'
import { ChromaSlider } from './chroma-slider'
import { chromaGradient, hueGradient, toneGradient } from './gradients'
import { HctSlider } from './hct-slider'

// why: ADR-0028 — HCT is the canonical persisted seed; sliders read seed
// fields directly from the store and write each axis via the per-axis
// setter. The prior hex-canonical world routed every gesture through
// useHctFromHex, which held a local HCT cache to dodge hctFromHex
// collapsing 360 → 0 at the hue boundary; once HCT lives in the store the
// cache is redundant — the store IS that cache. seedHexLock gates every
// setter at the store seam, so locking disables all axes structurally;
// the UI also disables the inputs cosmetically.
export function HctControlSliders() {
  const seed = useSource((s) => s.seed)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const setSeedHue = useSource((s) => s.actions.setSeedHue)
  const setSeedChroma = useSource((s) => s.actions.setSeedChroma)
  const setSeedTone = useSource((s) => s.actions.setSeedTone)

  const { hue, chroma, tone } = seed
  const gamutLimit = useMemo(() => maxChroma(hue, tone), [hue, tone])

  // why: hue gradient is hue+chroma+tone-independent — the wheel is the
  // wheel. useMemo with [] keeps the lifecycle predictable inside DevTools.
  const hueG = useMemo(() => hueGradient(), [])
  const chromaG = useMemo(() => chromaGradient(hue, tone, gamutLimit), [hue, tone, gamutLimit])
  const toneG = useMemo(() => toneGradient(hue, chroma), [hue, chroma])

  // why: hue carries no perceptual signal below CHROMA_HUE_LOCK chroma —
  // the color is achromatic, so dragging hue produces no visible change.
  // Disable the slider rather than let users grind it for nothing. Note
  // ADR-0028 makes this lock visually-true: the underlying seed.hue is
  // preserved verbatim across chroma touches in this regime, so the user's
  // hue choice survives lock-and-release.
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
