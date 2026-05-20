'use client'

import { type TokenMap, useResolvedTokens } from '@tonex/core'
import { MD_PALETTE_FAMILY_NAMES, MD_PALETTE_TONE_NAMES } from '@tonex/core/schema'
import { hexFromArgb } from '@tonex/mcu'
import type { MouseEvent } from 'react'
import { useState } from 'react'
import { SectionHeading } from '@/components/shared/section-heading'
import { toast } from '@/components/ui/toast'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  createTooltipHandle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const TONES = [...MD_PALETTE_TONE_NAMES] as number[]
const TONES_REVERSED = [...MD_PALETTE_TONE_NAMES].reverse() as number[]

// why: matches legacy display order (error before neutrals) rather than
// schema iteration order (neutrals before error).
const FAMILY_ORDER = [
  'primary',
  'secondary',
  'tertiary',
  'error',
  'neutral',
  'neutral-variant',
] as const

type View = 'vertical' | 'horizontal'
type PaletteMap = Record<string, Record<number, string>>

function parsePaletteMap(palette: TokenMap): PaletteMap {
  const result: PaletteMap = {}
  for (const family of MD_PALETTE_FAMILY_NAMES) {
    result[family] = {}
    for (const tone of MD_PALETTE_TONE_NAMES) {
      const argb = palette[`--color-${family}-${tone}`]
      if (argb !== undefined) result[family][tone] = hexFromArgb(argb)
    }
  }
  return result
}

function handleCopy(e: MouseEvent<HTMLButtonElement>, hex: string) {
  navigator.clipboard.writeText(hex)
  toast.anchor(e.currentTarget, {
    description: 'Copied',
    timeout: 1500,
    side: 'bottom',
  })
}

export function ColorPalettes() {
  const theme = useResolvedTokens()
  const [view, setView] = useState<View>('horizontal')
  const [sort, setSort] = useState<'ascending' | 'descending'>('ascending')
  const tones = sort === 'ascending' ? TONES : TONES_REVERSED

  if (!theme) return null

  const palettes = parsePaletteMap(theme.md.palette)

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-6 justify-end">
        <ToggleGroup
          variant="outline"
          size="xs"
          defaultValue={['horizontal']}
          onValueChange={(v) => setView(v[0] as View)}
        >
          <ToggleGroupItem value="horizontal">Horizontal</ToggleGroupItem>
          <ToggleGroupItem value="vertical">Vertical</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          variant="outline"
          size="xs"
          defaultValue={['ascending']}
          onValueChange={(v) => setSort(v[0] as 'ascending' | 'descending')}
        >
          <ToggleGroupItem value="ascending">Tone (0-100)</ToggleGroupItem>
          <ToggleGroupItem value="descending">Tone (100-0)</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {view === 'horizontal' ? (
        <HorizontalView tones={tones} palettes={palettes} />
      ) : (
        <VerticalView tones={tones} palettes={palettes} />
      )}
    </div>
  )
}

function HorizontalView({ tones, palettes }: { tones: number[]; palettes: PaletteMap }) {
  const tooltipHandle = createTooltipHandle<{ tone: number; hex: string }>()
  return (
    <div className="space-y-4 md:space-y-6 flex flex-col size-full">
      {FAMILY_ORDER.map((family) => (
        <div key={family} className="w-full">
          <SectionHeading className="capitalize mb-1.5">{family.replace('-', ' ')}</SectionHeading>
          <div className="grid gap-1 grid-cols-[repeat(auto-fit,minmax(44px,1fr))]">
            <TooltipProvider>
              {tones.map((tone) => {
                const hex = palettes[family]?.[tone] ?? '#000000'
                return (
                  <TooltipTrigger
                    onClick={(e) => handleCopy(e, hex)}
                    handle={tooltipHandle}
                    payload={{ tone, hex }}
                    key={tone}
                    className="group relative flex flex-col items-center"
                  >
                    <div
                      className="h-12 w-full cursor-pointer rounded-sm"
                      style={{ backgroundColor: hex }}
                    />
                  </TooltipTrigger>
                )
              })}
            </TooltipProvider>
          </div>
        </div>
      ))}
      <Tooltip
        onOpenChange={(_, eventDetails) => {
          if (eventDetails.reason === 'trigger-press') {
            eventDetails.cancel()
            tooltipHandle.close()
          }
        }}
        handle={tooltipHandle}
      >
        {({ payload }) => (
          <TooltipContent className="flex flex-col gap-0.5">
            <span className="text-xs font-mono inline-block">Tone: {payload?.tone}</span>
            <span className="text-xs font-mono inline-block">{payload?.hex}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
}

function VerticalView({ tones, palettes }: { tones: number[]; palettes: PaletteMap }) {
  const tooltipHandle = createTooltipHandle<{ tone: number; hex: string }>()
  return (
    <div className="space-y-2 flex flex-wrap justify-start sm:justify-center gap-2 size-full">
      {FAMILY_ORDER.map((family) => (
        <div key={family} className="flex-1 min-w-28">
          <SectionHeading className="capitalize mb-1.5">{family.replace('-', ' ')}</SectionHeading>
          <div className="flex flex-col gap-3 flex-wrap">
            <TooltipProvider>
              {tones.map((tone) => {
                const hex = palettes[family]?.[tone] ?? '#000000'
                return (
                  <TooltipTrigger
                    onClick={(e) => handleCopy(e, hex)}
                    handle={tooltipHandle}
                    payload={{ tone, hex }}
                    key={tone}
                    className="group relative flex flex-col items-center"
                  >
                    <div
                      className="h-8 w-full cursor-pointer shrink-0 rounded-sm px-2 py-1"
                      style={{ backgroundColor: hex }}
                    />
                  </TooltipTrigger>
                )
              })}
            </TooltipProvider>
          </div>
        </div>
      ))}
      <Tooltip
        onOpenChange={(_, eventDetails) => {
          if (eventDetails.reason === 'trigger-press') {
            eventDetails.cancel()
            tooltipHandle.close()
          }
        }}
        handle={tooltipHandle}
      >
        {({ payload }) => (
          <TooltipContent className="flex flex-col gap-0.5">
            <span className="text-xs font-mono inline-block">Tone: {payload?.tone}</span>
            <span className="text-xs font-mono inline-block">{payload?.hex}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
}
