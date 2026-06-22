'use client'

import { type HctTriplet, hctFromHex, hexFromHct } from '@tonex/core'
import { useEffect, useInsertionEffect, useRef, useState } from 'react'
import { applyHctUpdate, hctEqual } from './reconcile-hct'

// why: hold the latest handler on a ref so the returned function stays
// referentially stable; sync via useInsertionEffect so a discarded Concurrent
// render can't leave a stale handler. Same pattern as color-picker's
// use-event-callback (kept local to avoid a cross-feature primitive for a
// 12-line helper).
function useEventCallback<T>(handler: (value: T) => void): (value: T) => void {
  const callbackRef = useRef(handler)
  const fn = useRef((value: T) => {
    callbackRef.current(value)
  })
  useInsertionEffect(() => {
    callbackRef.current = handler
  })
  return fn.current
}

// why: hex ↔ HCT is non-bijective. MCU's `Hct.fromInt(argb).hue` returns hue
// in [0, 360) by spec, so `hctFromHex(hexFromHct({hue: 360, ...}))` yields 0.
// Derivation-on-every-render (the naïve `const { hue } = hctFromHex(value)`
// pattern) makes the slider thumb snap end-to-end when the user drags across
// the 0/360 boundary, since the just-committed 360 re-arrives projected to 0.
//
// Mirror color-picker/use-color-manipulation's cache pattern, keyed on the
// HCT triple: hold HCT locally, sync from the external hex prop ONLY when the
// hex actually changed, push to parent ONLY when our HCT would actually change
// the hex. The cache makes hue=360 and hue=0 distinguishable on our side even
// though their hex projection is identical — which is the whole point.
//
// Secondary win: this also preserves hue across low-chroma round trips. When
// chroma drops below CHROMA_HUE_LOCK the hex projection drifts toward grey and
// MCU's hue becomes meaningless, but our cached hue stays put — so dragging
// chroma down and back up doesn't whip the hue thumb.
export function useHctFromHex(
  hex: string,
  onChange: (next: string) => void,
): readonly [HctTriplet, (partial: Partial<HctTriplet>) => void] {
  const onChangeCallback = useEventCallback<string>(onChange)
  const [hct, setHct] = useState<HctTriplet>(() => hctFromHex(hex))
  const cache = useRef({ hex, hct })

  useEffect(() => {
    if (hex === cache.current.hex) return
    const next = hctFromHex(hex)
    cache.current = { hct: next, hex }
    setHct(next)
  }, [hex])

  useEffect(() => {
    if (hctEqual(hct, cache.current.hct)) return
    const next = hexFromHct(hct)
    if (next === cache.current.hex) {
      // hex unchanged (hue 360 ≡ 0, or chroma past the gamut wall): keep the
      // local HCT, skip onChange — the parent has nothing to update.
      cache.current = { hct, hex: next }
      return
    }
    cache.current = { hct, hex: next }
    onChangeCallback(next)
  }, [hct, onChangeCallback])

  const update = (partial: Partial<HctTriplet>) => {
    setHct((cur) => applyHctUpdate(cur, partial))
  }

  return [hct, update] as const
}
