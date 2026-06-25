'use client'

import { Heatmap } from '@paper-design/shaders-react'
import type { Mode } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useResolvedTokens } from '@tonex/core-react'
import { useReducedMotion } from 'motion/react'
import { useActiveMode } from '@/features/theme-mode'
import { useShaderNoiseReady } from '@/lib/shader-noise-gate'

type Stop = readonly [family: string, tone: number]
type DotStops = readonly [Stop, Stop, Stop, Stop, Stop, Stop, Stop]

const PALETTE: Record<Mode, DotStops> = {
  light: [
    ['primary', 40],
    ['primary', 60],
    ['tertiary', 50],
    ['secondary', 70],
    ['tertiary', 80],
    ['neutral', 100],
    ['neutral', 99],
  ],
  dark: [
    ['primary', 60],
    ['primary', 40],
    ['tertiary', 50],
    ['secondary', 70],
    ['tertiary', 80],
    ['neutral', 60],
    ['neutral', 70],
  ],
}

type ResolvedTokens = NonNullable<ReturnType<typeof useResolvedTokens>>

function resolveDotColors(theme: ResolvedTokens, mode: Mode) {
  const toHex = (argb: number | undefined) => (argb === undefined ? '#000000' : hexString(argb))
  const pick = ([family, tone]: Stop) => toHex(theme.md.palette[`--color-${family}-${tone}`])
  return { dots: PALETTE[mode].map(pick) }
}

export default function LandingLogo() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const reduceMotion = useReducedMotion()
  const noiseReady = useShaderNoiseReady()

  // why: both hooks gate on a null pre-hydration state (identical contract).
  // Rendering the shader only once both resolve avoids a first-paint flash in
  // the wrong palette.
  const palette = theme && mode ? resolveDotColors(theme, mode) : null
  return (
    <div>
      {palette && noiseReady && (
        <Heatmap
          width={160}
          height={160}
          image="/logo.svg"
          colors={palette.dots}
          // colors={['#7e66bc', '#70b4fa', '#E6D7FF', '#0047AB']}
          // Transparent backdrop — the logo glyph composites over whatever's
          // behind it. NOT "transparent": paper-design's color parser only reads
          // #/rgb/hsl and falls back to opaque black for any keyword, so the
          // alpha has to be explicit (8-digit hex). u_colorBack is premultiplied
          // in-shader, so alpha 0 contributes nothing.
          colorBack="#00000000"
          contour={0.5}
          angle={-100}
          noise={0}
          innerGlow={0.5}
          outerGlow={0}
          speed={reduceMotion ? 0 : 1}
          scale={1}
        />
      )}
    </div>
  )
}
