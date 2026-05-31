'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString, oklchString } from '@tonex/core/oklch'
import type { MdTokenName, PaletteName } from '@tonex/core/schema'
import { cx } from 'tailwind-variants'
import { HctColorPicker } from '@/components/shared/hct-color-picker'
import { Button } from '@/components/ui/button'
import {
  createPopoverHandle,
  Popover,
  PopoverArrow,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
  PopoverViewport,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useActiveMode } from '@/features/theme-mode'

interface AnimatedButtonColorPickerProps {
  palette: PaletteName
  label: string
  className?: string
  side?: 'bottom' | 'right'
  disabled?: boolean
  // why: when disabled, surface the engine's reason as a tooltip on the
  // trigger. Same string the disabled-reason selector returns; UI is the
  // truth surface for "user could have done this", core is the backstop.
  disabledReason?: string | null
}

// why: representative md token per palette for the swatch + picker preview.
// Palette overrides are FLAT (a palette is a tone ramp, mode picks tones from
// it), but the swatch shows the current mode's effective color so the user
// can see what they're about to replace. neutral → surface and neutralVariant
// → outline mirror MCU's family-to-token mapping in MaterialDynamicColors.
const PALETTE_PREVIEW_TOKEN: Record<PaletteName, MdTokenName> = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  tertiary: '--color-tertiary',
  neutral: '--color-surface',
  neutralVariant: '--color-outline',
  error: '--color-error',
}

// why: shared handle across all six button instances so clicking from one
// row to the next reuses the SAME popover, sliding between payloads instead
// of dismissing and remounting. Cosmetic but matches the legacy editor-rail
// feel; the BasePopover handle pattern is the documented hook for it.
export const popoverHandle = createPopoverHandle<React.ComponentType>()

export function AnimatedButtonColorPicker({
  palette,
  label,
  className,
  disabled = false,
  disabledReason = null,
  side = 'right',
}: AnimatedButtonColorPickerProps) {
  const mode = useActiveMode()
  const theme = useResolvedTokens()
  // why: paletteOverrides is flat — keyed by palette only, not by mode. A
  // palette IS a tone ramp; mode selects tones from it.
  const override = useSource((s) => s.paletteOverrides[palette])
  const previewToken = PALETTE_PREVIEW_TOKEN[palette]
  // why: derive emits argb (ADR-0021); project to oklch at the swatch read
  // boundary so the inline style consumes a CSS-valid string. Dual fallback
  // to a neutral hex when either mode === null (pre-hydration, ADR-0015's
  // two-flag guard) OR theme === undefined (source store not hydrated) so
  // the rail never paints a wrong-mode swatch on first paint.
  const swatchArgb = mode !== null ? theme?.md[mode][previewToken] : undefined
  const swatch = swatchArgb !== undefined ? oklchString(swatchArgb) : '#000000'
  const isOverridden = override !== undefined

  const trigger = (
    <PopoverTrigger
      disabled={disabled}
      handle={popoverHandle}
      payload={() => (mode !== null ? <Payload palette={palette} mode={mode} /> : null)}
      render={
        <Button
          size="sm"
          variant="ghost"
          className={cx('justify-between px-2 w-full data-popup-open:bg-primary/8', className)}
        />
      }
    >
      <span className="flex items-center gap-2">
        <span
          className="size-3.5 rounded-full shrink-0 ring-1 ring-scrim/10"
          style={{ backgroundColor: swatch }}
        />
        {label}
      </span>

      {isOverridden && !disabled && <span className="size-1.5 rounded-full bg-primary shrink-0" />}
    </PopoverTrigger>
  )

  return (
    <div>
      {disabled && disabledReason !== null ? (
        <Tooltip>
          <TooltipTrigger delay={100} render={trigger} />
          <TooltipContent>{disabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <Popover
        handle={popoverHandle}
        onOpenChange={(isOpen, eventDetails) => {
          if (isOpen || eventDetails.reason !== 'outside-press') return
          const target = eventDetails.event?.target as HTMLElement | undefined
          if (target?.closest('[data-open]'))
            // press landed inside another popover popup → that's inner picker, keep outer open
            eventDetails.cancel()
        }}
      >
        {({ payload: Payload }) => (
          <PopoverPortal>
            <PopoverPositioner
              side={side}
              sideOffset={8}
              className={cx(
                'h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom,transform] duration-[0.35s] ease-spring data-instant:transition-none',
              )}
            >
              <PopoverPopup
                className={cx(
                  'surface-popup h-(--popup-height,auto) w-(--popup-width,auto) origin-(--transform-origin) rounded-md transition-[width,height,opacity,scale] duration-[0.35s] ease-spring',
                )}
              >
                <PopoverArrow className="flex transition-[left] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)]" />

                <PopoverViewport
                  className={cx([
                    "relative h-full w-full overflow-clip p-1 [&_[data-current]]:w-[calc(var(--popup-width)-3rem)] [&_[data-current]]:translate-x-0 [&_[data-current]]:opacity-100 [&_[data-current]]:transition-[translate,opacity] [&_[data-current]]:duration-[350ms,175ms] [&_[data-current]]:ease-spring data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:-translate-x-1/2",
                    "data-[activation-direction~='left']:[&_[data-current][data-starting-style]]:opacity-0",
                    "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:translate-x-1/2",
                    "data-[activation-direction~='right']:[&_[data-current][data-starting-style]]:opacity-0",
                    '[&_[data-previous]]:w-[calc(var(--popup-width)-3rem)]',
                    '[&_[data-previous]]:translate-x-0',
                    '[&_[data-previous]]:opacity-100',
                    '[&_[data-previous]]:transition-[translate,opacity]',
                    '[&_[data-previous]]:duration-[350ms,175ms]',
                    '[&_[data-previous]]:ease-spring',
                    "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:translate-x-1/2",
                    "data-[activation-direction~='left']:[&_[data-previous][data-ending-style]]:opacity-0",
                    "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:-translate-x-1/2",
                    "data-[activation-direction~='right']:[&_[data-previous][data-ending-style]]:opacity-0",
                  ])}
                >
                  {Payload !== undefined && <Payload />}
                </PopoverViewport>
              </PopoverPopup>
            </PopoverPositioner>
          </PopoverPortal>
        )}
      </Popover>
    </div>
  )
}

function Payload({ palette, mode }: { palette: PaletteName; mode: Mode }) {
  const theme = useResolvedTokens()
  const override = useSource((s) => s.paletteOverrides[palette])
  const setOverride = useSource((s) => s.actions.setPaletteOverride)

  const isOverridden = override !== undefined
  const previewToken = PALETTE_PREVIEW_TOKEN[palette]
  // why: picker speaks hex; derive emits argb (ADR-0021). Convert at the
  // read boundary so the picker stays format-agnostic. Override value (when
  // set) is already hex — no conversion needed in that branch. Pre-hydration
  // falls back to a safe hex so HCT decode never sees a non-hex string.
  const resolvedArgb = theme?.md[mode][previewToken]
  const value = override ?? (resolvedArgb !== undefined ? hexString(resolvedArgb) : '#000000')

  const handleChange = (hex: string) => {
    setOverride(palette, hex)
  }

  return (
    <div className="flex flex-col gap-3 mb-4 p-2">
      <div className="flex items-center justify-between h-4">
        <p className="font-medium text-sm">Override {palette} palette</p>
        {isOverridden && <ResetOverrideButton onReset={() => setOverride(palette, null)} />}
      </div>

      <HctColorPicker value={value} onChange={handleChange} />
    </div>
  )
}

function ResetOverrideButton({ onReset }: { onReset: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        delay={100}
        render={
          <Button variant="ghost" size="icon-xs" onClick={onReset}>
            <ArrowCounterClockwiseIcon />
          </Button>
        }
      />
      <TooltipContent>Reset palette</TooltipContent>
    </Tooltip>
  )
}
