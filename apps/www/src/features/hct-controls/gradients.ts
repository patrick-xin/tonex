import { hexFromHct } from '@tonex/core'

// why: slider track backgrounds are pure presentation — they live in www, not
// core. Each function returns a CSS linear-gradient with N stops sampled
// across the swept axis at a fixed perceptual midline for the other two
// axes. Stop count is a perception/perf trade: 12 is enough that adjacent
// stops are visually indistinguishable at typical track widths but cheap
// enough to recompute on every (hue, tone) change without memo machinery
// fighting React's render cadence.
const STOPS = 12

function buildLinearGradient(stops: string[]): string {
  return `linear-gradient(to right, ${stops.join(', ')})`
}

// why: hue sweeps the full color wheel at a representative chroma+tone. The
// preview hue is independent of the seed's chroma/tone — users want to see
// the wheel, not a desaturated wedge of it — so we pin (chroma, tone) at
// values that produce a vivid mid-tone rainbow.
export function hueGradient(): string {
  const stops: string[] = []
  for (let i = 0; i < STOPS; i++) {
    const hue = (i / (STOPS - 1)) * 360
    stops.push(hexFromHct({ hue, chroma: 60, tone: 50 }))
  }
  return buildLinearGradient(stops)
}

// why: chroma slider runs 0 → max representable at the *current* (hue, tone),
// so the gradient depends on both. Pre-clamping at maxChroma keeps the
// gradient inside the gamut wall — past that, MCU snaps to the same hex and
// the gradient flatlines (visible as a dead zone), which is a useful visual
// signal that matches the chroma slider's own clamping behavior.
export function chromaGradient(hue: number, tone: number, maxChroma: number): string {
  const stops: string[] = []
  for (let i = 0; i < STOPS; i++) {
    const chroma = (i / (STOPS - 1)) * maxChroma
    stops.push(hexFromHct({ hue, chroma, tone }))
  }
  return buildLinearGradient(stops)
}

// why: tone sweeps 0 → 100 at the current (hue, chroma). Endpoints near 0/100
// snap toward black/white as the gamut wall closes — that's the desired
// visual: tone slider previews the lightness range available for the
// current color choice.
export function toneGradient(hue: number, chroma: number): string {
  const stops: string[] = []
  for (let i = 0; i < STOPS; i++) {
    const tone = (i / (STOPS - 1)) * 100
    stops.push(hexFromHct({ hue, chroma, tone }))
  }
  return buildLinearGradient(stops)
}
