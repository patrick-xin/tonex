'use client'

import { selectSeedHex, useSource } from '@tonex/core'
import type { CSSProperties } from 'react'
import { cn } from 'tailwind-variants'

const PRESETS = [
  { name: 'Cobalt', hex: '#2D5BFF' },
  { name: 'Tangerine', hex: '#FF6A1A' },
  { name: 'Sage', hex: '#478f5c' },
  { name: 'Iris', hex: '#7A2FFF' },
  { name: 'Lagoon', hex: '#00C4C9' },
] as const

export function PresetsRow() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)

  return (
    <div className="inline-flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-widest">
      {PRESETS.map((p) => {
        const active = seedHex.toLowerCase() === p.hex.toLowerCase()
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => setSeedHex(p.hex)}
            style={{ '--preset-hex': p.hex } as CSSProperties}
            className={cn(
              'cursor-pointer text-on-surface-variant underline decoration-transparent underline-offset-4 transition-colors hover:decoration-[var(--preset-hex)] focus-visible:decoration-[var(--preset-hex)] focus-visible:outline-none font-medium uppercase',
              active && 'decoration-[var(--preset-hex)]',
            )}
          >
            {p.name}
          </button>
        )
      })}
    </div>
  )
}
