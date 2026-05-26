'use client'

// PARKED ALTERNATIVE — not rendered. Drop-in swap for `_shader-hero.tsx` that
// uses paper-design's GrainGradient (the "C" variant from the shader-hero
// prototype) instead of MeshGradient. Kept "just in case" we want the grainier,
// noise-textured look on the hero later. Same scaffold/scrim/content as
// ShaderHero — only the shader differs.
//
// Same gamma-sRGB-blend caveat as ShaderHero applies.

import { GrainGradient } from '@paper-design/shaders-react'
import { useResolvedTokens } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { HeroContent } from './_hero-content'

const STOPS = [
  ['primary', 50],
  ['secondary', 60],
  ['tertiary', 50],
] as const

export function GrainShaderHero() {
  const theme = useResolvedTokens()
  const reduceMotion = useReducedMotion()

  const colors = useMemo(() => {
    if (!theme) return null
    const pick = (family: string, tone: number) => {
      const argb = theme.md.palette[`--color-${family}-${tone}`]
      return argb === undefined ? '#000000' : hexString(argb)
    }
    return {
      stops: STOPS.map(([family, tone]) => pick(family, tone)),
      back: pick('neutral', 98),
    }
  }, [theme])

  return (
    <section className="relative isolate flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden px-4 md:px-12 lg:px-16">
      <div className="absolute inset-0 z-0">
        {colors && (
          <GrainGradient
            colorBack={colors.back}
            colors={colors.stops}
            softness={0.8}
            intensity={0.45}
            noise={0.4}
            shape="blob"
            scale={1}
            speed={reduceMotion ? 0 : 0.5}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>

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
