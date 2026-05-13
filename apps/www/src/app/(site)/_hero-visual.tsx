'use client'

import { type TokenMap, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { DEFAULT_INPUTS, MD_PALETTE_TONE_NAMES } from '@tonex/core/schema'
import { RotateCcw } from 'lucide-react'
import { m as motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ColorPicker } from '@/features/color-picker'

const PALETTES = [
  { label: 'Primary', emission: 'primary' },
  { label: 'Secondary', emission: 'secondary' },
  { label: 'Tertiary', emission: 'tertiary' },
  { label: 'Neutral', emission: 'neutral' },
  { label: 'N-variant', emission: 'neutral-variant' },
] as const

const DISPLAY_TONES = [...MD_PALETTE_TONE_NAMES].reverse()

const SMOOTH = [0.22, 1, 0.36, 1] as const

export function HeroVisual() {
  const theme = useResolvedTokens()
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)

  if (theme === null) return null

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: SMOOTH, delay: 0.15 }}
      className="relative z-10 my-auto hidden h-11/12 min-h-[60vh] items-stretch justify-stretch sm:flex lg:min-h-[80vh]"
    >
      <div
        className="relative flex-1 grid min-h-0 overflow-hidden grid-cols-5 grid-rows-[auto_1fr] gap-x-3 p-[18px] pt-20 rounded-[calc(var(--radius)+4px)] backdrop-blur-sm"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklch, var(--surface-container) 85%, transparent) 0%, color-mix(in oklch, var(--surface-container-low) 85%, transparent) 100%)',
          boxShadow:
            '0 1px 0 inset color-mix(in oklch, var(--on-surface) 8%, transparent), 0 40px 80px -30px oklch(0 0 0 / 0.6), 0 20px 40px -20px oklch(0 0 0 / 0.4)',
        }}
      >
        <div
          className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-lg border border-outline-variant/60 p-1 pr-1.5 whitespace-nowrap backdrop-blur-md"
          style={{
            background: 'color-mix(in oklch, var(--surface-container-lowest) 75%, transparent)',
          }}
        >
          <ColorPicker value={seedHex} onChange={setSeedHex} />
          <span className="font-mono text-sm text-on-surface tabular-nums">{seedHex}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSeedHex(DEFAULT_INPUTS.seedHex)}
            aria-label="Reset seed"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>

        {PALETTES.map((p) => (
          <div
            key={p.emission}
            className="col-span-1 row-start-1 flex items-center justify-between overflow-hidden whitespace-nowrap px-0.5 pb-1.5 font-mono text-sm font-medium uppercase tracking-[0.08em] text-on-surface-variant"
          >
            <span className="overflow-hidden text-ellipsis">{p.label}</span>
          </div>
        ))}

        {PALETTES.map((p, colIndex) => (
          <TonalColumn
            key={p.emission}
            palette={theme.md.palette}
            family={p.emission}
            colIndex={colIndex}
          />
        ))}
      </div>
    </motion.aside>
  )
}

function TonalColumn({
  palette,
  family,
  colIndex,
}: {
  palette: TokenMap
  family: string
  colIndex: number
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0 min-h-0 row-start-2">
      {DISPLAY_TONES.map((tone, i) => {
        const argb = palette[`--color-${family}-${tone}`]
        const color = argb !== undefined ? hexString(argb) : '#000000'
        return (
          <motion.div
            key={tone}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              ease: SMOOTH,
              delay: 0.3 + colIndex * 0.04 + i * 0.02,
            }}
            style={{ backgroundColor: color }}
            className="flex-1 rounded-[4px] flex flex-col justify-end px-[7px] py-[5px] min-h-0 cursor-default overflow-hidden"
          />
        )
      })}
    </div>
  )
}
