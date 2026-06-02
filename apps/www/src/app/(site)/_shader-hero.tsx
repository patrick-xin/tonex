'use client'

import { GodRays } from '@paper-design/shaders-react'
import type { Mode } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useResolvedTokens } from '@tonex/core-react'
import { useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useActiveMode } from '@/features/theme-mode'
import { useShaderNoiseReady } from '@/lib/shader-noise-gate'
import { HeroContent } from './_hero-content'

type Stop = readonly [family: string, tone: number]

// GodRays blends exactly 5 ray colors (godRaysMeta.maxColorCount). The `rays`
// tuple is fixed-length so an over-count is a compile error, not a silently
// dropped uniform.
//
// why: the MD3 tonal palette is mode-invariant (deriveTheme builds it once off
// the light scheme), so a single fixed hex would render identically in both
// modes. Rays only read as *light* when they out-luminate their base, so we
// flip the tone selection per mode rather than the hue — light floats mid tones
// over a near-white base, dark glows over a near-black one. Same seed hues.
//
// Paper-design blends in gamma sRGB, not OKLab; gradient midpoints aren't
// perceptually interpolated. Fine for ambient atmosphere.
const PALETTE: Record<
  Mode,
  { rays: readonly [Stop, Stop, Stop, Stop, Stop]; back: Stop; bloom: Stop }
> = {
  light: {
    rays: [
      ['primary', 40],
      ['primary', 70],
      ['secondary', 60],
      ['tertiary', 60],
      ['neutral', 90],
    ],
    back: ['neutral', 98],
    bloom: ['primary', 80],
  },
  dark: {
    rays: [
      ['primary', 40],
      ['primary', 60],
      ['secondary', 70],
      ['tertiary', 40],
      ['neutral', 60],
    ],
    back: ['neutral', 6],
    bloom: ['primary', 40],
  },
}

type ResolvedTokens = NonNullable<ReturnType<typeof useResolvedTokens>>

function resolveRayColors(theme: ResolvedTokens, mode: Mode) {
  const pick = ([family, tone]: Stop) => {
    const argb = theme.md.palette[`--color-${family}-${tone}`]
    return argb === undefined ? '#000000' : hexString(argb)
  }
  const stops = PALETTE[mode]
  return { rays: stops.rays.map(pick), back: pick(stops.back), bloom: pick(stops.bloom) }
}

// Target vertical position of the ray convergence in GodRays' object UV space
// (0.5 = canvas top edge); 0.55 sits just above it so rays descend from
// off-screen. We pin every aspect ratio to this one spot.
const RAY_CONVERGENCE_Y = 0.55

// why: a fixed GodRays offsetY drifts vertically with aspect ratio (the
// mobile-vs-desktop convergence mismatch), because its `fit: contain` box
// scales to the shorter canvas edge. Deriving offsetY from the measured canvas
// instead cancels that out and holds the convergence put. lvh-locked canvas
// means this recomputes only on real width changes, not address-bar scroll.
function useAspectOffsetY(target: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(-target)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width === 0 || height === 0) return
      // invert contain's vertical scale (height / shorter-edge) so target maps
      // to the same UV regardless of aspect
      const scaleY = Math.max(1, height / width)
      setOffsetY(-target * scaleY)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return [ref, offsetY] as const
}

export function ShaderHero() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const reduceMotion = useReducedMotion()
  const [shaderRef, offsetY] = useAspectOffsetY(RAY_CONVERGENCE_Y)
  const noiseReady = useShaderNoiseReady()

  // why: both hooks gate on a null pre-hydration state (identical contract).
  // Rendering the shader only once both resolve avoids a first-paint flash in
  // the wrong palette.
  const colors = theme && mode ? resolveRayColors(theme, mode) : null

  return (
    <section className="relative isolate flex min-h-dvh flex-col overflow-hidden px-4 md:px-12 lg:px-16">
      {/* why: lock the shader canvas to the *largest* viewport height (lvh,
          constant) instead of inheriting the section's dvh. On mobile, dvh
          shrinks/grows as the address bar shows/hides, which resizes the canvas
          and slides GodRays' resolution-dependent ray origin. Pinning to a
          fixed lvh keeps the convergence point put; the bar just clips the
          bottom of an ambient background. */}
      <div ref={shaderRef} className="absolute inset-x-0 top-0 z-0 h-[100lvh]">
        {colors && noiseReady && (
          <GodRays
            colorBack={colors.back}
            colorBloom={colors.bloom}
            colors={colors.rays}
            bloom={0.4}
            intensity={0.8}
            density={0.3}
            spotty={0.3}
            midSize={0.2}
            midIntensity={0.4}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={offsetY}
            speed={reduceMotion ? 0 : 0.75}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

      {/* scrim — denser on the left so the headline stays legible over the shader */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, color-mix(in oklch, var(--color-surface) 80%, transparent) 0%, color-mix(in oklch, var(--color-surface) 32%, transparent) 55%, transparent 100%)',
        }}
      />

      <div className="relative z-10 flex flex-1 min-h-0 items-center py-20 sm:py-24">
        <div className="w-full max-w-6xl">
          <HeroContent />
        </div>
      </div>
    </section>
  )
}
