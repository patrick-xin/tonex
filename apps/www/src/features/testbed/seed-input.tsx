'use client'

import { useSource } from '@tonex/core'

export function SeedInput() {
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.setSeedHex)
  const hydrated = useSource((s) => s._hydrated)

  return (
    <label className="flex gap-3 items-center">
      <span className="w-10 text-sm">seed</span>
      <input
        type="color"
        value={seedHex}
        onChange={(e) => setSeedHex(e.target.value)}
        aria-label="seed color picker"
      />
      <input
        type="text"
        value={seedHex}
        onChange={(e) => setSeedHex(e.target.value)}
        className="font-mono w-28 px-2 py-1 border rounded"
        aria-label="seed hex"
      />
      {!hydrated && <span className="opacity-50 text-xs">(hydrating…)</span>}
    </label>
  )
}
