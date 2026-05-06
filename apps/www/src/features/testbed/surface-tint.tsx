'use client'

import { useSource } from '@tonex/core'
import { NEUTRAL_PALETTE_NAMES } from '@tonex/core/data'
import type { SurfaceAlgo } from '@tonex/core/schema'
import { useActiveMode } from '../use-active-mode'

const ALGOS: ReadonlyArray<{ id: SurfaceAlgo; label: string; hint: string }> = [
  {
    id: 'tint',
    label: 'tint',
    hint: 'TW neutral palette + primary-hue blend (0=neutral, 1=full primary)',
  },
  { id: 'desaturate', label: 'desaturate', hint: 'chroma multiplier (0=as-is, 1=neutral)' },
]

// why: surface treatment is a global derive-time transform — picking an
// algorithm + level + (for tint) palette updates source state, deriveTheme
// applies the treatment, applyDom writes treated tokens to <style>, every
// consumer reflects it without local scoping. Palette select is only
// meaningful under tint; we keep it in the same fieldset and disable it for
// the other algos rather than conditionally render (avoids UI jumps).
export function SurfaceTint() {
  const surfaceAlgo = useSource((s) => s.surfaceAlgo)
  const surfacePaletteName = useSource((s) => s.surfacePaletteName)
  const tintLevel = useSource((s) => s.surfaceTintLevel)
  const desatLevel = useSource((s) => s.surfaceDesaturateLevel)
  const setSurfaceAlgo = useSource((s) => s.actions.setSurfaceAlgo)
  const setSurfacePaletteName = useSource((s) => s.actions.setSurfacePaletteName)
  const setTintLevel = useSource((s) => s.actions.setSurfaceTintLevel)
  const setDesatLevel = useSource((s) => s.actions.setSurfaceDesaturateLevel)
  const mode = useActiveMode()

  // why: edits the active mode's level only. Pre-mount mode is null; fall back
  // to 'light' for the displayed value and let the disabled flag below convey
  // pending state (mirrors SurfaceLevelSlider in the editor rail).
  const resolvedMode = mode ?? 'light'
  const isPending = mode === null
  const level = surfaceAlgo === 'desaturate' ? desatLevel[resolvedMode] : tintLevel[resolvedMode]
  const setLevel = (next: number) =>
    surfaceAlgo === 'desaturate'
      ? setDesatLevel(resolvedMode, next)
      : setTintLevel(resolvedMode, next)
  const paletteDisabled = surfaceAlgo !== 'tint'

  return (
    <fieldset className="grid gap-4 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">surface treatment (global)</legend>

      <div className="flex gap-3 items-center flex-wrap">
        <span className="text-sm w-16">algorithm</span>
        <div className="flex gap-1">
          {ALGOS.map((a) => (
            <label
              key={a.id}
              className={
                surfaceAlgo === a.id
                  ? 'px-3 py-1 text-sm border rounded bg-surface-container-high font-medium cursor-pointer'
                  : 'px-3 py-1 text-sm border rounded opacity-70 cursor-pointer'
              }
            >
              <input
                type="radio"
                name="surface-algo"
                value={a.id}
                checked={surfaceAlgo === a.id}
                onChange={() => setSurfaceAlgo(a.id)}
                className="sr-only"
              />
              {a.label}
            </label>
          ))}
        </div>
        <span className="text-xs opacity-60">{ALGOS.find((a) => a.id === surfaceAlgo)?.hint}</span>
      </div>

      <label className="flex gap-3 items-center">
        <span className="text-sm w-16">palette</span>
        <select
          value={surfacePaletteName}
          onChange={(e) =>
            setSurfacePaletteName(e.target.value as (typeof NEUTRAL_PALETTE_NAMES)[number])
          }
          disabled={paletteDisabled}
          className="text-sm border rounded px-2 py-1 disabled:opacity-40"
          aria-label="surface tint palette"
        >
          {NEUTRAL_PALETTE_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <span className="text-xs opacity-60">tint base shade source</span>
      </label>

      <label className="flex gap-3 items-center">
        <span className="text-sm w-16">level ({resolvedMode})</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          disabled={isPending}
          className="flex-1"
          aria-label={`${surfaceAlgo} level (${resolvedMode})`}
        />
        <code className="text-xs font-mono w-10">{level.toFixed(2)}</code>
      </label>
    </fieldset>
  )
}
