import { CHROMA_HUE_LOCK } from '@tonex/core'

// why: the Hue axis greys out on a near-grey seed (chroma below CHROMA_HUE_LOCK)
// because hue has no visible effect there. State-triggered cue tells the user how
// to re-enable it. Excludes the seedHexLock reason — that's the lock, not chroma,
// and gets its own (Finding 10) treatment. Pure so it's unit-tested without render.
export function showsHueDisabledHint(chroma: number, seedHexLock: boolean): boolean {
  return !seedHexLock && chroma < CHROMA_HUE_LOCK
}
