'use client'

import { useSource } from '@tonex/core'
import { type PaletteName, paletteOverrideDisabledReason } from '@tonex/core/schema'
import { AnimatedButtonColorPicker } from './animated-button-color-picker'

// why: one row per MCU palette family. Writing here regenerates the family
// via TonalPalette swap (see core's applyPaletteOverrides), unlike the prior
// token-pin which only moved one md token. neutral drives surface; neutral-
// variant drives outline — that's why those rows are labeled accordingly.
const SLOTS: ReadonlyArray<{ label: string; palette: PaletteName }> = [
  { label: 'Primary', palette: 'primary' },
  { label: 'Secondary', palette: 'secondary' },
  { label: 'Tertiary', palette: 'tertiary' },
  { label: 'Error', palette: 'error' },
  { label: 'Surface', palette: 'neutral' },
  { label: 'Outline', palette: 'neutralVariant' },
]

export function FineTuneColors() {
  return (
    <div className="flex flex-col gap-0.5">
      {SLOTS.map((s) => (
        <Row key={s.palette} label={s.label} palette={s.palette} />
      ))}
    </div>
  )
}

function Row({ label, palette }: { label: string; palette: PaletteName }) {
  // why: disable backstop in the UI so invalid combos (e.g. tertiary under
  // cmf) can't be edited. Setter no-ops on the same predicate; this is the
  // up-front disable per "disable over warn".
  const reason = useSource((s) => paletteOverrideDisabledReason(palette, s))
  return (
    <AnimatedButtonColorPicker
      palette={palette}
      label={label}
      disabled={reason !== null}
      disabledReason={reason}
    />
  )
}
