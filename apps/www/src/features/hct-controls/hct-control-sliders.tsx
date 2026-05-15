'use client'

import { CHROMA_HUE_LOCK, maxChroma, useSource } from '@tonex/core'
import { useMemo } from 'react'
import { ChromaSlider } from './chroma-slider'
import { chromaGradient, hueGradient, toneGradient } from './gradients'
import { HctSlider } from './hct-slider'
import { useHctFromHex } from './use-hct-from-hex'

// why: HCT decomposition is held in the hook's local state with a round-trip
// cache so commits at the hue 0/360 boundary (where MCU's hctFromHex collapses
// 360 → 0 by spec) don't snap the slider thumb. The store remains hex-only —
// the hook writes via setSeedHex; the per-axis store actions (setSeedHue etc.)
// are still exported for programmatic callers but no UI path uses them. The
// seedHexLock check lives on setSeedHex in core, so the lock still gates UI
// writes through this hook.
export function HctControlSliders() {
  const seedHex = useSource((s) => s.seedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)

  const [{ hue, chroma, tone }, updateHct] = useHctFromHex(seedHex, setSeedHex)
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
        onValueChange={(h) => updateHct({ hue: h })}
        disabled={hueDisabled}
      />
      <ChromaSlider
        disabled={seedHexLock}
        value={chroma}
        gamutLimit={gamutLimit}
        gradient={chromaG}
        onValueChange={(c) => updateHct({ chroma: c })}
      />
      <HctSlider
        disabled={seedHexLock}
        label="Tone"
        value={tone}
        max={100}
        gradient={toneG}
        onValueChange={(t) => updateHct({ tone: t })}
      />
    </div>
  )
}
