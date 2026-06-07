'use client'

import { selectSeedHex } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

export function SeedTrigger() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  // why: same seed, same opt-in as the rail's HexInput — this writes to the same
  // setSeedHex (a lossy derivation input, not a WYSIWYG-pinned token), so a
  // shadcn/tweakcn user can drop their `oklch(L C H)` brand color straight in
  // here too (converted to its sRGB hex on commit).
  const { hexInput, handleChange, inputProps } = useHexFieldState(seedHex, setSeedHex, {
    acceptOklch: true,
  })

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-block size-3 rounded-full shadow-sm animate-pulse"
        style={{ backgroundColor: seedHex }}
      />
      <input
        aria-label="Seed color, hex or oklch"
        type="text"
        value={hexInput}
        onChange={(e) => handleChange(e.target.value)}
        {...inputProps}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur()
        }}
        // why: no maxLength — a pasted oklch(L C H) (~26 chars) would be truncated
        // to 7 and never parse. hexFromColorInput is the validity gate, not the
        // field length; w-[7ch] stays since the value flips back to hex on commit.
        spellCheck={false}
        className="w-[7ch] border-none bg-transparent p-0 font-mono tracking-normal underline decoration-on-surface-variant/30 decoration-dashed underline-offset-4 hover:decoration-on-surface-variant/60 focus:text-on-surface focus:decoration-on-surface focus:outline-none"
      />
    </span>
  )
}
