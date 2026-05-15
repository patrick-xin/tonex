'use client'

import { CHROMA_HUE_LOCK, maxChroma } from '@tonex/core'
import { useId, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/features/color-picker'
import {
  ChromaSlider,
  chromaGradient,
  HctSlider,
  hueGradient,
  toneGradient,
  useHctFromHex,
} from '@/features/hct-controls'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

interface PaletteColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

// why: drag commits per tick — same UX as seed sliders, surface-tint, and
// every other streaming input in the rail. The prior commit-only-on-release
// pattern existed because the per-tick cost was unaffordable; issue #9 fixed
// that in core (shared derive cache, per-token applyDom, debounced persist),
// so consistency wins. ADR-0003 amendment 2026-05-06 codifies this for HCT
// sliders specifically.
export function PaletteColorPicker({ value, onChange }: PaletteColorPickerProps) {
  const hexInputId = useId()
  const { hexInput, handleChange, inputProps } = useHexFieldState(value, onChange)
  const twPickerEnabled = useUiPrefs((s) => s.twPickerEnabled)

  // why: hex ↔ HCT is non-bijective at the hue boundary (MCU normalizes to
  // [0, 360)) AND at low chroma (greys have no stable hue). Holding HCT
  // locally with a round-trip-aware cache fixes both: the 0/360 thumb snap
  // disappears, and hue survives chroma-down-then-up without a refspecial
  // lockedHue shimmy. See useHctFromHex for the cache contract.
  const [{ hue, chroma, tone }, updateHct] = useHctFromHex(value, onChange)
  const gamutLimit = maxChroma(hue, tone)

  // why: gradients are pure functions of (hue, chroma, tone, gamutLimit).
  // Memoize so per-tick drag re-renders don't recompute the gradient strings.
  // Matches the pattern in HctControlSliders (seed sliders).
  const hueG = useMemo(() => hueGradient(), [])
  const chromaG = useMemo(() => chromaGradient(hue, tone, gamutLimit), [hue, tone, gamutLimit])
  const toneG = useMemo(() => toneGradient(hue, chroma), [hue, chroma])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <ColorPicker onChange={onChange} value={value} align="start" />
        <Label htmlFor={hexInputId} className="flex items-center gap-3 cursor-pointer">
          <Input
            id={hexInputId}
            className="font-mono"
            inputSize="sm"
            type="text"
            value={hexInput}
            onChange={(e) => handleChange(e.target.value)}
            {...inputProps}
            maxLength={7}
            spellCheck={false}
            placeholder="#000000"
          />
        </Label>
        {twPickerEnabled && <TwColorPicker currentColor={value} onSelect={onChange} />}
      </div>
      <HctSlider
        label="Hue"
        value={hue}
        max={360}
        gradient={hueG}
        onValueChange={(h) => updateHct({ hue: h })}
        disabled={chroma < CHROMA_HUE_LOCK}
      />
      <ChromaSlider
        value={chroma}
        gamutLimit={gamutLimit}
        gradient={chromaG}
        onValueChange={(c) => updateHct({ chroma: c })}
      />
      <HctSlider
        label="Tone"
        value={tone}
        max={100}
        gradient={toneG}
        onValueChange={(t) => updateHct({ tone: t })}
      />
    </div>
  )
}
