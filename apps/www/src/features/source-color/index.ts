// why: source-color is a workflow feature — its public surface is the
// composed tabs panel that md-rail mounts. HCT primitives previously
// re-exported here moved to features/hct-controls per ADR-0022 (HCT
// controls are a layer-agnostic workflow used cross-feature, not a
// source-color-internal primitive).
export { SourceColorTabs } from './source-color-tabs'
