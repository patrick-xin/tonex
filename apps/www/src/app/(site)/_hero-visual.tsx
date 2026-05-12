'use client'

import { type TokenMap, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { MD_PALETTE_TONE_NAMES } from '@tonex/core/schema'

const PALETTES = [
  { label: 'Primary', emission: 'primary' },
  { label: 'Secondary', emission: 'secondary' },
  { label: 'Tertiary', emission: 'tertiary' },
  { label: 'Neutral', emission: 'neutral' },
  { label: 'N-variant', emission: 'neutral-variant' },
] as const

const DISPLAY_TONES = [...MD_PALETTE_TONE_NAMES].reverse()

export function HeroVisual() {
  const theme = useResolvedTokens()
  const seedHex = useSource((s) => s.seedHex)

  if (theme === null) return null

  return (
    <aside className="relative hidden sm:flex h-11/12 my-auto min-h-[80vh] items-stretch justify-stretch animate-rise [animation-delay:200ms] z-10">
      <div
        className="relative flex-1 grid min-h-0 overflow-hidden grid-cols-5 grid-rows-[auto_1fr] gap-x-3 p-[18px] pt-[54px] rounded-[calc(var(--radius)+4px)] border border-outline-variant backdrop-blur-sm"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in oklch, var(--surface-container) 85%, transparent) 0%, color-mix(in oklch, var(--surface-container-low) 85%, transparent) 100%)',
          boxShadow:
            '0 1px 0 inset color-mix(in oklch, var(--on-surface) 8%, transparent), 0 40px 80px -30px oklch(0 0 0 / 0.6), 0 20px 40px -20px oklch(0 0 0 / 0.4)',
        }}
      >
        <div className="absolute top-4 right-[18px] z-10 flex items-center gap-2">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-outline-variant font-mono text-[11px] text-on-surface whitespace-nowrap backdrop-blur-md"
            style={{
              background: 'color-mix(in oklch, var(--surface-container-lowest) 75%, transparent)',
            }}
          >
            <span
              className="size-3.5 rounded-[4px] shadow-[inset_0_0_0_1px_oklch(1_0_0_/_0.15)]"
              style={{ background: 'var(--primary)' }}
            />
            <span>{seedHex}</span>
          </div>
        </div>

        {PALETTES.map((p) => (
          <div
            key={p.emission}
            className="flex items-center justify-between px-0.5 pb-1.5 font-mono text-[9.5px] font-medium text-on-surface-variant uppercase tracking-[0.08em] opacity-75 overflow-hidden whitespace-nowrap col-span-1 row-start-1"
          >
            <span className="overflow-hidden text-ellipsis">{p.label}</span>
          </div>
        ))}

        {PALETTES.map((p) => (
          <TonalColumn key={p.emission} palette={theme.md.palette} family={p.emission} />
        ))}
      </div>
    </aside>
  )
}

function TonalColumn({ palette, family }: { palette: TokenMap; family: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0 min-h-0 row-start-2">
      {DISPLAY_TONES.map((tone, i) => {
        const argb = palette[`--color-${family}-${tone}`]
        const color = argb !== undefined ? hexString(argb) : '#000000'
        return (
          <div
            key={tone}
            style={{
              backgroundColor: color,
              animationDelay: `${0.35 + i * 0.028}s`,
            }}
            className="group/tone flex-1 rounded-[4px] flex flex-col justify-end px-[7px] py-[5px] min-h-0 animate-landing-tone-in cursor-default overflow-hidden"
          />
        )
      })}
    </div>
  )
}
