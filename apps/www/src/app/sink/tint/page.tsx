'use client'

import { applySurfaceDesaturate, applySurfaceTint, useResolvedTokens, useSource } from '@tonex/core'
import { useTheme } from 'next-themes'
import { useState } from 'react'

// why: page-level surface-treatment sink. Two algorithms kept as separate
// features — `tint` (TW zinc + primary-hue blend) and `desaturate` (chroma
// multiplier on MCU output). This page paints the full chrome with the
// active algorithm's output so users see real effect at scale, not 56px
// swatches. Open two windows side-by-side to compare; home page stays minimal.

type Algo = 'tint' | 'desaturate'

export default function TintSinkPage() {
  const theme = useResolvedTokens()
  const { resolvedTheme } = useTheme()
  const [algo, setAlgo] = useState<Algo>('tint')
  const tintLevel = useSource((s) => s.surfaceTintLevel)
  const desatLevel = useSource((s) => s.surfaceDesaturateLevel)
  const setTintLevel = useSource((s) => s.setSurfaceTintLevel)
  const setDesatLevel = useSource((s) => s.setSurfaceDesaturateLevel)
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.setSeedHex)
  const hydrated = useSource((s) => s._hydrated)

  if (!theme || !hydrated) return null
  if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return null
  const mode = resolvedTheme
  const baseline = theme.md[mode]

  // why: surface treatments applied at the consumer site. DerivedTheme stays
  // lean (md, shadcn only); experimental treatments are sink-local until one
  // graduates into the export path proper (issue #4). Scratch page — fine to
  // recompute on every render.
  const layer =
    algo === 'tint'
      ? applySurfaceTint(baseline, mode, tintLevel)
      : applySurfaceDesaturate(baseline, desatLevel)

  // why: scope the tinted surface tokens to this page only by setting the
  // CSS custom properties inline on the wrapper. Tailwind v4's bg-surface /
  // bg-surface-container utilities cascade-resolve from these vars, so the
  // entire subtree paints with the active algorithm's output. Body keeps
  // baseline md tokens — navigating away from /sink/tint reverts naturally.
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
    <div
      style={tintStyle}
      className="bg-surface text-on-surface min-h-screen"
      data-tint-algo={algo}
    >
      <main className="grid gap-6 p-6 max-w-[960px] mx-auto">
        <header className="grid gap-1">
          <h1 className="text-2xl font-semibold">sink / tint</h1>
          <p className="opacity-70 text-sm">
            page-level surface tint — body tokens cascade unchanged; this scope overrides
            --color-surface* with the active algorithm's output.
          </p>
        </header>

        <fieldset className="grid gap-4 bg-surface-container p-4 rounded-lg">
          <legend className="text-xs px-2 opacity-70">controls</legend>

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

          <label className="flex gap-3 items-center">
            <span className="text-sm w-16">seed</span>
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
              className="font-mono w-28 px-2 py-1 border rounded bg-surface"
              aria-label="seed hex"
            />
          </label>
        </fieldset>

        <section className="grid gap-3 bg-surface-container-high p-4 rounded-lg">
          <h2 className="text-sm font-medium opacity-70">surface tokens — active vs baseline</h2>
          <table className="text-xs font-mono">
            <thead className="opacity-60">
              <tr>
                <th className="text-left pb-1">token</th>
                <th className="text-left pb-1 px-3">active ({algo})</th>
                <th className="text-left pb-1 px-3">mcu baseline</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  '--color-surface',
                  '--color-surface-container',
                  '--color-surface-container-high',
                  '--color-on-surface',
                ] as const
              ).map((tok) => (
                <tr key={tok}>
                  <td className="pr-3">{tok.replace('--color-', '')}</td>
                  <td className="px-3">{layer[tok]}</td>
                  <td className="px-3 opacity-60">{baseline[tok]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-medium opacity-70">filler chrome — verifies cascade reach</h2>
          <p className="text-sm">
            This paragraph sits on bg-surface. The card below is bg-surface-container, the inner
            chip is bg-surface-container-high. All three should reflect the active algorithm.
          </p>
          <div className="bg-surface-container p-4 rounded-lg grid gap-2">
            <div className="text-sm">surface-container card</div>
            <div className="bg-surface-container-high p-3 rounded text-xs inline-block">
              surface-container-high chip
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
