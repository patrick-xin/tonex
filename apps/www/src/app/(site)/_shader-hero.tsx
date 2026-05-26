'use client'

import { MeshGradient } from '@paper-design/shaders-react'
import { useResolvedTokens } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { HeroContent } from './_hero-content'

// Hero background is a live MeshGradient seeded from the resolved palette
// (primary / secondary / tertiary tonal stops). It re-colors whenever the
// theme tokens change, so the background *is* the engine, not decoration.
//
// NOTE: paper-design blends the color stops in gamma sRGB space, not OKLab —
// gradient midpoints are not perceptually interpolated. Fine for ambient
// atmosphere; if we ever want perceptual fidelity here, hand-roll this one
// shader with an OKLab mix. Tracked in the shader-hero prototype NOTES.
const STOPS = [
  ['primary', 40],
  ['primary', 70],
  ['secondary', 50],
  ['tertiary', 60],
  ['neutral', 95],
] as const

export function ShaderHero() {
  const theme = useResolvedTokens()
  const reduceMotion = useReducedMotion()

  const colors = useMemo(() => {
    if (!theme) return null
    return STOPS.map(([family, tone]) => {
      const argb = theme.md.palette[`--color-${family}-${tone}`]
      return argb === undefined ? '#000000' : hexString(argb)
    })
  }, [theme])

  return (
    <section className="relative isolate flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 md:px-12 lg:px-16">
      <div className="absolute inset-0 z-0">
        {colors && (
          <MeshGradient
            colors={colors}
            distortion={0.8}
            swirl={0.6}
            speed={reduceMotion ? 0 : 0.6}
            grainOverlay={0.06}
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

      <div className="relative z-10 flex flex-1 min-h-0 items-center">
        <div className="w-full max-w-3xl">
          <HeroContent />
        </div>
      </div>
    </section>
  )
}
