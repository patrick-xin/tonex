import type { EvaluatedPair } from './types'

export type DualIntentTier = 'pass' | 'fills-only' | 'fail'

export interface DualIntentBundle {
  text: EvaluatedPair
  nonText: EvaluatedPair
  tier: DualIntentTier
}

// why: --destructive is the one role checked at BOTH the text (4.5/7) and
// non-text (3/4.5) thresholds against the same neutral surface — it's used as
// inline `text-destructive` and as a fill/icon/border. Rendered as two rows it
// reads as redundant Pass/Pass or contradictory Pass/Fail for one swatch.
// Collapse to a single row with a tiered verdict computed from the two pairs:
//   clears text       → 'pass'       (fine as text and as fill)
//   clears only fill   → 'fills-only' (usable as icon/border/fill, low for text)
//   clears neither     → 'fail'
// Returns null for single-intent bundles — every non-destructive bundle, plus
// destructive after a Text/UI filter splits the bundle — so they render as
// ordinary per-criterion rows. Tier tracks the AA/AAA toggle for free because
// it reads effectivePasses, already baked against the selected level.
export function dualIntent(bundle: readonly EvaluatedPair[]): DualIntentBundle | null {
  const text = bundle.find((p) => p.pair.intent === 'text')
  const nonText = bundle.find((p) => p.pair.intent === 'non-text')
  if (!text || !nonText) return null
  const tier: DualIntentTier = text.effectivePasses
    ? 'pass'
    : nonText.effectivePasses
      ? 'fills-only'
      : 'fail'
  return { text, nonText, tier }
}
