'use client'

import { hexString, relativeLuminance } from '@tonex/core/oklch'
import { useResolvedTokens } from '@tonex/core-react'
import { cn } from 'tailwind-variants'

const SWATCHES = [
  { name: 'Primary', family: 'primary', tones: [80, 60, 50, 40], layout: 'wide', stack: 'left' },
  {
    name: 'Secondary',
    family: 'secondary',
    tones: [80, 60, 50, 40],
    layout: 'narrow',
    stack: 'up',
  },
  { name: 'Tertiary', family: 'tertiary', tones: [80, 60, 50, 40], layout: 'narrow', stack: 'up' },
  { name: 'Neutral', family: 'neutral', tones: [60, 40, 30, 20], layout: 'narrow', stack: 'up' },
] as const

// the labelled face sits last; the rest stack behind it.
const FOREGROUND = 3

// why: WCAG-optimal pivot for black-vs-white text — a swatch luminance above
// this reads better on dark ink, below it on light. Picks ink from the brand
// neutrals so labels stay legible whatever the seed resolves to.
const INK_PIVOT = 0.179

type Swatch = (typeof SWATCHES)[number]
type Palette = NonNullable<ReturnType<typeof useResolvedTokens>>['md']['palette']

function resolveSwatch(palette: Palette, { family, tones }: Swatch) {
  const layers = tones.map((tone) => hexString(palette[`--color-${family}-${tone}`]))
  // ink is keyed off the face tone (last in the ramp) so the label reads against
  // the card it actually sits on.
  const faceArgb = palette[`--color-${family}-${tones[FOREGROUND]}`]
  const ink = relativeLuminance(faceArgb) > INK_PIVOT ? '--color-neutral-10' : '--color-neutral-95'
  return {
    layers,
    hex: hexString(faceArgb),
    foreground: hexString(palette[ink]),
  }
}

function SwatchCard({
  swatch,
  palette,
  className,
}: {
  swatch: Swatch
  palette: Palette | null
  className?: string
}) {
  // why: null pre-hydration is the contract from useResolvedTokens — render the
  // frame at its real size so the card never shifts once tokens resolve. Width is
  // fluid: the caller's column sizes the card, so it never overflows the cell.
  const color = palette ? resolveSwatch(palette, swatch) : null
  // stack the four tones as flow blocks instead of an absolutely-positioned deck:
  // the back tones show as thin strips, the labelled face fills the rest. No
  // transforms or z-index, so nothing overflows and there is no offset math.
  const direction = swatch.stack === 'left' ? 'flex-row' : 'flex-col'

  return (
    <div className={cn('flex', direction, className)}>
      {swatch.tones.map((tone, layer) => {
        const isForeground = layer === FOREGROUND

        return (
          <div
            key={`${swatch.family}-${tone}`}
            style={{ backgroundColor: color?.layers[layer] }}
            className={isForeground ? 'flex-1' : 'shrink-0 basis-8'}
          >
            {isForeground && color && (
              <div style={{ color: color.foreground }} className="flex h-full flex-col justify-end">
                <div className="w-full flex flex-col gap-2 py-2 px-1">
                  <span className="text-xs font-medium">{swatch.name}</span>
                  <span className="font-mono text-xs uppercase">{color.hex}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function DesignPalette() {
  const theme = useResolvedTokens()
  const palette = theme?.md.palette ?? null
  const [primary, ...rest] = SWATCHES

  // md+: one row of two columns, text+Primary wider than the rest. Mobile: the
  // two columns stack into two equal-width rows. pl-9/pt-9 reserve room for the
  // decks' leftward/upward ghost cards so nothing clips out of the section.
  return (
    <div className="p-6 md:p-8 md:py-12">
      <div className="grid grid-cols-1 items-end gap-x-2 gap-y-10 md:grid-cols-[3fr_2.5fr] h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-start bg-surface-container p-2 h-24">
            <div className="flex items-baseline gap-x-4">
              <div className="text-6xl font-semibold">Aa</div>
              <div className="text-4xl font-semibold">Aa</div>
              <div className="text-2xl font-semibold">Aa</div>
            </div>
          </div>
          <SwatchCard swatch={primary} palette={palette} className="size-full flex-1 shrink-0" />
        </div>
        <div className="flex gap-2 h-full">
          {rest.map((swatch) => (
            <SwatchCard
              key={swatch.family}
              swatch={swatch}
              palette={palette}
              className="flex-1 min-w-0 text-center"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
