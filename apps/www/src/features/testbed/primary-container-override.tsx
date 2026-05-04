'use client'

import { useResolvedTokens, useSource } from '@tonex/core'

// why: testing-phase shows both modes side-by-side so verification doesn't
// require a mode toggle. Production target is single-mode UI driven by
// resolvedTheme; the data shape is mode-keyed regardless. Issue #1.
export function PrimaryContainerOverride() {
  const override = useSource((s) => s.md3PrimaryContainerOverride)
  const setOverride = useSource((s) => s.setMd3PrimaryContainerOverride)
  const theme = useResolvedTokens()
  if (!theme) return null

  const lightValue = override.light ?? theme.md.light['--color-primary-container'] ?? '#000000'
  const darkValue = override.dark ?? theme.md.dark['--color-primary-container'] ?? '#000000'
  const isOverridden = override.light !== null || override.dark !== null

  return (
    <fieldset className="grid gap-3 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">md primary-container override</legend>
      <div className="flex gap-6 items-center flex-wrap">
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">light</span>
          <input
            type="color"
            value={lightValue}
            onChange={(e) => setOverride('light', e.target.value)}
            aria-label="primary-container light override"
          />
          <code className="text-xs font-mono opacity-70">{lightValue}</code>
          <span className="text-xs opacity-50">
            {override.light !== null ? '(override)' : '(mcu)'}
          </span>
        </label>
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">dark</span>
          <input
            type="color"
            value={darkValue}
            onChange={(e) => setOverride('dark', e.target.value)}
            aria-label="primary-container dark override"
          />
          <code className="text-xs font-mono opacity-70">{darkValue}</code>
          <span className="text-xs opacity-50">
            {override.dark !== null ? '(override)' : '(mcu)'}
          </span>
        </label>
        {isOverridden && (
          <button
            type="button"
            onClick={() => {
              setOverride('light', null)
              setOverride('dark', null)
            }}
            className="text-xs px-2 py-1 border rounded"
          >
            reset
          </button>
        )}
      </div>
    </fieldset>
  )
}
