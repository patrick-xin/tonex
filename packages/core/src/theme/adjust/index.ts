// why: adjust/ groups the relative HCT token-adjustment primitives (#197). The
// leaf unit shiftHct moves a single color's tone + chroma by signed deltas and
// reports the ACHIEVED delta re-derived from the result — so callers see the
// gamut-clamped truth, not the request. Higher-level adjusters (adjustTokens,
// #198) build on this without re-implementing the decompose→shift→recompose
// honesty loop.
export { shiftHct } from './shift-hct'
export type { HctDelta, ShiftResult } from './shift-hct'
