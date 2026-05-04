'use client'

import { useResolvedTokens, useSource } from '@tonex/core'

// why: pinning primary to an exact hex auto-derives the rest of the family
// (on-primary, primary-container, on-primary-container) from a TonalPalette
// built off the locked HCT. Mode-keyed so brand colors can diverge across
// light/dark. Container override (sibling fieldset) still wins as the
// lower-level escape hatch.
export function PrimaryHexLock() {
  const lock = useSource((s) => s.primaryHexLock)
  const setLock = useSource((s) => s.setPrimaryHexLock)
  const theme = useResolvedTokens()
  if (!theme) return null

  const lightValue = lock.light ?? theme.md.light['--color-primary'] ?? '#000000'
  const darkValue = lock.dark ?? theme.md.dark['--color-primary'] ?? '#000000'
  const isLocked = lock.light !== null || lock.dark !== null

  return (
    <fieldset className="grid gap-3 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">primary lock (family auto-derives)</legend>
      <div className="flex gap-6 items-center flex-wrap">
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">light</span>
          <input
            type="color"
            value={lightValue}
            onChange={(e) => setLock('light', e.target.value)}
            aria-label="primary light lock"
          />
          <code className="text-xs font-mono opacity-70">{lightValue}</code>
          <span className="text-xs opacity-50">{lock.light !== null ? '(locked)' : '(mcu)'}</span>
        </label>
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">dark</span>
          <input
            type="color"
            value={darkValue}
            onChange={(e) => setLock('dark', e.target.value)}
            aria-label="primary dark lock"
          />
          <code className="text-xs font-mono opacity-70">{darkValue}</code>
          <span className="text-xs opacity-50">{lock.dark !== null ? '(locked)' : '(mcu)'}</span>
        </label>
        {isLocked && (
          <button
            type="button"
            onClick={() => {
              setLock('light', null)
              setLock('dark', null)
            }}
            className="text-xs px-2 py-1 border rounded"
          >
            unlock
          </button>
        )}
      </div>
    </fieldset>
  )
}
