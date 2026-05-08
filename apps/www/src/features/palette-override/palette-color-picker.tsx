'use client'

import { CHROMA_HUE_LOCK, hctFromHex, hexFromHct, maxChroma } from '@tonex/core'
import { useId, useMemo, useRef } from 'react'
import { NativeColorInput } from '@/components/shared/native-color-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/features/color-picker'
import {
  ChromaSlider,
  chromaGradient,
  HctSlider,
  hueGradient,
  toneGradient,
} from '@/features/hct-controls'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

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

  const parsed = hctFromHex(value)
  // why: when chroma drops below the perception lock threshold, MCU's
  // hue value becomes meaningless (a near-grey has no stable hue), so we
  // freeze the last good hue as the slider's reference. Otherwise the hue
  // thumb would jitter or snap to 0 every time tone crosses through grey.
  const lockedHue = useRef<number | null>(null)
  const chroma = parsed.chroma
  const tone = parsed.tone

  if (chroma >= CHROMA_HUE_LOCK) {
    lockedHue.current = parsed.hue
  } else if (lockedHue.current === null) {
    lockedHue.current = parsed.hue
  }
  const hue = lockedHue.current
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
        <NativeColorInput className="size-8" currentHex={value} onColorChange={onChange} />
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
        <TwColorPicker currentColor={value} onSelect={onChange} />
      </div>
      <HctSlider
        label="Hue"
        value={hue}
        max={360}
        gradient={hueG}
        onValueChange={(h) => onChange(hexFromHct({ hue: h, chroma, tone }))}
        disabled={chroma < CHROMA_HUE_LOCK}
      />
      <ChromaSlider
        value={chroma}
        gamutLimit={gamutLimit}
        gradient={chromaG}
        onValueChange={(c) => onChange(hexFromHct({ hue, chroma: c, tone }))}
      />
      <HctSlider
        label="Tone"
        value={tone}
        max={100}
        gradient={toneG}
        onValueChange={(t) => onChange(hexFromHct({ hue, chroma, tone: t }))}
      />
    </div>
  )
}
