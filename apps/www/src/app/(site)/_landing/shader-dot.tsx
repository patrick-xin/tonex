'use client'

import type { Mode } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useResolvedTokens } from '@tonex/core-react'
import { useInView, useReducedMotion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { cn } from 'tailwind-variants'
import { useActiveMode } from '@/features/theme-mode'
import { useShaderNoiseReady } from '@/lib/shader-noise-gate'

// why: defer the @paper-design/shaders-react bundle (the route's largest client
// dep) out of first-load JS — it streams in as a post-hydration chunk. The
// shader only renders once `palette && noiseReady`, so there's no flash while
// the chunk loads.
const DotOrbit = dynamic(() => import('@paper-design/shaders-react').then((m) => m.DotOrbit), {
  ssr: false,
})

type Stop = readonly [family: string, tone: number]

// DotOrbit blends up to 10 colors (dotOrbitMeta.maxColorCount). The tuple is
// fixed-length so an over-count is a compile error, not a silently dropped
// uniform.
//
// why: the MD3 tonal palette is mode-invariant (deriveTheme builds it once off
// the light scheme), so a single fixed hex would render identically in both
// modes. Dots only read against their surface when they out-luminate it, so we
// flip the tone selection per mode rather than the hue — light floats mid tones
// over a near-white surface, dark glows over a near-black one. Same seed hues.
// colorBack tracks the live --color-surface so the field blends into the page.
//
// Paper-design blends in gamma sRGB, not OKLab; gradient midpoints aren't
// perceptually interpolated. Fine for ambient atmosphere.
type DotStops = readonly [Stop, Stop, Stop, Stop, Stop, Stop, Stop, Stop, Stop, Stop]

const PALETTE: Record<Mode, DotStops> = {
  light: [
    ['primary', 40],
    ['primary', 60],
    ['secondary', 50],
    ['secondary', 70],
    ['tertiary', 50],
    ['tertiary', 70],
    ['primary', 80],
    ['neutral-variant', 70],
    ['neutral', 80],
    ['neutral', 90],
  ],
  dark: [
    ['primary', 40],
    ['primary', 60],
    ['secondary', 50],
    ['secondary', 70],
    ['tertiary', 40],
    ['tertiary', 60],
    ['primary', 80],
    ['neutral-variant', 60],
    ['neutral', 60],
    ['neutral', 70],
  ],
}

type ResolvedTokens = NonNullable<ReturnType<typeof useResolvedTokens>>

function resolveDotColors(theme: ResolvedTokens, mode: Mode) {
  const toHex = (argb: number | undefined) => (argb === undefined ? '#000000' : hexString(argb))
  const pick = ([family, tone]: Stop) => toHex(theme.md.palette[`--color-${family}-${tone}`])
  // surface is a semantic role (mode-dependent), not a palette tone — read it
  // from the active mode layer so the backdrop matches the live page surface.
  return {
    dots: PALETTE[mode].map(pick),
    back: toHex(theme.md[mode]['--color-surface']),
  }
}

export function ShaderDots({ className }: { className?: string }) {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const reduceMotion = useReducedMotion()
  const noiseReady = useShaderNoiseReady()

  // why: this field sits well below the fold. Pause it whenever it's off-screen
  // so its RAF/GPU loop doesn't run through the whole hero→export scroll —
  // speed=0 idles the shader in place (no remount, GL context stays warm), and
  // the margin spins it up just before it scrolls in so there's no static-to-
  // animating pop.
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '200px 0px' })

  // why: both hooks gate on a null pre-hydration state (identical contract).
  // Rendering the shader only once both resolve avoids a first-paint flash in
  // the wrong palette.
  const palette = theme && mode ? resolveDotColors(theme, mode) : null

  return (
    <div ref={ref} className={cn('relative h-72 overflow-hidden mx-auto', className)}>
      {palette && noiseReady && (
        <DotOrbit
          scale={1}
          colors={palette.dots}
          colorBack="#00000000"
          stepsPerColor={1.5}
          size={1}
          sizeRange={0.5}
          spreading={1}
          speed={reduceMotion || !inView ? 0 : 0.4}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  )
}
