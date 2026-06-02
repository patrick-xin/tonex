'use client'

import { selectSeedHex } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import type { CSSProperties } from 'react'
import { cn } from 'tailwind-variants'

const PRESETS = [
  { name: 'Laser', hex: '#caff00' },
  { name: 'Wine', hex: '#722f37' },
  { name: 'Frost', hex: '#a9d6f5' },
  { name: 'Vermilion', hex: '#ff3b00' },
  { name: 'Mushroom', hex: '#a89a8c' },
  { name: 'Cyber', hex: '#9b5cff' },
  { name: 'Sunburst', hex: '#ffc400' },
  { name: 'Navy', hex: '#1b2a4a' },
  { name: 'Bubblegum', hex: '#ff5fa2' },
  { name: 'Olive', hex: '#6f7531' },
  { name: 'Voltage', hex: '#00e0ff' },
  { name: 'Brick', hex: '#9e3b2e' },
  { name: 'Lavender', hex: '#c4a7ff' },
  { name: 'Clover', hex: '#21c45d' },
  { name: 'Espresso', hex: '#2b2118' },
  { name: 'Coral', hex: '#ff6b6b' },
  { name: 'Ultramarine', hex: '#1e22ff' },
  { name: 'Sand', hex: '#d8c3a5' },
  { name: 'Fuchsia', hex: '#ff1f8f' },
  { name: 'Forest', hex: '#1f4d2e' },
  { name: 'Quartz', hex: '#e8b4bc' },
  { name: 'Tangelo', hex: '#ff7a00' },
  { name: 'Steel', hex: '#5a6b7d' },
  { name: 'Violet', hex: '#7b00ff' },
  { name: 'Terracotta', hex: '#c66a4f' },
  { name: 'Bone', hex: '#ece6da' },
  { name: 'Punch', hex: '#e91e63' },
  { name: 'Emerald', hex: '#0a7d54' },
  { name: 'Brat', hex: '#8ace00' },
  { name: 'Mauve', hex: '#a07d8f' },
] as const

import { Marquee } from '@/components/shared/marquee'
import { SectionHeader } from '../section-header'

export function SeedSection() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  return (
    <section className="mx-auto py-12 sm:py-24">
      <SectionHeader
        heading="Build a coherent palette from one seed"
        description="Pick a color, or drop in an image to extract one. Tonex resolves every state into one coherent system — light and dark together."
      />
      <Marquee pauseOnHover className="[--duration:60s] gap-8">
        {PRESETS.map((p) => {
          const active = seedHex === p.hex
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setSeedHex(p.hex)}
              style={{ '--preset-hex': p.hex, backgroundColor: p.hex } as CSSProperties}
              className={cn(
                'cursor-pointer text-on-surface-variant underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[var(--preset-hex)] focus-visible:decoration-[var(--preset-hex)] focus-visible:outline-none font-medium uppercase size-24 rounded-md',
                active && 'decoration-[var(--preset-hex)]',
              )}
            >
              {/* {p.name} */}
            </button>
          )
        })}
      </Marquee>
    </section>
  )
}
