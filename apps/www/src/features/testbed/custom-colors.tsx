'use client'

import {
  type CustomColorEntry,
  slugifyCustomColorName,
  useSource,
  validateCustomColorEntry,
} from '@tonex/core'
import { useState } from 'react'

// why: testbed leaf for slice 3 — minimal CRUD surface for customColors. No
// HCT sliders, no description field, no live preview swatch (lift those in
// slice 9+ when production UI ports `new-custom-color.tsx` from legacy).
// Reads validation errors via store throws — caught here and surfaced inline.
export function CustomColors() {
  const customColors = useSource((s) => s.customColors)
  const addCustomColor = useSource((s) => s.addCustomColor)
  const updateCustomColor = useSource((s) => s.updateCustomColor)
  const removeCustomColor = useSource((s) => s.removeCustomColor)

  const [draftName, setDraftName] = useState('')
  const [draftHex, setDraftHex] = useState('#22c55e')
  const [draftBlend, setDraftBlend] = useState(true)
  const [draftSource, setDraftSource] = useState<'color' | 'container'>('color')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    const entry: CustomColorEntry = {
      id: crypto.randomUUID(),
      name: draftName,
      hex: draftHex,
      blend: draftBlend,
      shadcnSource: draftSource,
    }
    try {
      addCustomColor(entry)
      setDraftName('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  // why: live-validate the draft so the add button reflects whether the next
  // click would throw. Excludes nothing from existingSlugs because add-time
  // checks against ALL current entries.
  const draftSlug = slugifyCustomColorName(draftName)
  const draftError = validateCustomColorEntry(
    { name: draftName, hex: draftHex },
    new Set(customColors.map((e) => slugifyCustomColorName(e.name))),
  )

  return (
    <fieldset className="grid gap-3 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">custom colors</legend>

      <div className="grid gap-2">
        {customColors.length === 0 && (
          <p className="text-xs opacity-60">no custom colors — add one below.</p>
        )}
        {customColors.map((entry) => (
          <CustomColorRow
            key={entry.id}
            entry={entry}
            onUpdate={(patch) => {
              try {
                updateCustomColor(entry.id, patch)
                setError(null)
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err))
              }
            }}
            onRemove={() => removeCustomColor(entry.id)}
          />
        ))}
      </div>

      <div className="border-t pt-3 grid gap-2">
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="name (e.g. Success)"
            className="px-2 py-1 border rounded text-sm flex-1 min-w-[160px]"
            aria-label="new custom color name"
          />
          <input
            type="color"
            value={draftHex}
            onChange={(e) => setDraftHex(e.target.value)}
            aria-label="new custom color hex"
          />
          <code className="text-xs font-mono opacity-70 w-16">{draftHex}</code>
        </div>
        <div className="flex gap-3 items-center flex-wrap text-sm">
          <label className="flex gap-1 items-center">
            <input
              type="checkbox"
              checked={draftBlend}
              onChange={(e) => setDraftBlend(e.target.checked)}
            />
            harmonize
          </label>
          <span className="opacity-50">|</span>
          <span>shadcn source:</span>
          <label className="flex gap-1 items-center">
            <input
              type="radio"
              name="draft-source"
              checked={draftSource === 'color'}
              onChange={() => setDraftSource('color')}
            />
            color
          </label>
          <label className="flex gap-1 items-center">
            <input
              type="radio"
              name="draft-source"
              checked={draftSource === 'container'}
              onChange={() => setDraftSource('container')}
            />
            container
          </label>
          <button
            type="button"
            onClick={handleAdd}
            disabled={draftError !== null}
            className="ml-auto px-3 py-1 border rounded text-xs disabled:opacity-40"
          >
            add {draftSlug && `(${draftSlug})`}
          </button>
        </div>
        {(error ?? draftError) !== null && (
          <p className="text-xs text-red-600 dark:text-red-400">{error ?? draftError}</p>
        )}
      </div>
    </fieldset>
  )
}

function CustomColorRow({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: CustomColorEntry
  onUpdate: (patch: Partial<Omit<CustomColorEntry, 'id'>>) => void
  onRemove: () => void
}) {
  return (
    <div className="flex gap-2 items-center flex-wrap text-sm">
      <input
        type="text"
        value={entry.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        className="px-2 py-1 border rounded text-sm w-32"
        aria-label={`${entry.name} name`}
      />
      <input
        type="color"
        value={entry.hex}
        onChange={(e) => onUpdate({ hex: e.target.value })}
        aria-label={`${entry.name} hex`}
      />
      <code className="text-xs font-mono opacity-70 w-16">{entry.hex}</code>
      <label className="flex gap-1 items-center text-xs">
        <input
          type="checkbox"
          checked={entry.blend}
          onChange={(e) => onUpdate({ blend: e.target.checked })}
        />
        harmonize
      </label>
      <select
        value={entry.shadcnSource}
        onChange={(e) => onUpdate({ shadcnSource: e.target.value as 'color' | 'container' })}
        className="px-2 py-1 border rounded text-xs"
        aria-label={`${entry.name} shadcn source`}
      >
        <option value="color">color</option>
        <option value="container">container</option>
      </select>
      <button
        type="button"
        onClick={onRemove}
        className="ml-auto px-2 py-1 border rounded text-xs"
        aria-label={`remove ${entry.name}`}
      >
        remove
      </button>
    </div>
  )
}
