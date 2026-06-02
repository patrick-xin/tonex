'use client'

import {
  VARIANT_GROUPS_ORDERED,
  type VariantGroup,
  type VariantName,
  variants,
} from '@tonex/core/variants'
import { useSource } from '@tonex/core-react'

const GROUP_LABEL: Record<VariantGroup, string> = {
  cmf: 'CMF',
  standard: 'Standard',
  expressive: 'Expressive',
  subdued: 'Subdued',
}

export function VariantPicker() {
  const variant = useSource((s) => s.variant)
  const setVariant = useSource((s) => s.actions.setVariant)
  const grouped = (Object.keys(variants) as VariantName[]).reduce<
    Record<VariantGroup, VariantName[]>
  >(
    (acc, name) => {
      const g = variants[name].group
      acc[g] = acc[g] ?? []
      acc[g].push(name)
      return acc
    },
    { cmf: [], standard: [], expressive: [], subdued: [] },
  )
  return (
    <label className="flex gap-3 items-center">
      <span className="w-10 text-sm">variant</span>
      <select
        value={variant}
        onChange={(e) => setVariant(e.target.value as VariantName)}
        className="font-mono text-xs px-2 py-1 border rounded bg-surface"
        aria-label="mcu variant"
      >
        {VARIANT_GROUPS_ORDERED.map((group) => (
          <optgroup key={group} label={GROUP_LABEL[group]}>
            {grouped[group].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
