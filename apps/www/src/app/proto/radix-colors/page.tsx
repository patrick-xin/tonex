'use client'

// THROWAWAY PROTOTYPE — four Radix-color picker layouts behind one switcher, so
// we can compare them against the real Tomato scale. Self-contained: inline
// colors for both the swatches and the page chrome, one local light/dark toggle
// (a Radix scale renders completely differently per mode, so the toggle is the
// honest preview). Delete the whole `proto/radix-colors/` folder to remove.
import { type ReactNode, useState } from 'react'
import {
  BANDS,
  bandFor,
  GROUPS,
  type GroupKey,
  IDENTITY_STEP,
  inkOn,
  isBright,
  type Mode,
  type RadixScale,
  roleFor,
  SCALES,
  STEP_ROLES,
  scalesIn,
  stepHex,
} from './radix-sample-data'

type PatternKey = 'combobox' | 'ramp-rows' | 'drill-down' | 'bands' | 'purpose'
type Sel = { scale: string; step: number }

const PATTERNS: { key: PatternKey; label: string; note: string }[] = [
  {
    key: 'combobox',
    label: 'Combobox',
    note: 'The real surface — ~30 scales at TW-picker width. How do we group + show steps?',
  },
  {
    key: 'ramp-rows',
    label: 'Ramp rows',
    note: 'Every scale as a 12-cell ramp — densest, Radix-docs-native',
  },
  {
    key: 'drill-down',
    label: 'Drill-down',
    note: 'Pick hue (step 9), then the step — best for tight popovers',
  },
  { key: 'bands', label: 'Semantic bands', note: 'Steps grouped by job — maximally teaching' },
  {
    key: 'purpose',
    label: 'Purpose-first',
    note: 'Pick intent, we pick the step — hides the numbers',
  },
]

type Chrome = {
  bg: string
  panel: string
  sub: string
  text: string
  muted: string
  border: string
  accent: string
}

function chromeFor(mode: Mode): Chrome {
  return mode === 'light'
    ? {
        bg: '#fcfcfd',
        panel: '#ffffff',
        sub: '#f1f1f4',
        text: '#1c2024',
        muted: '#60646c',
        border: '#e0e1e6',
        accent: '#3358d4',
      }
    : {
        bg: '#0f0f11',
        panel: '#18191b',
        sub: '#212225',
        text: '#edeef0',
        muted: '#9ba1a6',
        border: '#2a2c30',
        accent: '#5472e4',
      }
}

function scaleByName(name: string): RadixScale {
  return SCALES.find((s) => s.name === name) as RadixScale
}

// — shared bits —————————————————————————————————————————————

function SegTabs<T extends string>(props: {
  value: T
  options: { key: T; label: string }[]
  onChange: (v: T) => void
  chrome: Chrome
}) {
  const { value, options, onChange, chrome } = props
  return (
    <div className="flex gap-1 rounded-lg p-1" style={{ background: chrome.sub }}>
      {options.map((o) => {
        const active = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              background: active ? chrome.panel : 'transparent',
              color: active ? chrome.text : chrome.muted,
              boxShadow: active ? `0 1px 2px rgba(0,0,0,.08)` : 'none',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function ScaleChips(props: {
  mode: Mode
  value: string
  onChange: (n: string) => void
  chrome: Chrome
}) {
  const { mode, value, onChange, chrome } = props
  return (
    <div className="flex flex-wrap gap-2">
      {SCALES.map((s) => {
        const hex = stepHex(s, mode, IDENTITY_STEP)
        const active = s.name === value
        return (
          <button
            key={s.name}
            type="button"
            onClick={() => onChange(s.name)}
            className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm capitalize"
            style={{
              background: active ? chrome.sub : 'transparent',
              color: chrome.text,
              boxShadow: `inset 0 0 0 1px ${active ? chrome.border : 'transparent'}`,
            }}
          >
            <span
              className="size-5 rounded-full"
              style={{ background: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }}
            />
            {s.name}
          </button>
        )
      })}
    </div>
  )
}

function BandLegend({ chrome }: { chrome: Chrome }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: chrome.muted }}>
      {BANDS.map((b) => (
        <span key={b.key}>
          <span className="font-mono" style={{ color: chrome.text }}>
            {b.steps[0]}
            {b.steps.length > 1 ? `–${b.steps[b.steps.length - 1]}` : ''}
          </span>{' '}
          {b.name}
        </span>
      ))}
    </div>
  )
}

// One swatch in a ramp.
function StepCell(props: {
  scale: RadixScale
  mode: Mode
  step: number
  height: number
  selected: boolean
  showNumber?: boolean
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
}) {
  const { scale, mode, step, height, selected, showNumber, onSelect, onHover } = props
  const hex = stepHex(scale, mode, step)
  const role = roleFor(step)
  const isIdentity = step === IDENTITY_STEP
  const ink = inkOn(hex)
  return (
    <button
      type="button"
      title={`${scale.name} ${step} · ${role.label}`}
      onMouseEnter={() => onHover({ scale: scale.name, step })}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover({ scale: scale.name, step })}
      onClick={() => onSelect({ scale: scale.name, step })}
      className="relative flex flex-1 items-center justify-center text-[11px] font-medium"
      style={{
        height,
        background: hex,
        color: ink,
        boxShadow: selected ? `inset 0 0 0 2px ${ink}` : 'none',
        zIndex: selected ? 1 : 0,
      }}
    >
      {showNumber || isIdentity ? (
        <span style={{ opacity: isIdentity ? 1 : 0.7 }}>{step}</span>
      ) : null}
      {isIdentity && !showNumber ? (
        <span className="absolute -bottom-px h-0.5 w-3 rounded-full" style={{ background: ink }} />
      ) : null}
    </button>
  )
}

// — pattern 1: ramp rows ——————————————————————————————————————

function RampRows(props: {
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { mode, selected, onSelect, onHover, chrome } = props
  return (
    <div className="flex flex-col gap-4">
      <BandLegend chrome={chrome} />
      <div className="flex flex-col gap-2">
        {SCALES.map((scale) => (
          <div key={scale.name} className="flex items-center gap-3">
            <div className="w-20 shrink-0">
              <div className="text-sm font-medium capitalize" style={{ color: chrome.text }}>
                {scale.name}
              </div>
              <div className="text-[10px] uppercase tracking-wide" style={{ color: chrome.muted }}>
                {scale.kind}
              </div>
            </div>
            <div className="flex flex-1 overflow-hidden rounded-md">
              {STEP_ROLES.map((role) => (
                <StepCell
                  key={role.step}
                  scale={scale}
                  mode={mode}
                  step={role.step}
                  height={36}
                  selected={selected?.scale === scale.name && selected?.step === role.step}
                  onSelect={onSelect}
                  onHover={onHover}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: chrome.muted }}>
        The underline marks step {IDENTITY_STEP} (identity). Hover any cell to read its role above.
      </p>
    </div>
  )
}

// — pattern 2: drill-down —————————————————————————————————————

function DrillDown(props: {
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { mode, selected, onSelect, onHover, chrome } = props
  const [active, setActive] = useState<string | null>(selected?.scale ?? null)

  if (!active) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm" style={{ color: chrome.muted }}>
          Stage 1 — which hue? Each tile is step {IDENTITY_STEP}, the identity color.
        </p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {SCALES.map((scale) => {
            const hex = stepHex(scale, mode, IDENTITY_STEP)
            return (
              <button
                key={scale.name}
                type="button"
                onClick={() => setActive(scale.name)}
                className="flex flex-col gap-1.5"
              >
                <span
                  className="h-16 w-full rounded-lg"
                  style={{ background: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }}
                />
                <span className="text-xs capitalize" style={{ color: chrome.text }}>
                  {scale.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const scale = scaleByName(active)
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setActive(null)}
        className="self-start text-sm font-medium"
        style={{ color: chrome.accent }}
      >
        ← All scales
      </button>
      <div>
        <div className="mb-1 text-lg font-semibold capitalize" style={{ color: chrome.text }}>
          {scale.name}
        </div>
        <p className="text-sm" style={{ color: chrome.muted }}>
          Stage 2 — pick a step. Each step has a job (labels below).
        </p>
      </div>
      <div className="flex overflow-hidden rounded-lg">
        {STEP_ROLES.map((role) => (
          <StepCell
            key={role.step}
            scale={scale}
            mode={mode}
            step={role.step}
            height={64}
            showNumber
            selected={selected?.scale === scale.name && selected?.step === role.step}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
      {/* band brackets aligned under the ramp */}
      <div className="flex gap-1">
        {BANDS.map((b) => (
          <div
            key={b.key}
            style={{ flexGrow: b.steps.length, flexBasis: 0 }}
            className="rounded-md px-2 py-1.5"
          >
            <div className="text-xs font-medium" style={{ color: chrome.text }}>
              {b.name}
            </div>
            <div className="text-[10px]" style={{ color: chrome.muted }}>
              {b.blurb}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// — pattern 3: semantic bands —————————————————————————————————

function SemanticBands(props: {
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { mode, selected, onSelect, onHover, chrome } = props
  const [active, setActive] = useState(selected?.scale ?? 'tomato')
  const scale = scaleByName(active)

  return (
    <div className="flex flex-col gap-5">
      <ScaleChips mode={mode} value={active} onChange={setActive} chrome={chrome} />
      <div className="flex flex-col gap-4">
        {BANDS.map((b) => (
          <div key={b.key} className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold" style={{ color: chrome.text }}>
                {b.name}
              </span>
              <span className="font-mono text-xs" style={{ color: chrome.muted }}>
                {b.steps.join(' · ')}
              </span>
              <span className="text-xs" style={{ color: chrome.muted }}>
                {b.blurb}
              </span>
            </div>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${b.steps.length}, minmax(0,1fr))` }}
            >
              {b.steps.map((step) => {
                const hex = stepHex(scale, mode, step)
                const role = roleFor(step)
                const isSel = selected?.scale === active && selected?.step === step
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => onSelect({ scale: active, step })}
                    onMouseEnter={() => onHover({ scale: active, step })}
                    onMouseLeave={() => onHover(null)}
                    className="flex flex-col gap-1.5 rounded-lg p-2 text-left"
                    style={{
                      background: chrome.panel,
                      boxShadow: `inset 0 0 0 1px ${isSel ? chrome.accent : chrome.border}`,
                    }}
                  >
                    <span
                      className="h-12 w-full rounded-md"
                      style={{ background: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}
                    />
                    <span className="font-mono text-[11px]" style={{ color: chrome.muted }}>
                      Step {step}
                    </span>
                    <span className="text-xs leading-tight" style={{ color: chrome.text }}>
                      {role.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// — pattern 4: purpose-first ——————————————————————————————————

type Intent = 'brand' | 'surface' | 'text'
const INTENTS: { key: Intent; label: string; desc: string; steps: number[] }[] = [
  { key: 'brand', label: 'Brand / solid', desc: 'Buttons, accents', steps: [IDENTITY_STEP, 10] },
  { key: 'surface', label: 'Surface', desc: 'Backgrounds, panels', steps: [1, 2] },
  { key: 'text', label: 'Text', desc: 'Body & headings', steps: [11, 12] },
]

function PurposeFirst(props: {
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { mode, selected, onSelect, onHover, chrome } = props
  const [active, setActive] = useState(selected?.scale ?? 'tomato')
  const [intent, setIntent] = useState<Intent>('brand')
  const [advanced, setAdvanced] = useState(false)
  const scale = scaleByName(active)
  const chosen = INTENTS.find((i) => i.key === intent) as (typeof INTENTS)[number]

  const solid = stepHex(scale, mode, IDENTITY_STEP)
  const bg1 = stepHex(scale, mode, 1)
  const bg2 = stepHex(scale, mode, 2)
  const border = stepHex(scale, mode, 6)
  const text11 = stepHex(scale, mode, 11)
  const text12 = stepHex(scale, mode, 12)

  return (
    <div className="flex flex-col gap-5">
      <ScaleChips mode={mode} value={active} onChange={setActive} chrome={chrome} />
      <div className="grid grid-cols-3 gap-3">
        {INTENTS.map((i) => {
          const isActive = i.key === intent
          return (
            <button
              key={i.key}
              type="button"
              onClick={() => {
                setIntent(i.key)
                onSelect({ scale: active, step: i.steps[0] })
              }}
              className="rounded-lg p-3 text-left"
              style={{
                background: chrome.panel,
                boxShadow: `inset 0 0 0 ${isActive ? 2 : 1}px ${isActive ? chrome.accent : chrome.border}`,
              }}
            >
              <div className="text-sm font-medium" style={{ color: chrome.text }}>
                {i.label}
              </div>
              <div className="text-xs" style={{ color: chrome.muted }}>
                {i.desc} · steps {i.steps.join(' / ')}
              </div>
            </button>
          )
        })}
      </div>

      {/* live result preview for the chosen intent */}
      <div
        className="rounded-xl p-5"
        style={{ background: bg1, boxShadow: `inset 0 0 0 1px ${border}` }}
      >
        {intent === 'brand' ? (
          <div className="flex items-center gap-3">
            <span
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{ background: solid, color: inkOn(solid) }}
            >
              Solid button
            </span>
            <span className="text-sm" style={{ color: text11 }}>
              ← step {IDENTITY_STEP} background, hovers to step 10
            </span>
          </div>
        ) : null}
        {intent === 'surface' ? (
          <div
            className="rounded-lg p-4"
            style={{ background: bg2, boxShadow: `inset 0 0 0 1px ${border}` }}
          >
            <div className="text-sm font-semibold" style={{ color: text12 }}>
              Panel on step 2
            </div>
            <div className="text-sm" style={{ color: text11 }}>
              Page is step 1, panel step 2, hairline step 6.
            </div>
          </div>
        ) : null}
        {intent === 'text' ? (
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold" style={{ color: text12 }}>
              High-contrast heading (step 12)
            </span>
            <span className="text-sm" style={{ color: text11 }}>
              Low-contrast body copy (step 11) on a step-1 background.
            </span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((v) => !v)}
        className="self-start text-xs font-medium"
        style={{ color: chrome.accent }}
      >
        {advanced ? '▾' : '▸'} Advanced — pick an exact step
      </button>
      {advanced ? (
        <div className="flex overflow-hidden rounded-lg">
          {STEP_ROLES.map((role) => (
            <StepCell
              key={role.step}
              scale={scale}
              mode={mode}
              step={role.step}
              height={44}
              showNumber
              selected={selected?.scale === active && selected?.step === role.step}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </div>
      ) : null}
      <p className="text-xs" style={{ color: chrome.muted }}>
        Picking <span style={{ color: chrome.text }}>{chosen.label}</span> selects step{' '}
        <span className="font-mono" style={{ color: chrome.text }}>
          {chosen.steps[0]}
        </span>{' '}
        — no step-number literacy required.
      </p>
    </div>
  )
}

// — pattern 5: combobox (the real surface) ————————————————————

type Grouping = 'hue' | 'function' | 'flat'

const GROUPINGS: { key: Grouping; label: string }[] = [
  { key: 'hue', label: 'Hue families' },
  { key: 'function', label: 'Grays vs accents' },
  { key: 'flat', label: 'Flat A–Z' },
]

type ComboGroup = { label: string | null; scales: RadixScale[] }

function buildGroups(grouping: Grouping, query: string): ComboGroup[] {
  const q = query.trim().toLowerCase()
  const match = (s: RadixScale) => !q || s.name.includes(q)
  if (grouping === 'flat') {
    const scales = [...SCALES].filter(match).sort((a, b) => a.name.localeCompare(b.name))
    return scales.length ? [{ label: null, scales }] : []
  }
  if (grouping === 'function') {
    return (
      [
        { label: 'Accents', scales: SCALES.filter((s) => s.kind === 'accent' && match(s)) },
        { label: 'Grays', scales: SCALES.filter((s) => s.kind === 'gray' && match(s)) },
      ] satisfies ComboGroup[]
    ).filter((g) => g.scales.length)
  }
  return GROUPS.map((g) => ({
    label: g.label,
    scales: scalesIn(g.key as GroupKey).filter(match),
  })).filter((g) => g.scales.length)
}

// the framed popover shell shared by both row designs (search + scroll)
function PopoverFrame(props: {
  title: string
  width: number
  query: string
  onQuery: (q: string) => void
  chrome: Chrome
  children: ReactNode
}) {
  const { title, width, query, onQuery, chrome, children } = props
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs" style={{ color: chrome.muted }}>
        {title} · <span className="font-mono">{width}px</span>
      </div>
      <div
        className="flex flex-col overflow-hidden rounded-xl"
        style={{
          width,
          background: chrome.panel,
          boxShadow: `0 0 0 1px ${chrome.border}, 0 12px 32px rgba(0,0,0,.16)`,
        }}
      >
        <div className="p-1.5" style={{ borderBottom: `1px solid ${chrome.border}` }}>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search colors…"
            className="w-full rounded-md px-2 py-1.5 text-sm outline-none"
            style={{ background: chrome.sub, color: chrome.text }}
          />
        </div>
        <div className="flex max-h-80 flex-col overflow-auto p-1">{children}</div>
      </div>
    </div>
  )
}

function GroupHeader({ label, chrome }: { label: string; chrome: Chrome }) {
  return (
    <div
      className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: chrome.muted }}
    >
      {label}
    </div>
  )
}

function NoResults({ chrome }: { chrome: Chrome }) {
  return (
    <div className="px-2 py-6 text-center text-sm" style={{ color: chrome.muted }}>
      No color found.
    </div>
  )
}

const BAND_SHORT: Record<string, string> = {
  background: 'Bg',
  component: 'Comp',
  border: 'Border',
  solid: 'Solid',
  text: 'Text',
}

// the unfolded 12-step strip (B, on active) — numbers on identity + selected,
// band labels beneath so the step's job is legible inline
function StepStrip(props: {
  scale: RadixScale
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { scale, mode, selected, onSelect, onHover, chrome } = props
  return (
    <div className="flex flex-col gap-1 px-2 pb-2">
      <div className="flex overflow-hidden rounded">
        {STEP_ROLES.map((role) => {
          const hex = stepHex(scale, mode, role.step)
          const ink = inkOn(hex)
          const isSel = selected?.scale === scale.name && selected?.step === role.step
          const isId = role.step === IDENTITY_STEP
          return (
            <button
              key={role.step}
              type="button"
              title={`${scale.name} ${role.step} · ${role.label}`}
              onMouseEnter={() => onHover({ scale: scale.name, step: role.step })}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect({ scale: scale.name, step: role.step })}
              className="relative flex h-6 flex-1 items-center justify-center text-[9px] font-medium"
              style={{
                background: hex,
                color: ink,
                boxShadow: isSel ? `inset 0 0 0 2px ${ink}` : 'none',
                zIndex: isSel ? 1 : 0,
              }}
            >
              {isId || isSel ? role.step : null}
            </button>
          )
        })}
      </div>
      <div className="flex">
        {BANDS.map((b) => (
          <div
            key={b.key}
            className="text-center text-[9px]"
            style={{ flexGrow: b.steps.length, flexBasis: 0, color: chrome.muted }}
          >
            {BAND_SHORT[b.key]}
          </div>
        ))}
      </div>
    </div>
  )
}

function BrightBadge({ chrome }: { chrome: Chrome }) {
  return (
    <span
      className="rounded px-1 text-[9px] font-medium uppercase"
      style={{ background: chrome.sub, color: chrome.muted }}
      title="Step 9 is light — needs dark foreground"
    >
      bright
    </span>
  )
}

// (B) one collapsed identity row that unfolds into the step strip on open
function ExpandRow(props: {
  scale: RadixScale
  mode: Mode
  expanded: boolean
  onToggle: () => void
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { scale, mode, expanded, onToggle, selected, onSelect, onHover, chrome } = props
  const idHex = stepHex(scale, mode, IDENTITY_STEP)
  const rowSelected = selected?.scale === scale.name
  return (
    <div
      className="flex flex-col rounded-md"
      style={{ background: expanded ? chrome.sub : 'transparent' }}
    >
      <button
        type="button"
        onMouseEnter={() => onHover({ scale: scale.name, step: IDENTITY_STEP })}
        onMouseLeave={() => onHover(null)}
        onClick={() => {
          onToggle()
          if (!rowSelected) onSelect({ scale: scale.name, step: IDENTITY_STEP })
        }}
        className="flex items-center gap-2 px-2 py-1.5 text-left"
      >
        <span
          className="size-4 shrink-0 rounded"
          style={{ background: idHex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)' }}
        />
        <span className="text-sm capitalize" style={{ color: chrome.text }}>
          {scale.name}
        </span>
        {isBright(scale) ? <BrightBadge chrome={chrome} /> : null}
        <span className="ml-auto text-xs" style={{ color: chrome.muted }}>
          {expanded ? '▾' : '▸'}
        </span>
      </button>
      {expanded ? (
        <StepStrip
          scale={scale}
          mode={mode}
          selected={selected}
          onSelect={onSelect}
          onHover={onHover}
          chrome={chrome}
        />
      ) : null}
    </div>
  )
}

function ExpandPopover(props: {
  title: string
  width: number
  grouping: Grouping
  query: string
  onQuery: (q: string) => void
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { title, width, grouping, query, onQuery, mode, selected, onSelect, onHover, chrome } =
    props
  const [expanded, setExpanded] = useState<string | null>(selected?.scale ?? null)
  const groups = buildGroups(grouping, query)
  return (
    <PopoverFrame title={title} width={width} query={query} onQuery={onQuery} chrome={chrome}>
      {groups.length === 0 ? (
        <NoResults chrome={chrome} />
      ) : (
        groups.map((group) => (
          <div key={group.label ?? 'flat'} className="flex flex-col">
            {group.label ? <GroupHeader label={group.label} chrome={chrome} /> : null}
            {group.scales.map((scale) => (
              <ExpandRow
                key={scale.name}
                scale={scale}
                mode={mode}
                expanded={expanded === scale.name}
                onToggle={() => setExpanded((cur) => (cur === scale.name ? null : scale.name))}
                selected={selected}
                onSelect={onSelect}
                onHover={onHover}
                chrome={chrome}
              />
            ))}
          </div>
        ))
      )}
    </PopoverFrame>
  )
}

// (A) literal TW parity — scale sub-header, then one labeled row per step
function FlatPopover(props: {
  title: string
  width: number
  grouping: Grouping
  query: string
  onQuery: (q: string) => void
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { title, width, grouping, query, onQuery, mode, selected, onSelect, onHover, chrome } =
    props
  const groups = buildGroups(grouping, query)
  return (
    <PopoverFrame title={title} width={width} query={query} onQuery={onQuery} chrome={chrome}>
      {groups.length === 0 ? (
        <NoResults chrome={chrome} />
      ) : (
        groups.map((group) => (
          <div key={group.label ?? 'flat'} className="flex flex-col">
            {group.label ? <GroupHeader label={group.label} chrome={chrome} /> : null}
            {group.scales.map((scale) => (
              <div key={scale.name} className="flex flex-col">
                <div
                  className="px-2 pt-1.5 pb-0.5 text-xs font-medium capitalize"
                  style={{ color: chrome.text }}
                >
                  {scale.name}
                </div>
                {STEP_ROLES.map((role) => {
                  const hex = stepHex(scale, mode, role.step)
                  const isSel = selected?.scale === scale.name && selected?.step === role.step
                  const isId = role.step === IDENTITY_STEP
                  return (
                    <button
                      key={role.step}
                      type="button"
                      onMouseEnter={() => onHover({ scale: scale.name, step: role.step })}
                      onMouseLeave={() => onHover(null)}
                      onClick={() => onSelect({ scale: scale.name, step: role.step })}
                      className="flex items-center gap-2 rounded-md py-1 pr-2 pl-3 text-left"
                      style={{ background: isSel ? chrome.sub : 'transparent' }}
                    >
                      <span
                        className="size-4 shrink-0 rounded"
                        style={{ background: hex, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)' }}
                      />
                      <span
                        className="w-4 shrink-0 font-mono text-[11px]"
                        style={{ color: chrome.muted }}
                      >
                        {role.step}
                      </span>
                      <span
                        className="truncate text-xs"
                        style={{ color: chrome.text, fontWeight: isId ? 600 : 400 }}
                      >
                        {role.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ))
      )}
    </PopoverFrame>
  )
}

function ComboboxLab(props: {
  mode: Mode
  selected: Sel | null
  onSelect: (s: Sel) => void
  onHover: (s: Sel | null) => void
  chrome: Chrome
}) {
  const { mode, selected, onSelect, onHover, chrome } = props
  const [grouping, setGrouping] = useState<Grouping>('hue')
  const [query, setQuery] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium" style={{ color: chrome.text }}>
          Grouping
        </span>
        <SegTabs value={grouping} options={GROUPINGS} onChange={setGrouping} chrome={chrome} />
      </div>
      <p className="text-xs" style={{ color: chrome.muted }}>
        Both expose every step — no blocked options, full TW parity. (B) starts compact (identity +
        name) and unfolds the band-labeled strip on click; default lands on step {IDENTITY_STEP}.
        (A) lists one labeled row per step under each scale — zero new interaction, but taller.
      </p>
      <div className="flex flex-wrap items-start gap-6">
        <ExpandPopover
          title="(B) Expand-on-active"
          width={236}
          grouping={grouping}
          query={query}
          onQuery={setQuery}
          mode={mode}
          selected={selected}
          onSelect={onSelect}
          onHover={onHover}
          chrome={chrome}
        />
        <FlatPopover
          title="(A) Flat step rows — TW parity"
          width={252}
          grouping={grouping}
          query={query}
          onQuery={setQuery}
          mode={mode}
          selected={selected}
          onSelect={onSelect}
          onHover={onHover}
          chrome={chrome}
        />
      </div>
    </div>
  )
}

// — page ——————————————————————————————————————————————————————

export default function RadixColorsProtoPage() {
  const [mode, setMode] = useState<Mode>('light')
  const [pattern, setPattern] = useState<PatternKey>('combobox')
  const [selected, setSelected] = useState<Sel | null>({ scale: 'tomato', step: IDENTITY_STEP })
  const [hovered, setHovered] = useState<Sel | null>(null)
  const chrome = chromeFor(mode)

  const focus = hovered ?? selected
  const focusHex = focus ? stepHex(scaleByName(focus.scale), mode, focus.step) : null
  const focusRole = focus ? roleFor(focus.step) : null
  const focusBand = focus ? bandFor(focus.step) : null

  const activeNote = PATTERNS.find((p) => p.key === pattern)?.note

  const shared = { mode, selected, onSelect: setSelected, onHover: setHovered, chrome }

  return (
    <div className="min-h-dvh w-full" style={{ background: chrome.bg, color: chrome.text }}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Radix color picker — pattern lab</h1>
          <p className="text-sm" style={{ color: chrome.muted }}>
            Throwaway prototype. All 31 scales vendored accurately from{' '}
            <span className="font-mono">@radix-ui/colors@3.0.0</span> (solid, light + dark). The{' '}
            <span style={{ color: chrome.text }}>Combobox</span> tab is the real surface —
            everything else is full-page exploration.
          </p>
        </header>

        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegTabs value={pattern} options={PATTERNS} onChange={setPattern} chrome={chrome} />
          <SegTabs
            value={mode}
            options={[
              { key: 'light' as Mode, label: 'Light' },
              { key: 'dark' as Mode, label: 'Dark' },
            ]}
            onChange={setMode}
            chrome={chrome}
          />
        </div>

        {/* live selection / hover readout */}
        <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: chrome.sub }}>
          <span
            className="size-10 shrink-0 rounded-md"
            style={{
              background: focusHex ?? 'transparent',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)',
            }}
          />
          {focus && focusRole && focusBand ? (
            <div className="flex flex-col">
              <div className="text-sm font-medium capitalize">
                {focus.scale} <span className="font-mono lowercase">{focusHex}</span>
              </div>
              <div className="text-xs" style={{ color: chrome.muted }}>
                Step {focus.step} · {focusBand.name} · {focusRole.label}
              </div>
            </div>
          ) : (
            <span className="text-sm" style={{ color: chrome.muted }}>
              Hover or click a swatch…
            </span>
          )}
        </div>

        <p className="text-xs" style={{ color: chrome.muted }}>
          {activeNote}
        </p>

        {/* active pattern */}
        <div>
          {pattern === 'combobox' ? <ComboboxLab {...shared} /> : null}
          {pattern === 'ramp-rows' ? <RampRows {...shared} /> : null}
          {pattern === 'drill-down' ? <DrillDown {...shared} /> : null}
          {pattern === 'bands' ? <SemanticBands {...shared} /> : null}
          {pattern === 'purpose' ? <PurposeFirst {...shared} /> : null}
        </div>
      </div>
    </div>
  )
}
