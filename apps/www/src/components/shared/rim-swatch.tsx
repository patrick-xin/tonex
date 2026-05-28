'use client'

import { useResolvedTokens } from '@tonex/core'
import { hexFromOklch, oklchString } from '@tonex/core/oklch'
import type { MdTokenName } from '@tonex/core/schema'
import { tv, type VariantProps } from 'tailwind-variants'
import { useActiveMode } from '@/features/theme-mode/use-active-mode'

// A flat color swatch inside an asymmetric tonal rim. The rim gradient runs
// corner → middle → corner, so the top-left and bottom-right corners match
// while the middle band crosses the other diagonal.
//
// The rim is derived from the swatch's *own fill color*, not a fixed family
// ramp — we read the fill token's resolved OKLCH and shift its lightness by a
// fixed span to make a lighter + darker stop. Two consequences fall out of
// that: (1) any role token works (primary, primary-container, surface-…), not
// just the few families that own a tonal ramp; (2) the rim stays visible no
// matter how light or dark the fill is, because its contrast is measured
// against the fill rather than a hardcoded tone that may collide with it.
//
// motion="spin" rotates the rim: the gradient angle becomes an @property-
// registered custom prop the browser can interpolate (plain CSS vars don't
// animate), driven 0→360° on a slow loop. Root + glow both run the same
// animation so they stay phase-locked, and reduced-motion freezes it.

const rimSwatch = tv({
  slots: {
    root: 'group relative isolate p-px',
    glow: 'pointer-events-none absolute inset-0 -z-10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-70',
    fill: 'size-full',
  },
  variants: {
    size: {
      sm: { root: 'size-12 rounded-sm', glow: 'rounded-sm', fill: 'rounded-sm' },
      md: { root: 'size-20 rounded-md', glow: 'rounded-md', fill: 'rounded-md' },
      lg: { root: 'size-32 rounded-xl', glow: 'rounded-xl', fill: 'rounded-xl' },
    },
    motion: {
      static: {},
      spin: { root: 'rim-swatch-spin', glow: 'rim-swatch-spin' },
    },
  },
  defaultVariants: { size: 'md', motion: 'static' },
})

// The slug form of every MD role token: '--color-primary' → 'primary'. Gives
// callers autocomplete over the full role set while keeping the prop terse.
type RimSwatchToken = MdTokenName extends `--color-${infer Slug}` ? Slug : never

type RimSwatchProps = VariantProps<typeof rimSwatch> & {
  token?: RimSwatchToken
  className?: string
}

// Lightness band the rim spans, in OKLCH L (0–1). The two stops sit ±SPAN/2
// around the fill's lightness, so the rim always differs from the fill by at
// least SPAN regardless of where the fill lands.
const RIM_SPAN = 0.34

// Resting rim angle, shared by the static rim and the spin's start/end frames
// so a spinning swatch begins in the same orientation as a static one.
const RIM_ANGLE = 135

const OKLCH = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

// Registers --rim-angle + the rotate keyframes for motion="spin". React 19
// hoists and dedupes <style> by `href`, so rendering this from every spinning
// instance still injects it exactly once — the component stays self-contained
// with no separate setup component to wire up.
const SPIN_CSS = `
@property --rim-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: ${RIM_ANGLE}deg;
}
@keyframes rim-swatch-rotate { to { --rim-angle: ${RIM_ANGLE + 360}deg; } }
.rim-swatch-spin { animation: rim-swatch-rotate 24s linear infinite; }
@media (prefers-reduced-motion: reduce) { .rim-swatch-spin { animation: none; } }
`

export function RimSwatch({ token = 'primary', size, motion, className }: RimSwatchProps) {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const { root, glow, fill } = rimSwatch({ size, motion })
  if (!theme || !mode) return null

  // Core + extended role maps merged so any MdTokenName resolves (containers,
  // fixed/dim, inverse all live in the extended layer).
  const roles =
    mode === 'dark'
      ? { ...theme.md.darkExtended, ...theme.md.dark }
      : { ...theme.md.lightExtended, ...theme.md.light }
  const argb = roles[`--color-${token}`]
  if (argb === undefined) return null

  // Read the fill's own OKLCH and build two stops a fixed lightness apart.
  // Center the band so it stays in [0,1] while hugging the fill's lightness —
  // a near-white fill biases the band downward, a near-black one upward, so
  // both stops remain in gamut and visibly distinct from the fill.
  const match = OKLCH.exec(oklchString(argb))
  if (!match) return null
  const [l, c, h] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const center = clamp(l, RIM_SPAN / 2, 1 - RIM_SPAN / 2)
  const lighter = hexFromOklch(`oklch(${center + RIM_SPAN / 2} ${c} ${h})`)
  const darker = hexFromOklch(`oklch(${center - RIM_SPAN / 2} ${c} ${h})`)

  // The corner stop faces the page surface, so it takes the end that contrasts
  // the surface: lighter on a dark surface, darker on a light one. The middle
  // band takes the other end. Both differ from the fill, so the rim reads
  // against the swatch too. Spinning swaps the fixed angle for the animated
  // custom property; the stops stay put so only the sweep direction rotates.
  const [corner, middle] = mode === 'dark' ? [lighter, darker] : [darker, lighter]
  const angle = motion === 'spin' ? 'var(--rim-angle)' : `${RIM_ANGLE}deg`
  const rim = `linear-gradient(${angle}, ${corner}, ${middle}, ${corner})`

  return (
    <div className={root({ className })} style={{ background: rim }}>
      {motion === 'spin' && (
        <style href="rim-swatch-spin" precedence="default">
          {SPIN_CSS}
        </style>
      )}
      <span aria-hidden className={glow()} style={{ background: rim }} />
      <div className={fill()} style={{ background: `var(--color-${token})` }} />
    </div>
  )
}
