import { hctFromHex, hexFromHct } from '../hct'

export interface HctDelta {
  dTone: number
  dChroma: number
}

export interface ShiftResult {
  hex: string
  achieved: HctDelta
}

// why: the leaf primitive of the token-adjust feature (#197). Shifts a single
// color's tone + chroma together by signed deltas and recomposes a valid hex.
// Hue is NOT an input axis — only tone and chroma move; hue is carried through
// untouched.
//
// The load-bearing contract is HONESTY: `achieved` is RE-DERIVED from the
// result color (decompose the output, diff against the input), never echoed
// from the request. `hexFromHct` routes through MCU's HctSolver, which silently
// snaps chroma to the gamut wall when the request over-reaches — so an
// over-reaching `dChroma` yields `achieved.dChroma < requested.dChroma` while
// still returning a valid hex. This function therefore NEVER throws on
// over-reach; the clamp is reported as a smaller achieved delta, not an error.
// Callers (adjustTokens, #198) depend on that achieved value to know what the
// engine could actually deliver vs what was asked.
export function shiftHct(hex: string, delta: HctDelta): ShiftResult {
  const before = hctFromHex(hex)
  const resultHex = hexFromHct({
    hue: before.hue,
    chroma: before.chroma + delta.dChroma,
    tone: before.tone + delta.dTone,
  })
  const after = hctFromHex(resultHex)
  return {
    hex: resultHex,
    achieved: {
      dTone: after.tone - before.tone,
      dChroma: after.chroma - before.chroma,
    },
  }
}
