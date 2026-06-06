'use client'

import { cn } from 'tailwind-variants'
import { useActiveMode } from '@/features/theme-mode'

// Static Mondrian palette lifted from the app's current theme — frozen hex
// values (the composition is decorative, not engine-derived), but keyed by mode
// so the blocks read against whichever surface they sit on. The accent roles
// invert with the page: near-dark in light mode, light in dark mode, and the
// two surface-container tiers swap order — so the composition's value structure
// flips with the mode instead of going muddy.
const PALETTE = {
  light: {
    primary: '#5f5e5e',
    secondary: '#605f5e',
    tertiary: '#161616',
    surfaceContainer: '#f1edec',
    surfaceContainerHigh: '#ebe7e7',
  },
  dark: {
    primary: '#c8c6c5',
    secondary: '#a09d9d',
    tertiary: '#9f9d9d',
    surfaceContainer: '#1a1919',
    surfaceContainerHigh: '#201f1f',
  },
} as const

type Token = keyof (typeof PALETTE)['light']
type Block = { id: number; token: Token; x: number; y: number; w: number; h: number }

const blocks: Block[] = [
  // Left Column
  { id: 1, token: 'surfaceContainer', x: 5, y: 7, w: 22.5, h: 8 },
  { id: 2, token: 'surfaceContainer', x: 5, y: 38.5, w: 9.5, h: 34.5 },
  { id: 3, token: 'surfaceContainerHigh', x: 5, y: 75, w: 9.5, h: 19.5 },

  // Second Column (Center Large Blocks)
  { id: 4, token: 'primary', x: 16, y: 16.5, w: 46, h: 44 },
  { id: 5, token: 'tertiary', x: 16, y: 62, w: 22.5, h: 22.5 },

  // Third Column (Center-Right nested stack)
  { id: 6, token: 'surfaceContainer', x: 40, y: 62, w: 22.5, h: 11 },
  { id: 7, token: 'surfaceContainer', x: 40, y: 74.5, w: 22.5, h: 10 },
  { id: 8, token: 'tertiary', x: 40, y: 86, w: 22.5, h: 5.5 },

  // Right Column (Upper)
  { id: 9, token: 'surfaceContainerHigh', x: 64, y: 7, w: 26.5, h: 8 },
  { id: 10, token: 'surfaceContainerHigh', x: 64, y: 16.5, w: 26.5, h: 24 },

  // Right Column (Lower)
  { id: 11, token: 'surfaceContainerHigh', x: 64, y: 62, w: 26.5, h: 11 },
  { id: 12, token: 'secondary', x: 64, y: 74.5, w: 26.5, h: 17.5 },

  // Far Right Vertical Accent Lines
  { id: 13, token: 'surfaceContainer', x: 92, y: 7, w: 3.5, h: 66 },
  { id: 14, token: 'surfaceContainer', x: 92, y: 74.5, w: 3.5, h: 20 },
]

export function MondrianGrid() {
  const mode = useActiveMode()
  // why: useActiveMode returns null pre-hydration (identical contract to
  // useResolvedTokens) — render the frames at their real positions with a
  // neutral fill so the composition never shifts, only colors in once the mode
  // resolves.
  const palette = mode ? PALETTE[mode] : null

  return (
    <div className="flex items-center justify-center">
      {/* Outer wrapper mimicking an art frame */}
      <div className="w-full aspect-square">
        {/* Aspect ratio bounding box for exact relative scaling */}
        <div className="relative w-full h-full">
          {blocks.map((block) => (
            <div
              key={block.id}
              className={cn('absolute', !palette && 'bg-outline-variant/20')}
              style={{
                backgroundColor: palette?.[block.token],
                left: `${block.x}%`,
                top: `${block.y}%`,
                width: `${block.w}%`,
                height: `${block.h}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
