// why: contrast/ groups the WCAG-pair scorer and its closed pair tuple.
// pairs.ts owns the catalogue (`CONTRAST_PAIRS` + `customColorContrastPairs`)
// and the threshold constants per ADR-0025 c.6+c.7; contrast.ts owns
// `evaluateThemeContrast` per ADR-0025 c.8 — downstream of `DerivedTheme`,
// never on the spine. Lifted from theme/schema.ts + theme/contrast.ts in
// #64 so the persisted-shape file stops owning analysis data and runtime
// helpers. Adding a new pair: extend `CONTRAST_PAIRS` in ./pairs (type
// system enforces the token-name union via StaticContrastPair). Internal
// cross-file imports inside contrast/ stay on direct sibling paths
// (./contrast, ./pairs) so the barrel doesn't introduce circular-import
// risk within the folder.

export {
  buildReport,
  type ContrastReport,
  evaluateThemeContrast,
  type PairResult,
} from './contrast'
export {
  CONTRAST_PAIRS,
  type ContrastPair,
  customColorContrastPairs,
  type ResolveContrastPairsResult,
  resolveContrastPairs,
} from './pairs'
