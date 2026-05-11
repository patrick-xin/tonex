'use client'

import { type TokenMap, useResolvedTokens } from '@tonex/core'
import { MD_PALETTE_FAMILY_NAMES, MD_PALETTE_TONE_NAMES } from '@tonex/core/schema'
import { hexFromArgb } from '@tonex/mcu'
import type { MouseEvent } from 'react'
import { useState } from 'react'
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
    <div className="w-full">
      <div className="flex gap-2 mb-4 justify-end">
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
      <PaletteGrid view={view} tones={tones} palettes={palettes} />
    </div>
  )
}

function PaletteGrid({
  view,
  tones,
  palettes,
}: {
  view: View
  tones: number[]
  palettes: PaletteMap
}) {
  const tooltipHandle = createTooltipHandle<{ tone: number; hex: string }>()
  const isHorizontal = view === 'horizontal'
  return (
    <div
      className={
        isHorizontal
          ? 'space-y-4 md:space-y-6 flex flex-col items-center'
          : 'space-y-4 md:space-y-6 flex flex-wrap justify-start sm:justify-center gap-2 w-full'
      }
    >
      {MD_PALETTE_FAMILY_NAMES.map((family) => (
        <div
          key={family}
          className={isHorizontal ? 'flex-1' : 'flex-1 min-w-[112px] max-w-[200px]'}
        >
          <p className="font-medium capitalize mb-1.5">{family.replace('-', ' ')}</p>
          <div className={isHorizontal ? 'flex gap-1 flex-wrap' : 'flex flex-col gap-2 flex-wrap'}>
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
                      className={
                        isHorizontal
                          ? 'h-12 w-16 cursor-pointer shrink-0 rounded-sm'
                          : 'h-9 w-full cursor-pointer shrink-0 rounded-sm px-[7px] py-[5px]'
                      }
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
          // why: Base UI fires 'trigger-press' on click; cancel so tooltip doesn't open after copy — toast.anchor is the feedback path
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
