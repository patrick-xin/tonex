import type { ReactNode } from 'react'

/**
 * Copy for the tabular Key Concepts accordions. Each row maps to one
 * `<ConceptTable>` line — edit the text here, not in the JSX.
 */
export type ConceptRow = { key: string; col1: ReactNode; col2: ReactNode }

/**
 * Light & dark — which settings are one shared value vs stored per mode.
 * Source of truth: PortableTheme field classification (see core schema).
 * Contrast level is PER-MODE (split in #123) — note the one-preset caveat.
 */
export const MODE_SCOPE_ROWS: ConceptRow[] = [
  { key: 'seed', col1: 'Seed color', col2: 'Shared' },
  { key: 'variant', col1: 'Scheme variant', col2: 'Shared' },
  { key: 'custom-colors', col1: 'Custom colors', col2: 'Shared' },
  { key: 'palette-overrides', col1: 'Palette overrides', col2: 'Shared' },
  { key: 'cmf-second', col1: 'CMF second source', col2: 'Shared' },
  { key: 'chart-settings', col1: 'Chart settings', col2: 'Shared' },
  {
    key: 'contrast',
    col1: 'Contrast level',
    col2: 'Per-mode',
  },
  { key: 'surface-strength', col1: 'Surface adjustment (Tint / Desaturate)', col2: 'Per-mode' },
  { key: 'tint-text', col1: 'Tint text accent', col2: 'Per-mode' },
  { key: 'role-bindings', col1: 'Role bindings', col2: 'Per-mode' },
  { key: 'color-overrides', col1: 'Color overrides', col2: 'Per-mode' },
]

/** Scheme Variants — name → palette character. */
export const SCHEME_VARIANT_ROWS: ConceptRow[] = [
  {
    key: 'cmf',
    col1: "CMF (App's Default)",
    col2: 'Stands for Color, Material, and Finish. Latest algorithm from MCU.',
  },
  {
    key: 'tonal-spot',
    col1: 'Tonal Spot',
    col2: 'The default Material You scheme.',
  },
  {
    key: 'fidelity',
    col1: 'Fidelity',
    col2: 'Stays close to your seed color. What you pick is roughly what you get.',
  },
  {
    key: 'content',
    col1: 'Content',
    col2: 'Similar to Fidelity but more conservative. Good for image-heavy interfaces.',
  },
  {
    key: 'vibrant',
    col1: 'Vibrant',
    col2: 'Pushes chroma to the maximum for a bold, energetic palette.',
  },
  {
    key: 'expressive',
    col1: 'Expressive',
    col2: 'Uses contrasting hues across roles for a dynamic, unexpected feel.',
  },
  {
    key: 'fruit-salad',
    col1: 'Fruit Salad',
    col2: 'Rotates hues across palette roles for a playful, multicolor result.',
  },
  {
    key: 'rainbow',
    col1: 'Rainbow',
    col2: 'Similar to Fruit Salad but with wider hue spread.',
  },
  {
    key: 'neutral',
    col1: 'Neutral',
    col2: 'Desaturated. Minimal chroma, close to grayscale.',
  },
  {
    key: 'monochrome',
    col1: 'Monochrome',
    col2: 'Single hue, zero chroma variation. Ultra-minimal.',
  },
]
