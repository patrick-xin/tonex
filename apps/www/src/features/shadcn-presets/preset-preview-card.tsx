'use client'

import { SHADCN_PRESETS, type ShadcnPresetName } from '@tonex/core/schema'
import {
  createPreviewCardHandle,
  PreviewCard,
  PreviewCardPopup,
  PreviewCardPortal,
  PreviewCardPositioner,
  PreviewCardViewport,
} from '@/components/ui/preview-card'
import { previewCardStyles } from './preset-preview-card.styles'
import type { Swatches } from './preview-swatches'
import { usePresetPreview } from './use-preset-preview'

const { positioner, popup, viewport } = previewCardStyles()

// why: one shared handle drives a single morphing card across every chip (Base
// UI detached-trigger pattern) — the card slides + resizes between presets
// instead of nine cards popping independently. Lives here (the card owns it);
// the trigger and picker import it.
export const presetPreviewHandle = createPreviewCardHandle<ShadcnPresetName>()

// Role order shared by the trigger strip and the card's swatch column so the
// two always read the same colors top-to-bottom / left-to-right.
export const COLUMN_ORDER: (keyof Swatches)[] = ['primary', 'secondary', 'accent', 'bg', 'card']

// camelCase MCU variant names (tonalSpot, fruitSalad) read poorly as raw chips —
// split the words and lowercase so they match the surfaceAlgo/palette chips,
// which are already single lowercase words (this is a no-op for them).
const humanizeChip = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()

function PresetCardBody({ name }: { name: ShadcnPresetName }) {
  const recipe = SHADCN_PRESETS[name]
  const { swatches } = usePresetPreview(name)
  // why: surfacePaletteName is per-mode (#242) — collapse to one chip when both
  // modes share a family, show `light/dark` when they diverge (mirrors the
  // formatContrast convention so the chip stays honest about both modes).
  const { light, dark } = recipe.surfacePaletteName
  const paletteChip = light === dark ? light : `${light}/${dark}`
  return (
    <div className="flex w-72 gap-3 p-4">
      <div className="flex flex-col overflow-hidden rounded-sm justify-between">
        {COLUMN_ORDER.map((k) => (
          <div key={k} className="h-5 w-6" style={{ backgroundColor: swatches[k] }} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="font-medium text-sm capitalize text-on-surface">{name}</div>
        <p className="text-xs leading-snug text-on-surface-variant">{recipe.description}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {[recipe.variant, recipe.surfaceAlgo, paletteChip].map((chip) => (
            <span
              key={chip}
              className="rounded bg-surface-container-low px-1.5 py-0.5 text-xs text-on-surface-variant"
            >
              {humanizeChip(chip)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Detached morphing card (Base UI detached-triggers pattern). All the
// resize/slide/cross-fade animation lives in previewCardStyles.
export function PresetPreviewCard() {
  return (
    <PreviewCard handle={presetPreviewHandle}>
      {({ payload }) => (
        <PreviewCardPortal>
          <PreviewCardPositioner side="left" sideOffset={2} className={positioner()}>
            <PreviewCardPopup className={popup({ className: 'bg-surface' })}>
              <PreviewCardViewport className={viewport()}>
                {payload ? <PresetCardBody name={payload} /> : null}
              </PreviewCardViewport>
            </PreviewCardPopup>
          </PreviewCardPositioner>
        </PreviewCardPortal>
      )}
    </PreviewCard>
  )
}
