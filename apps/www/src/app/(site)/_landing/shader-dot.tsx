'use client'

import { DotOrbit } from '@paper-design/shaders-react'
import type { Mode } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useResolvedTokens } from '@tonex/core-react'
import { useReducedMotion } from 'motion/react'
import { useActiveMode } from '@/features/theme-mode'
import { useShaderNoiseReady } from '@/lib/shader-noise-gate'

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

export function ShaderDots() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const reduceMotion = useReducedMotion()
  const noiseReady = useShaderNoiseReady()

  // why: both hooks gate on a null pre-hydration state (identical contract).
  // Rendering the shader only once both resolve avoids a first-paint flash in
  // the wrong palette.
  const palette = theme && mode ? resolveDotColors(theme, mode) : null

  return (
    <div className="relative h-72 overflow-hidden max-w-7xl mx-auto">
      <div className="absolute inset-0 z-0">
        {palette && noiseReady && (
          <DotOrbit
            scale={0.5}
            colors={palette.dots}
            colorBack="#00000000"
            stepsPerColor={1}
            size={1}
            sizeRange={0.5}
            spreading={1}
            speed={reduceMotion ? 0 : 0.5}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  )
}
