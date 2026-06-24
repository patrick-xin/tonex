'use client'

// A flat color swatch inside an asymmetric tonal rim (corner → middle → corner),
// built from an arbitrary preset *hex*. Sibling to components/shared/rim-swatch.tsx,
// which does the same for MD role tokens via useResolvedTokens — the seed presets
// are open-set hexes, not role tokens, so they need this hex-fed variant. Same rim
// math, fed from oklchString(argbFromHex(hex)): two stops ±RIM_SPAN/2 around the
// fill's own lightness, so the rim stays visible against any fill.

import { argbFromHex, hexFromOklch, oklchString } from '@tonex/core/oklch'
import { tv, type VariantProps } from 'tailwind-variants'
import { useActiveMode } from '@/features/theme-mode/use-active-mode'

const hexRimSwatch = tv({
  slots: {
    root: 'group/rim relative isolate p-px transition-transform duration-200',
    glow: 'pointer-events-none absolute inset-0 -z-10 opacity-0 blur-md transition-opacity duration-300 group-hover/rim:opacity-70',
    fill: 'size-full',
  },
  variants: {
    size: {
      sm: { root: 'size-12 rounded-sm', glow: 'rounded-sm', fill: 'rounded-sm' },
      md: { root: 'size-20 rounded-md', glow: 'rounded-md', fill: 'rounded-md' },
      lg: { root: 'size-16 sm:size-28 rounded-xl', glow: 'rounded-xl', fill: 'rounded-xl' },
    },
    active: {
      true: { glow: 'opacity-70' },
      false: {},
    },
  },
  defaultVariants: { size: 'md', active: false },
})

// Lightness band the rim spans, in OKLCH L (0–1). The two stops sit ±SPAN/2 around
// the fill's lightness, so the rim always differs from the fill by at least SPAN.
const RIM_SPAN = 0.34
const RIM_ANGLE = 135
const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

type HexRimSwatchProps = VariantProps<typeof hexRimSwatch> & {
  hex: string
  className?: string
}

export function HexRimSwatch({ hex, size, active, className }: HexRimSwatchProps) {
  // why: don't gate on useActiveMode being ready — these are decorative preset
  // chips, not token output. Fall back to dark-surface orientation pre-mount so
  // the marquee never renders empty.
  const mode = useActiveMode() ?? 'dark'
  const { root, glow, fill } = hexRimSwatch({ size, active })

  const match = OKLCH.exec(oklchString(argbFromHex(hex)))
  if (!match) return null
  const [l, c, h] = [Number(match[1]), Number(match[2]), Number(match[3])]
  // Center the band so it stays in [0,1] while hugging the fill's lightness — a
  // near-white fill biases it down, a near-black one up, so both stops stay in gamut.
  const center = clamp(l, RIM_SPAN / 2, 1 - RIM_SPAN / 2)
  const lighter = hexFromOklch(`oklch(${center + RIM_SPAN / 2} ${c} ${h})`)
  const darker = hexFromOklch(`oklch(${center - RIM_SPAN / 2} ${c} ${h})`)

  // The corner stop faces the page surface, so it takes the end that contrasts it —
  // lighter on a dark surface, darker on a light one; the middle band takes the other.
  const [corner, middle] = mode === 'dark' ? [lighter, darker] : [darker, lighter]
  const rim = `linear-gradient(${RIM_ANGLE}deg, ${corner}, ${middle}, ${corner})`

  return (
    <div className={root({ className })} style={{ background: rim }}>
      <span aria-hidden className={glow()} style={{ background: rim }} />
      <div className={fill()} style={{ background: hex }} />
    </div>
  )
}
