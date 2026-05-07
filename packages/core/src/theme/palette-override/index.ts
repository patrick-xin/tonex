// why: palette-override/ groups the post-construction palette mutation and
// its disable-rule selector. Mutation runs upstream of buildMdLayer in
// deriveTheme so every variant-specific tone choice flows through the
// override unchanged. Adding a disable rule: extend disabled-reason.ts;
// engine and UI both read from there. Adding an MCU palette to the
// override surface: extend PALETTE_NAMES in schema and PALETTE_FIELD in
// apply.ts (TS enforces both via the Record<PaletteName, …> type).
export { applyPaletteOverrides } from './apply'
export { paletteOverrideDisabledReason } from './disabled-reason'
