// why: palette-override/ groups the post-construction palette mutation and
// its disable-rule selector. Mutation runs upstream of buildMdLayer in
// deriveTheme so every variant-specific tone choice flows through the
// override unchanged. Adding a disable rule: extend disabled-reason.ts;
// engine and UI both read from there. Adding an MCU palette to the
// override surface: extend PALETTE_FAMILIES in schema (TS enforces all
// consumers via the satisfies clause).
export { applyPaletteOverrides } from './apply'
export { paletteOverrideDisabledReason } from './disabled-reason'
