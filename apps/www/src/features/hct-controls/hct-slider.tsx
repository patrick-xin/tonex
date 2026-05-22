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

interface HctSliderProps {
  label: string
  value: number
  max: number
  step?: number
  gradient: string
  onValueChange: (value: number) => void
  disabled?: boolean
  // why: when the axis is disabled for a *reason the user can act on* (hue goes
  // inert below CHROMA_HUE_LOCK), the explanation rides a tooltip on the track
  // instead of an inline line — keeps the slider triplet at a fixed height so
  // it doesn't overflow the shadcn rail's folded panel. Same pattern as the
  // chroma gamut-wall tooltip.
  disabledHint?: string
}

// why: 0.01 keeps the slider WYSIWYG with the `.toFixed(2)` display below —
// the smallest drag tick the user can see equals the smallest emit. Pre-fix
// step=1 forced an integer round-trip through hexFromHct on every touch and
// drifted seedHex (issue #56).
export function HctSlider({
  label,
  value,
  max,
  step = 0.01,
  gradient,
  onValueChange,
  disabled,
  disabledHint,
}: HctSliderProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const sliderStore = sliderStyles()

  // why: inline numeric editor lets keyboard users skip the slider for
  // precise jumps. Pattern is: click value → text input → enter/blur commit.
  // Clamp on commit so out-of-range typing settles to a valid axis value.
  const commitDraft = () => {
    setEditing(false)
    const n = Number.parseFloat(draft)
    if (!Number.isNaN(n)) onValueChange(Math.max(0, Math.min(n, max)))
  }

  return (
    <SliderRoot
      thumbAlignment="edge-client-only"
      value={value}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(v) => onValueChange(v as unknown as number)}
      className="w-full space-y-1"
    >
      <div className="flex items-center h-6 justify-between">
        <SliderLabel aria-disabled={disabled} className={cx(sliderStore.label())}>
          {label}
        </SliderLabel>
        <div className="-mt-0.5">
          {editing ? (
            <Input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              className={cn(
                'max-w-12 w-fit h-full px-0 py-0 tabular-nums text-right text-on-surface-variant bg-transparent',
              )}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitDraft()
                if (e.key === 'Escape') setEditing(false)
              }}
            />
          ) : (
            <button
              type="button"
              className={cn(
                'text-sm h-6 tabular-nums cursor-text rounded-md',
                disabled && 'cursor-default opacity-38 select-none',
                focusVisiblePrimaryRing,
              )}
              onClick={() => {
                if (disabled) return
                // why: `.toFixed(2)` preserves the user's perceptual precision
                // without rounding away the decimal HCT the slider holds.
                // Pre-fix `Math.round` collapsed e.g. 47.86 → 48 and tap-Enter
                // committed the integer, drifting seedHex (issue #56).
                setDraft(value.toFixed(2))
                setEditing(true)
                requestAnimationFrame(() => inputRef.current?.select())
              }}
            >
              {value.toFixed(2)}
            </button>
          )}
        </div>
      </div>

      <SliderControl className={cx(sliderStore.control())}>
        <SliderTrack
          className={cx('relative w-full h-2.5 rounded-full', disabled && 'opacity-38')}
          style={{ background: gradient }}
        >
          {disabled && disabledHint && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="absolute inset-0 rounded-full z-[1] cursor-not-allowed" />
                  }
                />
                <TooltipContent variant="inverse">{disabledHint}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <SliderIndicator className="absolute h-full rounded-full" />
          <SliderThumb className={cx(sliderStore.thumb(), 'size-4.5')} />
        </SliderTrack>
      </SliderControl>
    </SliderRoot>
  )
}
