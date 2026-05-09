import { wcagLuminance } from 'culori'
import { argbComponents } from './oklch'

// why: WCAG 2.x relative luminance via culori — gamma-correct path, exactly the
// formula tonex used in the hand-rolled implementation. Source-of-truth for
// `contrastRatio`; consumers that need a single channel's relative weight
// should compose against this rather than re-implementing.
export function relativeLuminance(argb: number): number {
  const { r, g, b } = argbComponents(argb)
  return wcagLuminance({ mode: 'rgb', r: r / 255, g: g / 255, b: b / 255 })
}

// why: `(Lhi + 0.05) / (Llo + 0.05)`. Order-independent — the spec defines it
// symmetric, and the hi/lo split makes that property visible at the call site
// rather than relying on a sort-by-magic.
export function contrastRatio(fgArgb: number, bgArgb: number): number {
  const a = relativeLuminance(fgArgb)
  const b = relativeLuminance(bgArgb)
  const [hi, lo] = a >= b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}
