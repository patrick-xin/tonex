'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useUiPrefs } from '@/lib/stores/ui-prefs'

export function TwPickerEnableToggle() {
  const enabled = useUiPrefs((s) => s.twPickerEnabled)
  const setEnabled = useUiPrefs((s) => s.actions.setTwPickerEnabled)

  return (
    <div className="flex items-center gap-2">
      <Switch id="tw-picker-enable" size="sm" checked={enabled} onCheckedChange={setEnabled} />
      <Label htmlFor="tw-picker-enable" className="text-xs cursor-pointer select-none">
        Tailwind picker
      </Label>
    </div>
  )
}
