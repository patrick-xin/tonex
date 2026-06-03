'use client'

import { selectSeedHex } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

export function SeedTrigger() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const { hexInput, handleChange, inputProps } = useHexFieldState(seedHex, setSeedHex)

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-block size-3 rounded-full shadow-sm"
        style={{ backgroundColor: seedHex }}
      />
      <input
        aria-label="Seed color hex value"
        type="text"
        value={hexInput}
        onChange={(e) => handleChange(e.target.value)}
        {...inputProps}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur()
        }}
        maxLength={7}
        spellCheck={false}
        className="w-[7ch] border-none bg-transparent p-0 font-mono tracking-normal underline decoration-on-surface-variant/30 decoration-dashed underline-offset-4 hover:decoration-on-surface-variant/60 focus:text-on-surface focus:decoration-on-surface focus:outline-none"
      />
    </span>
  )
}
