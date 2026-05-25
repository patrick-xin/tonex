// why: oklch subpath — color-space conversion utilities. Separate from
// engine because callers that only need to round-trip a hex through oklch
// (palette pickers, color-input controls) shouldn't pull the engine. The
// engine itself uses these internally via `./theme/oklch`.
//
// ADR-0021: argb-canonical TokenMap means downstream readers (swatch
// previews, hex-input pickers) project at the read site. `oklchString` /
// `hexString` are the boundary helpers; both wrap the same primitives the
// internal seam uses so projection drift across consumers is impossible.
export {
  argbComponents,
  argbFromHex,
  hexFromOklch,
  hexString,
  oklchString,
  relativeLuminance,
} from './theme/oklch'
