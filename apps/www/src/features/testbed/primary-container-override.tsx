'use client'

import { useResolvedTokens, useSource } from '@tonex/core'

// why: testing-phase shows both modes side-by-side so verification doesn't
// require a mode toggle. Production target is single-mode UI driven by
// resolvedTheme; the data shape is mode-keyed regardless. Issue #1.
//
// Slice 6: data shape is now md3TokenOverrides (per-token map). This panel
// still drives only --color-primary-container; a future slice will turn the
// testbed into a generic token picker. Plumbing migrated, UX surface kept
// scoped.
const TOKEN = '--color-primary-container'

export function PrimaryContainerOverride() {
  const overrides = useSource((s) => s.md3TokenOverrides)
  const setOverride = useSource((s) => s.actions.setMd3TokenOverride)
  const theme = useResolvedTokens()
  if (!theme) return null

  const lightOverride = overrides.light[TOKEN]
  const darkOverride = overrides.dark[TOKEN]
  const lightValue = lightOverride ?? theme.md.light[TOKEN] ?? '#000000'
  const darkValue = darkOverride ?? theme.md.dark[TOKEN] ?? '#000000'
  const isOverridden = lightOverride !== undefined || darkOverride !== undefined

  return (
    <fieldset className="grid gap-3 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">md primary-container override</legend>
      <div className="flex gap-6 items-center flex-wrap">
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">light</span>
          <input
            type="color"
            value={lightValue}
            onChange={(e) => setOverride('light', TOKEN, e.target.value)}
            aria-label="primary-container light override"
          />
          <code className="text-xs font-mono opacity-70">{lightValue}</code>
          <span className="text-xs opacity-50">
            {lightOverride !== undefined ? '(override)' : '(mcu)'}
          </span>
        </label>
        <label className="flex gap-2 items-center">
          <span className="text-sm w-10">dark</span>
          <input
            type="color"
            value={darkValue}
            onChange={(e) => setOverride('dark', TOKEN, e.target.value)}
            aria-label="primary-container dark override"
          />
          <code className="text-xs font-mono opacity-70">{darkValue}</code>
          <span className="text-xs opacity-50">
            {darkOverride !== undefined ? '(override)' : '(mcu)'}
          </span>
        </label>
        {isOverridden && (
          <button
            type="button"
            onClick={() => {
              setOverride('light', TOKEN, null)
              setOverride('dark', TOKEN, null)
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
