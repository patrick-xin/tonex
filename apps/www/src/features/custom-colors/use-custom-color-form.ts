'use client'

import {
  hctFromHex,
  hexFromHct,
  maxChroma,
  previewCustomColor,
  selectSeedHex,
  useSource,
} from '@tonex/core'
import { validateCustomColorEntry } from '@tonex/core/schema'
import { useCallback, useState } from 'react'
import { chromaGradient, hueGradient, toneGradient } from '@/features/hct-controls'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

export interface CustomColorFormInitial {
  name: string
  description: string
  hex: string
  blend: boolean
  shadcnSource: 'color' | 'container'
}

// why: shared state + derived for the new and edit custom-color dialogs. The
// dialogs differ on framing (trigger, open control, submit action) but the
// inner form — name/desc + HCT sliders + harmonize + shadcn-source picker — is
// the same shape. The hook owns the state and the derived values; the form
// body renders the JSX given a hook result. Caller passes `existingSlugs` so
// add-time can validate against ALL entries while edit-time excludes self.
export function useCustomColorForm(initial: CustomColorFormInitial, existingSlugs: Set<string>) {
  const seedHex = useSource(selectSeedHex)

  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  // why: HCT triple seeds from initial.hex on mount only. Subsequent re-renders
  // pass a fresh `initial` ref but useState ignores it — `reset()` is the
  // dialog's open-time path for re-seeding (e.g. when seedHex changed since
  // the last open).
  const [hue, setHue] = useState(() => hctFromHex(initial.hex).hue)
  const [chroma, setChroma] = useState(() => hctFromHex(initial.hex).chroma)
  const [tone, setTone] = useState(() => hctFromHex(initial.hex).tone)
  const [blend, setBlend] = useState(initial.blend)
  const [shadcnSource, setShadcnSource] = useState<'color' | 'container'>(initial.shadcnSource)
  const [error, setError] = useState<string | null>(null)

  const colorHex = hexFromHct({ hue, chroma, tone })
  const gamutLimit = maxChroma(hue, tone)
  const hueG = hueGradient()
  const chromaG = chromaGradient(hue, tone, gamutLimit)
  const toneG = toneGradient(hue, chroma)
  const preview = previewCustomColor(seedHex, { hex: colorHex, blend })

  const setFromHex = useCallback((hex: string) => {
    const t = hctFromHex(hex)
    setHue(t.hue)
    setChroma(t.chroma)
    setTone(t.tone)
  }, [])

  const {
    hexInput,
    handleChange: handleHexInput,
    inputProps: hexInputProps,
  } = useHexFieldState(colorHex, setFromHex)

  const draftError = validateCustomColorEntry({ name, hex: colorHex }, existingSlugs)
  // why: gate draft error TEXT on a non-empty name — opening the dialog with
  // an empty name (the add path) shouldn't immediately read "name must
  // contain…". The submit button still keys off draftError directly, so an
  // empty name keeps it disabled; only the red text waits. A caught `error`
  // from the submit handler always shows.
  const visibleError = error ?? (name.trim() ? draftError : null)

  const reset = useCallback((next: CustomColorFormInitial) => {
    setName(next.name)
    setDescription(next.description)
    const t = hctFromHex(next.hex)
    setHue(t.hue)
    setChroma(t.chroma)
    setTone(t.tone)
    setBlend(next.blend)
    setShadcnSource(next.shadcnSource)
    setError(null)
  }, [])

  return {
    name,
    setName,
    description,
    setDescription,
    hue,
    setHue,
    chroma,
    setChroma,
    tone,
    setTone,
    blend,
    setBlend,
    shadcnSource,
    setShadcnSource,
    error,
    setError,
    colorHex,
    gamutLimit,
    hueG,
    chromaG,
    toneG,
    hexInput,
    handleHexInput,
    hexInputProps,
    preview,
    draftError,
    visibleError,
    setFromHex,
    reset,
  }
}

export type CustomColorFormState = ReturnType<typeof useCustomColorForm>
