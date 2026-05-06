// why: surface/ groups the post-MCU treatment algorithms (ADR-0018). Each
// algorithm exports a free function `(layer, [mode,] level, ...) → TokenMap`
// and touches only md surface tokens. derive.ts dispatches via source.surfaceAlgo.
// Adding a third algorithm: new file here, register the branch in
// derive.applyTreatment, extend SURFACE_ALGOS in schema.
export { applySurfaceDesaturate } from './desaturate'
export {
  NEUTRAL_PALETTE_NAMES,
  type NeutralPaletteName,
} from './tailwind-colors'
export { applySurfaceTint } from './tint'
