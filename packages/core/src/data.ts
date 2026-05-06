// why: data subpath — static palette tables and palette-name enums. These
// are values, not algorithms; pulling them through the engine barrel
// inflated its surface. Editor controls that pick from a fixed palette
// (TW shade picker, neutral palette picker) consume from here.
export {
  NEUTRAL_PALETTE_NAMES,
  type NeutralPaletteName,
} from './theme/surface'
export { TAILWIND_PALETTE_OKLCH } from './theme/surface/tailwind-colors'
