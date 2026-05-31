'use client'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useSoftBorder } from './toggle'

export function SoftBordersToggle() {
  const { enabled, setEnabled } = useSoftBorder()

  return (
    <Field name="soft-borders" className="gap-1">
      <FieldLabel className="items-center justify-between w-full">
        Soft borders
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Toggle soft borders" />
      </FieldLabel>
      <FieldDescription className="max-w-5/6">
        Uses softer colors for borders and inputs. This can reduce accessibility.
      </FieldDescription>
    </Field>
  )
}
