'use client'

import { type SurfaceAlgo, useSource } from '@tonex/core'

const ALGOS: ReadonlyArray<{ id: SurfaceAlgo; label: string; hint: string }> = [
  { id: 'none', label: 'none', hint: 'mcu surfaces unchanged' },
  { id: 'tint', label: 'tint', hint: 'TW zinc + primary-hue blend (0=neutral, 1=full primary)' },
  { id: 'desaturate', label: 'desaturate', hint: 'chroma multiplier (0=as-is, 1=neutral)' },
]

// why: surface treatment is now a global derive-time transform — picking an
// algorithm + level updates source state, deriveTheme applies the treatment,
// applyDom writes treated tokens to <style>, every consumer (md swatches,
// shadcn preview, export panels) reflects it without local scoping. The
// previous inline-CSS-vars wrapper was demonstrating drift, not catching it.
export function SurfaceTint() {
  const surfaceAlgo = useSource((s) => s.surfaceAlgo)
  const tintLevel = useSource((s) => s.surfaceTintLevel)
  const desatLevel = useSource((s) => s.surfaceDesaturateLevel)
  const setSurfaceAlgo = useSource((s) => s.setSurfaceAlgo)
  const setTintLevel = useSource((s) => s.setSurfaceTintLevel)
  const setDesatLevel = useSource((s) => s.setSurfaceDesaturateLevel)

  const level = surfaceAlgo === 'desaturate' ? desatLevel : tintLevel
  const setLevel = surfaceAlgo === 'desaturate' ? setDesatLevel : setTintLevel
  const sliderDisabled = surfaceAlgo === 'none'

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
        <span className="text-sm w-16">level</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          disabled={sliderDisabled}
          className="flex-1 disabled:opacity-40"
          aria-label={`${surfaceAlgo} level`}
        />
        <code className="text-xs font-mono w-10">{level.toFixed(2)}</code>
      </label>
    </fieldset>
  )
}
