'use client'

import type { Mode } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { useResolvedTokens } from '@tonex/core-react'
import dynamic from 'next/dynamic'
import { cn } from 'tailwind-variants'
import { useActiveMode } from '@/features/theme-mode'

// why: defer the @paper-design/shaders-react bundle out of first-load JS — it
// streams in as a post-hydration chunk. The mesh only renders once the palette
// resolves, so there's no flash while the chunk loads.
const StaticMeshGradient = dynamic(
  () => import('@paper-design/shaders-react').then((m) => m.StaticMeshGradient),
  { ssr: false },
)

type Stop = readonly [family: string, tone: number]

// StaticMeshGradient blends up to 10 colors. The tuple is fixed-length so an
// over-count is a compile error, not a silently dropped uniform.
//
// why: the MD3 tonal palette is mode-invariant (deriveTheme builds it once off
// the light scheme), so a single fixed hex would render identically in both
// modes. The mesh has to read against its surface, so we flip the tone
// selection per mode rather than the hue — light ramps deep brand tones up into
// near-white, dark settles the same hues into low tones over a near-black page.
// Same seed hues, drawn from every family so the field shows the whole system
// the section is describing, derived from one seed.
//
// Paper-design blends in gamma sRGB, not OKLab; midpoints aren't perceptually
// interpolated. Fine for an ambient field.
type MeshStops = readonly [Stop, Stop, Stop, Stop, Stop, Stop, Stop]

const PALETTE: Record<Mode, MeshStops> = {
  light: [
    ['primary', 30],
    ['secondary', 40],
    ['primary', 50],
    ['secondary', 70],
    ['tertiary', 50],
    ['primary', 90],
    ['tertiary', 70],
  ],
  dark: [
    ['primary', 20],
    ['secondary', 30],
    ['primary', 40],
    ['secondary', 50],
    ['tertiary', 30],
    ['primary', 60],
    ['tertiary', 50],
  ],
}

type ResolvedTokens = NonNullable<ReturnType<typeof useResolvedTokens>>

function resolveMeshColors(theme: ResolvedTokens, mode: Mode) {
  const pick = ([family, tone]: Stop) => hexString(theme.md.palette[`--color-${family}-${tone}`])
  return PALETTE[mode].map(pick)
}

export function StoryMesh({ className }: { className?: string }) {
  const theme = useResolvedTokens()
  const mode = useActiveMode()

  // why: both hooks gate on a null pre-hydration state (identical contract).
  // Rendering the mesh only once both resolve avoids a first-paint flash in the
  // wrong palette.
  const colors = theme && mode ? resolveMeshColors(theme, mode) : null

  return (
    <div className={cn('w-full h-72', className)}>
      {colors && (
        <StaticMeshGradient
          style={{ height: '100%', width: '100%' }}
          colors={colors}
          positions={0}
          waveX={0.53}
          waveXShift={0}
          waveY={0.95}
          waveYShift={0.64}
          mixing={0.5}
          grainMixer={0}
          grainOverlay={0}
        />
      )}
    </div>
  )
}
