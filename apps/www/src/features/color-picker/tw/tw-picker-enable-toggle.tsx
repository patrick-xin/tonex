'use client'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

export function TwPickerEnableToggle() {
  const enabled = useUiPrefs((s) => s.twPickerEnabled)
  const setEnabled = useUiPrefs((s) => s.actions.setTwPickerEnabled)

  return (
    <Field name="tailwind-picker-enable" className="gap-1">
      <FieldLabel className="items-center justify-between w-full">
        Tailwind color picker
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </FieldLabel>
      <FieldDescription className="max-w-5/6">Enable tailwind color picker.</FieldDescription>
    </Field>
  )
}
