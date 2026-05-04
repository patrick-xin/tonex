'use client'

import { applySurfaceDesaturate, applySurfaceTint, useResolvedTokens, useSource } from '@tonex/core'
import { useState } from 'react'
import { useActiveMode } from './use-active-mode'

type Algo = 'tint' | 'desaturate'

const SURFACE_TOKENS = [
  '--color-surface',
  '--color-surface-container',
  '--color-surface-container-high',
  '--color-on-surface',
] as const

// why: surface treatments applied at this consumer site (not inside derive).
// The treated layer scopes via inline CSS vars on the wrapper — Tailwind v4's
// bg-surface / bg-surface-container utilities cascade-resolve from these vars,
// so this section paints with the active algorithm's output while the rest of
// the testbed stays on baseline md tokens. Issue #4 tracks graduation into the
// export path proper.
export function SurfaceTint() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  const [algo, setAlgo] = useState<Algo>('tint')
  const tintLevel = useSource((s) => s.surfaceTintLevel)
  const desatLevel = useSource((s) => s.surfaceDesaturateLevel)
  const setTintLevel = useSource((s) => s.setSurfaceTintLevel)
  const setDesatLevel = useSource((s) => s.setSurfaceDesaturateLevel)

  if (!theme || !mode) return null
  const baseline = theme.md[mode]
  const layer =
    algo === 'tint'
      ? applySurfaceTint(baseline, mode, tintLevel)
      : applySurfaceDesaturate(baseline, desatLevel)

  const tintStyle = {
    '--color-surface': layer['--color-surface'],
    '--color-surface-container': layer['--color-surface-container'],
    '--color-surface-container-high': layer['--color-surface-container-high'],
    '--color-on-surface': layer['--color-on-surface'],
  } as React.CSSProperties

  const level = algo === 'tint' ? tintLevel : desatLevel
  const setLevel = algo === 'tint' ? setTintLevel : setDesatLevel
  const algoLabel =
    algo === 'tint'
      ? 'tint — TW zinc + primary-hue blend (0=neutral, 1=full primary)'
      : 'desaturate — chroma multiplier on MCU output (0=as-is, 1=neutral)'

  return (
    <fieldset className="grid gap-4 border rounded-lg p-3">
      <legend className="text-xs px-2 opacity-70">surface treatment</legend>

      <div className="flex gap-3 items-center flex-wrap">
        <span className="text-sm w-16">algorithm</span>
        <div className="flex gap-1">
          {(['tint', 'desaturate'] as const).map((a) => (
            <label
              key={a}
              className={
                algo === a
                  ? 'px-3 py-1 text-sm border rounded bg-surface-container-high font-medium cursor-pointer'
                  : 'px-3 py-1 text-sm border rounded opacity-70 cursor-pointer'
              }
            >
              <input
                type="radio"
                name="surface-algo"
                value={a}
                checked={algo === a}
                onChange={() => setAlgo(a)}
                className="sr-only"
              />
              {a}
            </label>
          ))}
        </div>
        <span className="text-xs opacity-60">{algoLabel}</span>
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
          className="flex-1"
          aria-label={`${algo} level`}
        />
        <code className="text-xs font-mono w-10">{level.toFixed(2)}</code>
      </label>

      <div
        style={tintStyle}
        className="bg-surface text-on-surface p-4 rounded-lg grid gap-3"
        data-tint-algo={algo}
      >
        <div className="text-sm">
          this section paints on bg-surface with the active treatment scoped via inline vars.
        </div>
        <div className="bg-surface-container p-3 rounded grid gap-2">
          <div className="text-sm">surface-container card</div>
          <div className="bg-surface-container-high p-2 rounded text-xs inline-block">
            surface-container-high chip
          </div>
        </div>
      </div>

      <table className="text-xs font-mono">
        <thead className="opacity-60">
          <tr>
            <th className="text-left pb-1">token</th>
            <th className="text-left pb-1 px-3">active ({algo})</th>
            <th className="text-left pb-1 px-3">mcu baseline</th>
          </tr>
        </thead>
        <tbody>
          {SURFACE_TOKENS.map((tok) => (
            <tr key={tok}>
              <td className="pr-3">{tok.replace('--color-', '')}</td>
              <td className="px-3">{layer[tok]}</td>
              <td className="px-3 opacity-60">{baseline[tok]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </fieldset>
  )
}
