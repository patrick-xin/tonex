'use client'

import { contrastRatio, hexString } from '@tonex/color-utils'
import {
  buildSequentialReport,
  HUE_ANCHOR_DEFAULT,
  HUE_SPREAD_DEFAULT,
  type HueAnchor,
  type Mode,
  PROMINENT_EDGE_DARK_DEFAULT,
  PROMINENT_EDGE_LIGHT_DEFAULT,
  type SequentialModeOutput,
} from '@tonex/core'
import { MD_CHART_TOKEN_NAMES, SHADCN_CHART_TOKEN_NAMES } from '@tonex/core/schema'
import { selectPortable, useResolvedTokens, useSource } from '@tonex/core-react'
import { Fragment, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// why: dev-only side-by-side for the monotonic-sequential chart prototype
// (ADR-0027 c.3 trajectory). Not wired into nav-config — reachable only by
// direct URL while we eyeball-iterate. Deletes when the prototype either
// promotes (swap call site in `buildMdChart`, remove this page) or gets
// abandoned. Apply button pushes the current prototype tones into a
// !important <style> element scoped to the same four selectors applyDom
// writes to (`.md`, `html.dark .md`, `.shadcn`, `html.dark .shadcn`) so
// real chart components on other routes render with the prototype values;
// Reset clears it. Override persists across navigation so the user can
// tour the app and eyeball.
//
// chart-1 is always the lightest anchor (ColorBrewer convention). Advanced
// disclosure exposes N (3-7), per-anchor L* sliders, and `hueSpread` for
// multi-hue sequential. When hueSpread > 0 the page renders BOTH anchor
// strategies side-by-side (chart-1 anchor keeps brand at chart-1 across
// modes; prominent-edge anchor keeps brand at the prominent edge but
// swaps chart-1/chart-N hues between modes). Apply targets one of the two
// via the toolbar's anchor toggle. Apply is gated to N=5 since
// MD_CHART_TOKEN_NAMES / SHADCN_CHART_TOKEN_NAMES are fixed.

const OVERRIDE_STYLE_ID = 'chart-lab-override'
const N_MIN = 3
const N_MAX = 7
const N_SCHEMA = MD_CHART_TOKEN_NAMES.length
// why: 120° is the upper end of ColorBrewer's hand-tuned multi-hue sequentials
// (YlOrRd, YlGnBu). Past ~60° algorithmic generation starts reading as
// categorical — let the lab go to 120° so the user can see where the wheels
// fall off.
const HUE_SPREAD_MAX = 120

interface PartnerRow {
  name: string
  argb: number
}

function partnersFor(
  theme: NonNullable<ReturnType<typeof useResolvedTokens>>,
  mode: Mode,
): PartnerRow[] {
  const md = mode === 'light' ? theme.md.light : theme.md.dark
  const shadcn = mode === 'light' ? theme.shadcn.light : theme.shadcn.dark
  return [
    { name: '--color-surface', argb: md['--color-surface'] as number },
    { name: '--color-surface-container', argb: md['--color-surface-container'] as number },
    { name: '--background', argb: shadcn['--background'] as number },
    { name: '--card', argb: shadcn['--card'] as number },
  ]
}

// why: write all four scope rules in one <style> element. !important beats
// applyDom's per-token setProperty (which is plain inline-style specificity
// on the CSSStyleRule). Same `.md` / `html.dark .md` / `.shadcn` /
// `html.dark .shadcn` selectors applyDom uses, so the existing class-based
// mode toggle (html.dark per ADR-0017 c.4) flips the right block. Caller
// must hand exactly N_SCHEMA argbs per mode (gated upstream).
function applyOverride(lightArgbs: readonly number[], darkArgbs: readonly number[]) {
  const rulesFor = (argbs: readonly number[], scope: 'md' | 'shadcn') => {
    const names = scope === 'md' ? MD_CHART_TOKEN_NAMES : SHADCN_CHART_TOKEN_NAMES
    return names
      .map((name, i) => `  ${name}: ${hexString(argbs[i] as number)} !important;`)
      .join('\n')
  }
  const css = [
    `.md {\n${rulesFor(lightArgbs, 'md')}\n}`,
    `html.dark .md {\n${rulesFor(darkArgbs, 'md')}\n}`,
    `.shadcn {\n${rulesFor(lightArgbs, 'shadcn')}\n}`,
    `html.dark .shadcn {\n${rulesFor(darkArgbs, 'shadcn')}\n}`,
  ].join('\n')

  let el = document.getElementById(OVERRIDE_STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = OVERRIDE_STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = css
}

function resetOverride() {
  document.getElementById(OVERRIDE_STYLE_ID)?.remove()
}

function Swatch({ argb, label }: { argb: number; label?: string }) {
  return (
    <div className="flex flex-col items-stretch gap-1">
      <div
        className="h-14 w-full rounded-md ring ring-outline-variant/50"
        style={{ background: hexString(argb) }}
      />
      <div className="flex flex-col leading-tight text-xs font-mono text-on-surface-variant">
        {label !== undefined ? <span className="text-on-surface">{label}</span> : null}
        <span>{hexString(argb)}</span>
      </div>
    </div>
  )
}

function ContrastCell({ ratio }: { ratio: number }) {
  const passes = ratio >= 3
  const cls = passes ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
  return <span className={`font-mono tabular-nums ${cls}`}>{ratio.toFixed(2)}</span>
}

interface ChartColumnProps {
  title: string
  subtitle?: string
  argbs: readonly number[]
  partners: PartnerRow[]
  action?: React.ReactNode
}

function ChartColumn({ title, subtitle, argbs, partners, action }: ChartColumnProps) {
  const gridCols = { gridTemplateColumns: `repeat(${argbs.length}, minmax(0, 1fr))` }
  const matrixCols = { gridTemplateColumns: `auto repeat(${argbs.length}, minmax(0, 1fr))` }
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4 p-4 rounded-lg border border-outline-variant/50 bg-surface-container-low">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
          {subtitle ? <p className="text-xs text-on-surface-variant">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="grid gap-2" style={gridCols}>
        {argbs.map((argb, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: positional chart anchors
          <Swatch key={`chart-${i + 1}`} argb={argb} label={`chart-${i + 1}`} />
        ))}
      </div>
      <div className="text-xs">
        <div className="grid gap-x-3 gap-y-1 items-center font-mono" style={matrixCols}>
          <span className="text-on-surface-variant text-xs">partner ↓</span>
          {argbs.map((_, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: positional chart anchors
              key={`hdr-${i + 1}`}
              className="text-on-surface-variant text-xs text-right"
            >
              c-{i + 1}
            </span>
          ))}
          {partners.map((p) => (
            <Fragment key={p.name}>
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="size-3 rounded-sm shrink-0 ring ring-outline-variant/40"
                  style={{ background: hexString(p.argb) }}
                />
                <span className="text-xs truncate">{p.name.replace(/^--(color-)?/, '')}</span>
              </div>
              {argbs.map((argb, i) => {
                const r = contrastRatio(argb, p.argb)
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: positional chart anchors
                    key={`${p.name}-${i}`}
                    className="text-right"
                  >
                    <ContrastCell ratio={r} />
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function ParamSlider({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-on-surface">{label}</span>
        <span className="font-mono text-xs tabular-nums text-on-surface-variant">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value))
        }}
        className="accent-primary w-full"
      />
    </label>
  )
}

function PerAnchorPanel({
  title,
  samples,
  isManual,
  onChange,
  onReset,
}: {
  title: string
  samples: readonly number[]
  isManual: boolean
  onChange: (i: number, v: number) => void
  onReset: () => void
}) {
  const gridCols = { gridTemplateColumns: `repeat(${samples.length}, minmax(0, 1fr))` }
  return (
    <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-on-surface">{title}</span>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={!isManual}>
          Reset to auto
        </Button>
      </div>
      <div className="grid gap-3" style={gridCols}>
        {samples.map((s, i) => (
          <ParamSlider
            // biome-ignore lint/suspicious/noArrayIndexKey: positional chart anchors
            key={`anchor-${i}`}
            label={`chart-${i + 1}`}
            value={Math.round(s)}
            onChange={(v) => {
              onChange(i, v)
            }}
            min={0}
            max={100}
          />
        ))}
      </div>
    </div>
  )
}

function hueLabel(hues: readonly number[]) {
  return `hues=[${hues.map((h) => `${(((h % 360) + 360) % 360) | 0}°`).join(', ')}]`
}

interface ModeBlockProps {
  mode: Mode
  legacyArgbs: readonly number[]
  prototypeChart1: SequentialModeOutput
  prototypeProminent: SequentialModeOutput
  multiHue: boolean
  applyAnchor: HueAnchor
  partners: PartnerRow[]
  prominentEdgeControl: React.ReactNode
  advancedControl?: React.ReactNode
}

function ModeBlock({
  mode,
  legacyArgbs,
  prototypeChart1,
  prototypeProminent,
  multiHue,
  applyAnchor,
  partners,
  prominentEdgeControl,
  advancedControl,
}: ModeBlockProps) {
  // why: samples + safe/prominent are shared across anchors (the bisection
  // uses seed hue, L* spacing is anchor-independent). Read from either
  // prototype.
  const shared = prototypeChart1
  const spread = Math.abs(shared.safeEdge - shared.prominentEdge)
  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="text-base font-semibold capitalize">{mode}</h2>
          <span className="text-xs text-on-surface-variant font-mono">
            prominent L*={shared.prominentEdge} · safe L*={shared.safeEdge.toFixed(2)} · spread{' '}
            {spread.toFixed(2)}
          </span>
          <span className="text-xs text-on-surface-variant font-mono">
            samples L*=[{shared.samples.map((s) => s.toFixed(1)).join(', ')}]
          </span>
        </div>
        <div className="w-40 shrink-0">{prominentEdgeControl}</div>
      </header>
      <div className="flex gap-4">
        <ChartColumn
          title="Legacy"
          subtitle="palette.tone([40,50,20,30,45] / [80,65,90,70,60])"
          argbs={legacyArgbs}
          partners={partners}
        />
        {multiHue ? (
          <>
            <ChartColumn
              title={`Prototype — chart-1 anchor${applyAnchor === 'chart-1' ? ' · applied' : ''}`}
              subtitle={`brand at chart-1 in both modes · ${hueLabel(prototypeChart1.hues)}`}
              argbs={prototypeChart1.argbs}
              partners={partners}
            />
            <ChartColumn
              title={`Prototype — prominent anchor${applyAnchor === 'prominent-edge' ? ' · applied' : ''}`}
              subtitle={`brand at prominent edge (${mode === 'light' ? 'chart-N' : 'chart-1'}) · ${hueLabel(prototypeProminent.hues)}`}
              argbs={prototypeProminent.argbs}
              partners={partners}
            />
          </>
        ) : (
          <ChartColumn
            title="Prototype — single-hue"
            subtitle={`palette.tone(L) walked from light to dark · ${hueLabel(prototypeChart1.hues)}`}
            argbs={prototypeChart1.argbs}
            partners={partners}
          />
        )}
      </div>
      {advancedControl}
    </section>
  )
}

export default function ChartLabPage() {
  const theme = useResolvedTokens()
  const source = useSource(useShallow(selectPortable))
  const [prominentEdgeLight, setProminentEdgeLight] = useState(PROMINENT_EDGE_LIGHT_DEFAULT)
  const [prominentEdgeDark, setProminentEdgeDark] = useState(PROMINENT_EDGE_DARK_DEFAULT)
  const [hueSpread, setHueSpread] = useState<number>(HUE_SPREAD_DEFAULT)
  const [applyAnchor, setApplyAnchor] = useState<HueAnchor>(HUE_ANCHOR_DEFAULT)
  const [n, setN] = useState<number>(N_SCHEMA)
  const [manualLight, setManualLight] = useState<(number | null)[]>(() =>
    Array(N_SCHEMA).fill(null),
  )
  const [manualDark, setManualDark] = useState<(number | null)[]>(() => Array(N_SCHEMA).fill(null))
  const [applied, setApplied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // why: pick up an already-active override (user navigated away and came
  // back). The style tag survives unmount; reconcile applied state on mount
  // so the Reset button is enabled and the label is accurate.
  useEffect(() => {
    setApplied(typeof document !== 'undefined' && !!document.getElementById(OVERRIDE_STYLE_ID))
  }, [])

  // why: N change forces a reset because the manual array's length must
  // match n (we index manualAnchors[i] for i in [0, n)).
  useEffect(() => {
    setManualLight(Array(n).fill(null))
    setManualDark(Array(n).fill(null))
  }, [n])

  if (theme === null) return null

  const lightPartners = partnersFor(theme, 'light')
  const darkPartners = partnersFor(theme, 'dark')
  // why: compute both anchor strategies always. With hueSpread === 0 the two
  // are bit-identical (the rotation amount is zero either way) so the lab
  // falls back to a single prototype column. With hueSpread > 0 they diverge
  // and both render side-by-side for direct comparison.
  const partners = {
    light: lightPartners.map((p) => p.argb),
    dark: darkPartners.map((p) => p.argb),
  }
  const baseParams = {
    prominentEdges: { light: prominentEdgeLight, dark: prominentEdgeDark },
    hueSpread,
    n,
    manualAnchors: { light: manualLight, dark: manualDark },
  }
  const prototypeChart1 = buildSequentialReport(source, partners, {
    ...baseParams,
    hueAnchor: 'chart-1',
  })
  const prototypeProminent = buildSequentialReport(source, partners, {
    ...baseParams,
    hueAnchor: 'prominent-edge',
  })
  const multiHue = hueSpread > 0
  const applyTarget = applyAnchor === 'chart-1' ? prototypeChart1 : prototypeProminent
  const legacyLightArgbs = MD_CHART_TOKEN_NAMES.map((name) => theme.md.lightChart[name] as number)
  const legacyDarkArgbs = MD_CHART_TOKEN_NAMES.map((name) => theme.md.darkChart[name] as number)

  const canApply = n === N_SCHEMA
  const isLightManual = manualLight.some((v) => v !== null)
  const isDarkManual = manualDark.some((v) => v !== null)

  const handleApply = () => {
    if (!canApply) return
    applyOverride(applyTarget.light.argbs, applyTarget.dark.argbs)
    setApplied(true)
  }
  const handleReset = () => {
    resetOverride()
    setApplied(false)
  }
  const setAnchorLight = (i: number, v: number) => {
    setManualLight((prev) => prev.map((m, j) => (j === i ? v : m)))
  }
  const setAnchorDark = (i: number, v: number) => {
    setManualDark((prev) => prev.map((m, j) => (j === i ? v : m)))
  }

  return (
    <div className="px-6 py-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-xl font-semibold">Chart sequential lab</h1>
          <p className="text-sm text-on-surface-variant max-w-prose mt-1">
            Eyeball comparison between the current sequential branch (hand-picked tones) and a
            monotonic perceptual-uniform prototype that walks tone toward the binding partner until
            3:1 holds. chart-1 is always the lightest anchor (ColorBrewer convention). Edit the seed
            / variant in the rail to see how each adapts. Both modes render simultaneously
            regardless of the top-bar theme toggle.
          </p>
        </div>

        <div className="rounded-lg border border-outline-variant/60 bg-surface-container-low p-4 flex items-center justify-between gap-6">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-on-surface">Push to live charts</span>
            <span className="text-xs text-on-surface-variant">
              {canApply
                ? multiHue
                  ? `Apply pushes the selected anchor strategy (${applyAnchor}) to live charts as !important overrides. Persists across navigation; Reset clears.`
                  : 'Apply writes !important overrides for --color-chart-1..5 and --chart-1..5 (both modes). Persists across navigation; click Reset to clear.'
                : `N=${n} doesn't match the schema (chart-1..${N_SCHEMA}). Set N back to ${N_SCHEMA} to Apply — N>${N_SCHEMA} is preview-only.`}
            </span>
          </div>
          <div className="flex gap-2 shrink-0 items-center">
            {multiHue ? (
              <ToggleGroup
                value={[applyAnchor]}
                onValueChange={(v) => {
                  if (v.length > 0) setApplyAnchor(v[v.length - 1] as HueAnchor)
                }}
                size="xs"
                variant="outline"
              >
                <ToggleGroupItem value="chart-1">chart-1</ToggleGroupItem>
                <ToggleGroupItem value="prominent-edge">prominent</ToggleGroupItem>
              </ToggleGroup>
            ) : null}
            <Button variant="primary" size="sm" onClick={handleApply} disabled={!canApply}>
              {applied ? 'Re-apply' : 'Apply'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} disabled={!applied}>
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAdvanced((s) => !s)
              }}
            >
              Advanced {showAdvanced ? '▾' : '▸'}
            </Button>
          </div>
        </div>

        {showAdvanced ? (
          <div className="rounded-lg border border-outline-variant/60 bg-surface-container-low p-4 flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-semibold text-on-surface">Advanced</span>
              <span className="text-xs text-on-surface-variant max-w-prose">
                N is preview-only beyond {N_SCHEMA} (schema fixed). Per-anchor L* sliders below each
                mode override even-spacing per slot — slots you don't touch keep auto-flowing with
                prominent-edge changes. Hue spread {'>'} 0 renders BOTH anchor strategies
                side-by-side; safe-edge bisection stays on the seed hue (mild approximation under
                rotation).
              </span>
            </div>
            <div className="flex gap-6 flex-wrap">
              <div className="w-64">
                <ParamSlider
                  label={`Anchors (N) — schema fixed at ${N_SCHEMA}`}
                  value={n}
                  onChange={setN}
                  min={N_MIN}
                  max={N_MAX}
                />
              </div>
              <div className="w-64">
                <ParamSlider
                  label="Hue spread (°) — 0 = single-hue"
                  value={hueSpread}
                  onChange={setHueSpread}
                  min={0}
                  max={HUE_SPREAD_MAX}
                />
              </div>
            </div>
          </div>
        ) : null}

        <ModeBlock
          mode="light"
          legacyArgbs={legacyLightArgbs}
          prototypeChart1={prototypeChart1.light}
          prototypeProminent={prototypeProminent.light}
          multiHue={multiHue}
          applyAnchor={applyAnchor}
          partners={lightPartners}
          prominentEdgeControl={
            <ParamSlider
              label="prominent L*"
              value={prominentEdgeLight}
              onChange={setProminentEdgeLight}
              min={0}
              max={60}
            />
          }
          advancedControl={
            showAdvanced ? (
              <PerAnchorPanel
                title="Light anchors L* (drag to override)"
                samples={prototypeChart1.light.samples}
                isManual={isLightManual}
                onChange={setAnchorLight}
                onReset={() => {
                  setManualLight(Array(n).fill(null))
                }}
              />
            ) : null
          }
        />
        <ModeBlock
          mode="dark"
          legacyArgbs={legacyDarkArgbs}
          prototypeChart1={prototypeChart1.dark}
          prototypeProminent={prototypeProminent.dark}
          multiHue={multiHue}
          applyAnchor={applyAnchor}
          partners={darkPartners}
          prominentEdgeControl={
            <ParamSlider
              label="prominent L*"
              value={prominentEdgeDark}
              onChange={setProminentEdgeDark}
              min={40}
              max={100}
            />
          }
          advancedControl={
            showAdvanced ? (
              <PerAnchorPanel
                title="Dark anchors L* (drag to override)"
                samples={prototypeChart1.dark.samples}
                isManual={isDarkManual}
                onChange={setAnchorDark}
                onReset={() => {
                  setManualDark(Array(n).fill(null))
                }}
              />
            ) : null
          }
        />
      </div>
    </div>
  )
}
