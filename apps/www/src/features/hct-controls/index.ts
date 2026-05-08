// why: HCT controls are a tonex-domain workflow ("tune in HCT space") used
// cross-feature and layer-agnostic. Per ADR-0022 they live as their own
// workflow feature rather than as primitives buried under source-color.
// Public surface: the composed slider triplet (HctControlSliders) for
// source-color's seed editor, plus the individual axis sliders + matching
// gradient builders for siblings (palette-override, custom-colors) that
// compose their own HCT triplets against different state stores.
export { ChromaSlider } from './chroma-slider'
export { chromaGradient, hueGradient, toneGradient } from './gradients'
export { HctControlSliders } from './hct-control-sliders'
export { HctSlider } from './hct-slider'
