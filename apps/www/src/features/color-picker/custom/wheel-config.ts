// why: the wheel's offered colors live here as one named source — the analog of
// the landing swatches' preset-colors.ts — instead of magic numbers buried inside
// ColorDot. Each ring sweeps the hue wheel by `count` at a fixed chroma/tone:
// ring 0 is light & low-chroma, ring 1 saturated mids. The hub (center) is
// intentionally NOT a ring here — it renders the *live* seed, not a fixed value,
// so it has no chroma/tone to configure.
export type WheelRing = { count: number; chroma: number; tone: number }

export const WHEEL_RINGS: readonly WheelRing[] = [
  { count: 6, chroma: 30, tone: 85 },
  { count: 12, chroma: 80, tone: 60 },
]
