'use client'

import { selectHydrated, selectSeedHex, useSource } from '@tonex/core'

export function SeedInput() {
  const seedHex = useSource(selectSeedHex)
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const setSeedHexLock = useSource((s) => s.actions.setSeedHexLock)
  const hydrated = useSource(selectHydrated)

  return (
    <label className="flex gap-3 items-center flex-wrap">
      <span className="w-10 text-sm">seed</span>
      <input
        type="color"
        value={seedHex}
        onChange={(e) => setSeedHex(e.target.value)}
        disabled={seedHexLock}
        aria-label="seed color picker"
      />
      <input
        type="text"
        value={seedHex}
        onChange={(e) => setSeedHex(e.target.value)}
        disabled={seedHexLock}
        className="font-mono w-28 px-2 py-1 border rounded disabled:opacity-50"
        aria-label="seed hex"
      />
      <button
        type="button"
        onClick={() => setSeedHexLock(!seedHexLock)}
        className="text-xs px-2 py-1 border rounded"
        aria-pressed={seedHexLock}
      >
        {seedHexLock ? 'unlock' : 'lock'}
      </button>
      {!hydrated && <span className="opacity-50 text-xs">(hydrating…)</span>}
    </label>
  )
}
