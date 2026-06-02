'use client'

import {
  NEUTRAL_PALETTE_NAMES,
  type NeutralPaletteName,
  TAILWIND_PALETTE_OKLCH,
} from '@tonex/core/data'
import { useSource } from '@tonex/core-react'
import { cn } from 'tailwind-variants'
import { Chip } from '@/components/ui/chip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// why: a palette is a tone ramp; shade 500 reads as its "identity" colour, so
// it's what the chip shows.
function swatchOf(name: NeutralPaletteName): string | undefined {
  return (TAILWIND_PALETTE_OKLCH[name] as Record<string, string> | undefined)?.['500']
}

// why: the neutral palette only applies under the tint algo, so this row lives
// at the top of the Tint panel. Chips (not a dropdown) keep it in the rail's
// swatch language; the name rides a tooltip so the row stays compact.
export function NeutralPaletteChips() {
  const paletteName = useSource((s) => s.surfacePaletteName)
  const setPaletteName = useSource((s) => s.actions.setSurfacePaletteName)

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-on-surface-variant">Tailwind neutral color</div>
      <TooltipProvider>
        <div className="flex flex-wrap justify-around gap-3">
          {NEUTRAL_PALETTE_NAMES.map((n) => (
            <Tooltip key={n}>
              <TooltipTrigger
                render={
                  <Chip
                    aria-label={n}
                    onClick={() => setPaletteName(n)}
                    className={cn(
                      'rounded-full size-5 outline-outline-variant/60 outline-1 bg-transparent p-0  outline-offset-2 hover:outline-outline cursor-pointer',
                      paletteName === n && 'outline-primary',
                    )}
                  >
                    <div
                      className="size-full rounded-full"
                      style={{ backgroundColor: swatchOf(n) }}
                    />
                  </Chip>
                }
              />
              <TooltipContent className="capitalize">{n}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}
