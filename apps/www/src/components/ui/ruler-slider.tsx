'use client'

import { Slider as BaseSlider } from '@base-ui/react/slider'
import * as React from 'react'
import { cn, tv, type VariantProps } from 'tailwind-variants'

// RulerSlider — a tick-mark / ruler slider built on Base UI's unstyled slider.
// Promoted from the slider-prototype; B / D / C from that exploration are
// configurations of this one component:
//   • B → signed range + `detent={0}` (center snap) + active ticks
//   • D → `fill` (frosted gradient panel that tracks the value) + active ticks
//   • C → `majorEvery` + `showLabels` + `caret` (instrument-ruler layout)

const rulerSliderStyles = tv({
  slots: {
    root: [
      'relative w-full touch-none select-none rounded-md border border-outline-variant bg-surface-container-high px-3',
      'data-disabled:pointer-events-none data-disabled:opacity-50',
    ],
    control: 'relative flex h-full w-full',
    track: 'relative h-full w-full',
    // gradient + width are applied inline (they track the live value); the slot
    // only positions and shapes the panel. `-left-3` cancels the root's px-3 so
    // the panel bleeds flush to the container's inner edge; `rounded-md` matches
    // the container so the panel nests into its corners at max.
    fill: 'absolute inset-y-0 -left-3 rounded-md',
    thumb: [
      'group absolute top-1/2 flex h-full w-5 -translate-y-1/2 items-center justify-center outline-none',
      'cursor-grab active:cursor-grabbing data-disabled:cursor-default',
    ],
    bar: [
      'w-0.5 rounded-full shadow-sm transition-[width,background-color] duration-150',
      'group-focus-visible:w-1 group-focus-visible:bg-primary',
      'group-data-[dragging]:w-1 group-data-[dragging]:bg-primary',
    ],
    caret: 'absolute top-0 size-1.5 -translate-y-1/2 rotate-45 rounded-[1px]',
    label:
      'pointer-events-none absolute -translate-x-1/2 text-xs text-on-surface-variant tabular-nums',
  },
  variants: {
    layout: {
      centered: { control: 'items-center' },
      ruler: { root: 'h-20 pt-3 pb-6', control: 'items-start' },
    },
    tone: {
      primary: { bar: 'bg-primary', caret: 'bg-primary' },
      neutral: { bar: 'bg-on-surface', caret: 'bg-on-surface' },
    },
    // shrinks height + bar (e.g. in a rail); horizontal px-3 stays fixed so the
    // fill's `-left-3` escape and width math hold across sizes.
    size: {
      default: { bar: 'h-7' },
      sm: { bar: 'h-4' },
    },
  },
  compoundVariants: [
    // height only applies in the centered layout; the ruler layout sets its own.
    { layout: 'centered', size: 'default', class: { root: 'h-14' } },
    { layout: 'centered', size: 'sm', class: { root: 'h-10' } },
  ],
  defaultVariants: { layout: 'centered', tone: 'primary', size: 'default' },
})

// Per-tick styling lives in its own factory since active/tier vary per tick.
const rulerTickStyles = tv({
  base: 'absolute w-px -translate-x-1/2 rounded-full',
  variants: {
    active: {
      true: 'bg-primary',
      false: 'bg-on-surface/20',
    },
    anchor: {
      center: 'top-1/2 -translate-y-1/2',
      top: 'top-0',
    },
    tier: {
      minor: '',
      major: '',
      center: '',
    },
    size: {
      default: '',
      sm: '',
    },
  },
  compoundVariants: [
    { anchor: 'center', tier: 'minor', size: 'default', class: 'h-3' },
    { anchor: 'center', tier: 'minor', size: 'sm', class: 'h-3' },
    { anchor: 'center', tier: 'center', size: 'default', class: 'h-6' },
    { anchor: 'center', tier: 'center', size: 'sm', class: 'h-4.5' },
    // ruler layout (top anchor) isn't sized down — C isn't used in compact rails.
    { anchor: 'top', tier: 'minor', class: 'h-2.5' },
    { anchor: 'top', tier: 'major', class: 'h-5' },
  ],
  defaultVariants: { active: false, anchor: 'center', tier: 'minor', size: 'default' },
})

// token-driven so the panel adapts to light/dark instead of the prototype's
// hardcoded rgba. Subtle top→bottom falloff, like image 2.
const FILL_GRADIENT =
  'linear-gradient(oklch(from var(--color-on-surface) l c h / 0.07), oklch(from var(--color-on-surface) l c h / 0.03))'

type RulerSliderVariants = VariantProps<typeof rulerSliderStyles>

interface RulerSliderProps extends RulerSliderVariants {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  /** drag granularity */
  step?: number
  onValueChange?: (value: number) => void
  disabled?: boolean
  className?: string
  /** spacing between rendered ticks, in value units (defaults to `step`) */
  tickStep?: number
  /** highlight ticks between the origin (detent ?? min) and the value */
  activeTicks?: boolean
  /** D — translucent gradient panel from the left edge to the value */
  fill?: boolean
  /** B — value to snap to when dragged within `detentSnap` of it */
  detent?: number
  detentSnap?: number
  /** C — caret on the cursor */
  caret?: boolean
  /** C — every Nth tick is a major (taller) tick */
  majorEvery?: number
  /** C — numeric labels under major ticks (switches to the ruler layout) */
  showLabels?: boolean
  'aria-label'?: string
}

function RulerSlider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  disabled,
  className,
  tickStep,
  activeTicks = true,
  fill,
  detent,
  detentSnap = 2,
  caret,
  majorEvery,
  showLabels,
  layout,
  tone = 'primary',
  size = 'default',
  'aria-label': ariaLabel,
}: RulerSliderProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultValue ?? value ?? min)
  const current = isControlled ? (value as number) : internal

  const handleChange = React.useCallback(
    (raw: number | number[]) => {
      let next = Array.isArray(raw) ? raw[0] : raw
      if (detent != null && Math.abs(next - detent) <= detentSnap) next = detent
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [detent, detentSnap, isControlled, onValueChange],
  )

  const resolvedLayout = layout ?? (showLabels ? 'ruler' : 'centered')
  const tickAnchor = resolvedLayout === 'ruler' ? 'top' : 'center'

  const styles = rulerSliderStyles({ layout: resolvedLayout, tone, size })

  const stepUnit = tickStep ?? step
  const ticks = React.useMemo(() => {
    const out: number[] = []
    for (let t = min; t <= max + 1e-9; t += stepUnit) out.push(Number(t.toFixed(6)))
    return out
  }, [min, max, stepUnit])

  const pct = (t: number) => ((t - min) / (max - min)) * 100
  const origin = detent ?? min
  const lo = Math.min(origin, current)
  const hi = Math.max(origin, current)

  return (
    <BaseSlider.Root
      className={cn(styles.root(), className)}
      data-slot="ruler-slider"
      disabled={disabled}
      max={max}
      min={min}
      onValueChange={handleChange}
      step={step}
      thumbAlignment="center"
      value={current}
    >
      <BaseSlider.Control className={styles.control()} data-slot="ruler-slider-control">
        <BaseSlider.Track className={styles.track()} data-slot="ruler-slider-track">
          {/* hidden at the start so an empty panel doesn't sit at min. width =
              value fraction + 24px (12px for the padding escape, 12px to clear
              the thumb's half-width and reach the container's inner edge at max)
              so the bar sits inside the frosted region with no gap at the end. */}
          {fill && current > min && (
            <div
              className={styles.fill()}
              style={{
                width: `calc(${pct(current)}% + 24px)`,
                background: FILL_GRADIENT,
              }}
            />
          )}

          {ticks.map((t, i) => {
            const isCenter = detent != null && t === detent
            const isMajor = majorEvery != null && i % majorEvery === 0
            const tier = isCenter ? 'center' : isMajor ? 'major' : 'minor'
            const active = activeTicks && t >= lo && t <= hi
            return (
              <React.Fragment key={t}>
                <span
                  className={rulerTickStyles({ active, anchor: tickAnchor, tier, size })}
                  style={{ left: `${pct(t)}%` }}
                />
                {showLabels && isMajor && (
                  <span className={styles.label()} style={{ left: `${pct(t)}%`, top: '1.5rem' }}>
                    {t}
                  </span>
                )}
              </React.Fragment>
            )
          })}

          <BaseSlider.Thumb
            aria-label={ariaLabel}
            className={styles.thumb()}
            data-slot="ruler-slider-thumb"
          >
            {caret && <span className={styles.caret()} />}
            <span className={styles.bar()} />
          </BaseSlider.Thumb>
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}

export type { RulerSliderProps }
export { RulerSlider, rulerSliderStyles, rulerTickStyles }
