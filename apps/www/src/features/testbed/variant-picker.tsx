'use client'

import { useSource, type VariantName, variants } from '@tonex/core'

export function VariantPicker() {
  const variant = useSource((s) => s.variant)
  const setVariant = useSource((s) => s.setVariant)
  const names = Object.keys(variants) as VariantName[]
  return (
    <label className="flex gap-3 items-center">
      <span className="w-10 text-sm">variant</span>
      <select
        value={variant}
        onChange={(e) => setVariant(e.target.value as VariantName)}
        className="font-mono text-xs px-2 py-1 border rounded bg-surface"
        aria-label="mcu variant"
      >
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
