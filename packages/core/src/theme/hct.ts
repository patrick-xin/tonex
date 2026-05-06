import { argbFromHex, Hct, hexFromArgb } from '@tonex/mcu'

// why: below this chroma the hue value carries no perceptual signal — moving
// the hue slider produces no visible change because the color is already
// (nearly) achromatic. UI uses this as the threshold to disable the hue
// slider so users don't get the illusion of a broken control. The exact
// number is the conventional MCU/M3 cutoff; not load-bearing as a contract,
// but kept as a named constant so callers don't sprinkle magic 4s.
export const CHROMA_HUE_LOCK = 4

export interface HctTriplet {
  hue: number
  chroma: number
  tone: number
}

// why: pure decomposition of a hex string into HCT. Single MCU call site —
// callers (UI sliders, hex pickers, image-extracted colors) get one helper
// instead of each importing argbFromHex + Hct.fromInt independently.
export function hctFromHex(hex: string): HctTriplet {
  const hct = Hct.fromInt(argbFromHex(hex))
  return { hue: hct.hue, chroma: hct.chroma, tone: hct.tone }
}

// why: HCT → hex via Hct.from, which routes through HctSolver and snaps to
// the nearest in-gamut color. Requested chroma may be silently reduced if it
// exceeds the gamut wall at (hue, tone) — UI should clamp via maxChroma()
// first if it wants the displayed value to match the resulting color.
export function hexFromHct({ hue, chroma, tone }: HctTriplet): string {
  return hexFromArgb(Hct.from(hue, chroma, tone).toInt())
}

// why: gamut wall — the largest chroma achievable at (hue, tone) before HCT
// clamps. Computed by asking MCU for an absurdly high chroma and reading
// back the chroma it actually produced; HctSolver's behavior is to settle at
// the maximum representable value, so this is exact (not an iterative search
// on our side). UI uses it to draw the gamut tick on the chroma slider.
export function maxChroma(hue: number, tone: number): number {
  return Hct.from(hue, 200, tone).chroma
}
