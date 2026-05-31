'use client'

import { TrashIcon } from '@phosphor-icons/react'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ChartPaletteToggle } from '@/features/chart-palette'
import { TwPickerEnableToggle } from '@/features/color-picker'
import { ContrastLevelSlider } from '@/features/contrast-level'
import { ResetButton } from '@/features/reset-button'
import { SoftBordersToggle } from '@/features/shadcn-soft-border'
import type { Layer } from '@/lib/layer-context'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

// Shared settings body rendered inside both the desktop popover (Settings) and
// the mobile drawer (SettingsDrawer). onAfterReset closes whichever surface is
// hosting it once a reset is confirmed.
export function SettingsFields({
  layer,
  onAfterReset,
}: {
  layer: Layer
  onAfterReset?: () => void
}) {
  const showExtended = useUiPrefs((s) => s.showExtended)
  const setShowExtended = useUiPrefs((s) => s.actions.setShowExtended)
  const brandEnabled = useUiPrefs((s) => s.brandEnabled)
  const setBrandEnabled = useUiPrefs((s) => s.actions.setBrandEnabled)

  return (
    <>
      {layer === 'md' && (
        <>
          <Field name="extended-colors" className="gap-1">
            <FieldLabel className="items-center justify-between w-full">
              Extended tokens
              <Switch size="sm" checked={showExtended} onCheckedChange={setShowExtended} />
            </FieldLabel>
            <FieldDescription className="max-w-5/6">
              Show additional color roles for tokens
            </FieldDescription>
          </Field>
          <Separator className="opacity-50" />
        </>
      )}
      {layer === 'shadcn' && (
        <>
          <Field name="brand-color" className="gap-1">
            <FieldLabel className="items-center justify-between w-full">
              Brand color
              <Switch size="sm" checked={brandEnabled} onCheckedChange={setBrandEnabled} />
            </FieldLabel>
            <FieldDescription className="max-w-5/6">
              Export brand color pair (current seed)
            </FieldDescription>
          </Field>
          <Separator className="opacity-50" />
          <SoftBordersToggle />
          <Separator className="opacity-50" />
        </>
      )}
      <ContrastLevelSlider />
      <Separator className="opacity-50" />
      <ChartPaletteToggle />
      <Separator className="opacity-50" />
      <TwPickerEnableToggle />
      <Separator className="opacity-50" />
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-sm font-medium leading-snug text-on-surface">Reset</span>
          <p className="text-xs text-on-surface-variant">Reset current theme to app's default</p>
        </div>

        <ResetButton variant="danger" size="icon-xs" onConfirm={onAfterReset}>
          <TrashIcon />
        </ResetButton>
      </div>
    </>
  )
}
