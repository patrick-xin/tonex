import type { PortableTheme } from '../schema'
import type { AdjustResult } from './adjust-tokens'

// why: the persist seam of the token-adjust feature (#198). Core owns writing
// each result's `after` hex into md3TokenOverrides[mode][token] so the consumer
// (CLI #199) never hand-assembles the pin map — it calls adjustTokens to get
// the facts, then this to fold them into the theme. The pair closes the
// round-trip: the next deriveTheme reflects the pin because
// applyMd3TokenOverrides runs last in the md pipeline.
//
// PURE: clones source and its per-mode override maps (never aliases them) and
// returns a NEW PortableTheme; source is untouched. An empty results list
// returns a theme deep-equal to source — applying nothing changes nothing
// (drift-guard friendly).
export function applyAdjustments(
  source: PortableTheme,
  results: readonly AdjustResult[],
): PortableTheme {
  // why: shallow-clone the theme, then deep-clone ONLY the two override maps we
  // write into — aliasing source's maps would mutate source on assignment.
  // Other fields are read-only here, so a shallow share is safe.
  const light = { ...source.md3TokenOverrides.light }
  const dark = { ...source.md3TokenOverrides.dark }

  for (const { mode, token, after } of results) {
    const target = mode === 'light' ? light : dark
    target[token] = after
  }

  return {
    ...source,
    md3TokenOverrides: { light, dark },
  }
}
