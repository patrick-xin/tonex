import { hexFromHct } from '@tonex/core'

// why: the surface sliders share the rail's HCT-slider language (track =
// gradient, thumb = knob), so their tracks need surface-specific gradients.
// Each sweeps chroma low→high at a fixed surface tone — the same colour the
// treatment actually moves toward — so the track previews the effect. These
// gradients are pure presentation and surface-only, so they live here rather
// than in the shared hct-controls/gradients.ts (which sweeps 0→max only).
const STOPS = 12

export function sweepChroma(hue: number, fromC: number, toC: number, tone: number): string {
  const stops: string[] = []
  for (let i = 0; i < STOPS; i++) {
    const chroma = fromC + (i / (STOPS - 1)) * (toC - fromC)
    stops.push(hexFromHct({ hue, chroma, tone }))
  }
  return `linear-gradient(to right, ${stops.join(', ')})`
}
