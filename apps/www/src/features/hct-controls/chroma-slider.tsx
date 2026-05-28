'use client'

import { useRef, useState } from 'react'
import { cn, cx } from 'tailwind-variants'
import { Input } from '@/components/ui/input'
import {
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  sliderStyles,
} from '@/components/ui/slider'
import { focusVisiblePrimaryRing } from '@/components/ui/styles'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ChromaSliderProps {
  value: number
  max?: number
  step?: number
  gradient: string
  onValueChange: (value: number) => void
  gamutLimit: number
  disabled?: boolean
}

function ValueDisplay({
  value,
  gamutLimit,
  onCommit,
  disabled,
}: {
  value: number
  gamutLimit: number
  onCommit: (v: number) => void
  disabled?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const commitDraft = () => {
    setEditing(false)
    const n = Number.parseFloat(draft)
    if (!Number.isNaN(n)) onCommit(Math.max(0, Math.min(n, gamutLimit)))
  }

  if (editing) {
    return (
      <Input
        disabled={disabled}
        ref={inputRef}
        type="text"
        inputMode="decimal"
        className={cn(
          'max-w-12 w-fit h-6 px-0 py-1 tabular-nums text-right text-on-surface-variant bg-transparent',
        )}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (disabled) return
          commitDraft()
        }}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter') commitDraft()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <button
      disabled={disabled}
      type="button"
      className={cn(
        'text-sm h-6 tabular-nums cursor-text rounded-md',
        disabled && 'cursor-default opacity-38 select-none',
        focusVisiblePrimaryRing,
      )}
      onClick={() => {
        if (disabled) return
        // why: see hct-slider.tsx — `.toFixed(2)` preserves decimal HCT
        // precision; pre-fix `Math.round` drifted seedHex on tap-Enter
        // (issue #56). gamutLimit stays rounded — it's a max ceiling, not
        // a value the user adjusts.
        setDraft(value.toFixed(2))
        setEditing(true)
        requestAnimationFrame(() => inputRef.current?.select())
      }}
    >
      {value.toFixed(2)}
      <span className="text-on-surface/60"> / {Math.round(gamutLimit)}</span>
    </button>
  )
}

// why: chroma's gamut wall is hue+tone-dependent — the same numeric chroma
// can be representable at one hue and clamped at another. We show the wall
// inline (striped overlay + tick + tooltip) so the user understands why
// dragging past gamutPct produces no visible color change. Clamp the value
// passed to the underlying slider so the thumb never overshoots the wall.
// why: step=0.01 keeps the slider WYSIWYG with the `.toFixed(2)` display
// above — see hct-slider.tsx for the same rationale (issue #56).
export function ChromaSlider({
  value,
  max = 150,
  step = 0.01,
  gradient,
  onValueChange,
  gamutLimit,
  disabled,
}: ChromaSliderProps) {
  const gamutPct = Math.min((gamutLimit / max) * 100, 100)
  const clampedValue = Math.min(value, gamutLimit)
  const sliderStore = sliderStyles()
  return (
    <SliderRoot
      disabled={disabled}
      thumbAlignment="edge-client-only"
      value={clampedValue}
      max={max}
      step={step}
      onValueChange={(v) => {
        const n = v as unknown as number
        onValueChange(Math.min(n, gamutLimit))
      }}
      className="w-full space-y-1"
    >
      <div className="flex items-center justify-between">
        <SliderLabel aria-disabled={disabled} className={cx(sliderStore.label())}>
          Chroma
        </SliderLabel>
        <ValueDisplay
          disabled={disabled}
          value={clampedValue}
          gamutLimit={gamutLimit}
          onCommit={onValueChange}
        />
      </div>

      <SliderControl className={cx(sliderStore.control())}>
        <SliderTrack
          className={cx('relative w-full h-2.5 rounded-full', disabled && 'opacity-38')}
          style={{ background: gradient }}
        >
          {gamutPct < 100 && !disabled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div
                      className="absolute inset-y-0 rounded-r-full z-[1] cursor-not-allowed"
                      style={{ left: `${gamutPct}%`, right: 0 }}
                    />
                  }
                />
                <TooltipContent>
                  Maximum saturation reached for brightness (max {Math.round(gamutLimit)})
                </TooltipContent>
              </Tooltip>
              <div
                className="absolute inset-y-0 rounded-r-full pointer-events-none"
                style={{
                  left: `${gamutPct}%`,
                  right: 0,
                  background: `repeating-linear-gradient(
                    -45deg,
                    transparent,
                    transparent 2px,
                    var(--color-surface) 2px,
                    var(--color-surface) 4px
                  )`,
                  opacity: 0.7,
                }}
              />
              {/* why: the tick marks where the gamut wall sits inside the
                  track. At tone 0/100 the limit collapses to ~0, so there's no
                  wall to mark — the tick would just pin to the left edge as
                  noise. Hide it once the rounded max (what the tooltip shows)
                  reaches 0. */}
              {Math.round(gamutLimit) > 0 && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-1 h-4 rounded-full pointer-events-none bg-tertiary"
                  style={{ left: `${gamutPct}%` }}
                />
              )}
            </TooltipProvider>
          )}
          <SliderIndicator className="absolute h-full rounded-full" />
          <SliderThumb className={cx(sliderStore.thumb(), 'size-4.5')} />
        </SliderTrack>
      </SliderControl>
    </SliderRoot>
  )
}
