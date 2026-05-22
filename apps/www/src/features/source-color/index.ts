// why: source-color is a workflow feature. Its public surface is two composed
// seed blocks — SourceColorTabs (md-rail) and ShadcnSourceColor (shadcn-rail).
// Both share one layout today: hex always-on as the canonical seed, HCT/image
// folded into a "Source control" disclosure (set-once, so folding reclaims rail
// space). Kept as two components so either layer can diverge in copy/behavior
// without disturbing the other. HCT
// primitives previously re-exported here moved to features/hct-controls per
// ADR-0022 (HCT controls are a layer-agnostic workflow used cross-feature, not
// a source-color-internal primitive).
export { ShadcnSourceColor } from './shadcn-source-color'
export { SourceColorTabs } from './source-color-tabs'
