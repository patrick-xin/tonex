'use client'

import { selectSeedHex } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import { cn } from 'tailwind-variants'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { HexRimSwatch } from './hex-rim-swatch'
import { PRESETS1, PRESETS2, PRESETS3 } from './preset-colors'

type Preset = { name: string; hex: string }

function SeedSwatches() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const chip = (p: Preset) => (
    <button
      key={p.name}
      type="button"
      aria-label={p.name}
      // data-testid: the hex is the chip's real identity — it's what the chip
      // commits and what e2e asserts. Names aren't unique (PRESETS2/3 reuse them
      // for different hexes) and rows repeat, so a same-hex chip may appear more
      // than once; every instance commits the identical seed, so picking any is
      // equivalent. See e2e/README.md selector strategy.
      data-testid={`seed-preset-${p.hex}`}
      onClick={() => setSeedHex(p.hex)}
      className={cn('cursor-pointer rounded-md', focusVisiblePrimaryRing)}
    >
      <HexRimSwatch hex={p.hex} size="lg" active={seedHex === p.hex} />
    </button>
  )

  return (
    <div className="overflow-x-auto sm:overflow-x-hidden no-scrollbar mask-[linear-gradient(to_right,transparent,black_1.6rem,black_calc(100%-1rem),transparent)]">
      <div className="flex gap-4 pt-8 pb-2 sm:pb-4">{PRESETS1.map(chip)}</div>
      <div className="flex gap-4 pb-2 sm:pb-4 -translate-x-12">{PRESETS2.map(chip)}</div>
      <div className="flex gap-4 pb-2 sm:pb-4 translate-x-6">{PRESETS3.map(chip)}</div>
      <div className="flex gap-4 pb-2 sm:pb-4 -translate-x-4">{PRESETS2.map(chip)}</div>
    </div>
  )
}

export default SeedSwatches
