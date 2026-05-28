import type { HctTriplet } from '@tonex/core'

// why: issue #56 — the slider's button-tap-and-Enter path commits the
// displayed `.toFixed(2)` value verbatim, which differs from the cached
// decimal HCT by ≤5e-3. Without a tolerance gate at the update site, that
// commit would mutate local HCT, fire the push-to-parent effect, recompose
// hex via hexFromHct, and drift seedHex 1–2 channels (amplifying up to
// 41ch on CMF md tokens, 252ch under fidelity). The gate suppresses the
// state change at its source, so React never re-renders and the parent
// never sees a write. 5e-3 = half of one `.toFixed(2)` step; tight enough
// that any real drag of 0.01 still passes through.
export const HCT_UPDATE_EPSILON = 5e-3

export function hctEqual(a: HctTriplet, b: HctTriplet): boolean {
  return a.hue === b.hue && a.chroma === b.chroma && a.tone === b.tone
}

export function hctClose(a: HctTriplet, b: HctTriplet): boolean {
  return (
    Math.abs(a.hue - b.hue) < HCT_UPDATE_EPSILON &&
    Math.abs(a.chroma - b.chroma) < HCT_UPDATE_EPSILON &&
    Math.abs(a.tone - b.tone) < HCT_UPDATE_EPSILON
  )
}

// why: body of the local-HCT update reducer. Merge partial, return current
// when the merged triplet is within solver epsilon — keeping the identity
// stable so React skips the re-render and the push-to-parent effect.
export function applyHctUpdate(current: HctTriplet, partial: Partial<HctTriplet>): HctTriplet {
  const next = { ...current, ...partial }
  if (hctClose(current, next)) return current
  return next
}
