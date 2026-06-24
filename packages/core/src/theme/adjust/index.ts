// why: adjust/ groups the relative HCT token-adjustment primitives (#197). The
// leaf unit shiftHct moves a single color's tone + chroma by signed deltas and
// reports the ACHIEVED delta re-derived from the result — so callers see the
// gamut-clamped truth, not the request. Higher-level adjusters (adjustTokens,
// #198) build on this without re-implementing the decompose→shift→recompose
// honesty loop.

export type { AdjustRequest, AdjustResult } from './adjust-tokens'
// why: the source-aware adjusters (#198) build on shiftHct. adjustTokens
// derives once and returns per-token before/after/achieved FACTS (pure, no
// persist); applyAdjustments folds those facts into md3TokenOverrides (the
// persist seam core owns). The CLI (#199) imports both from @tonex/core/adjust.
export { adjustTokens } from './adjust-tokens'
export { applyAdjustments } from './apply-adjustments'
export type { HctDelta, ShiftResult } from './shift-hct'
export { shiftHct } from './shift-hct'
