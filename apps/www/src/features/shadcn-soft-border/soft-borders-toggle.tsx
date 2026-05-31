'use client'

import { HelpCircle } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSoftBorder } from './toggle'

export function SoftBordersToggle() {
  const { enabled, setEnabled } = useSoftBorder()

  return (
    <Field name="soft-borders" className="gap-1">
      <FieldLabel className="items-center justify-between w-full">
        <div className="flex items-center gap-2">
          Soft borders
          <Tooltip>
            <TooltipTrigger delay={0}>
              <HelpCircle className="w-4 h-4 text-on-surface-variant" />
            </TooltipTrigger>
            <TooltipContent className="w-56">
              <div>Uses softer colors for borders and inputs. This can reduce accessibility.</div>
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Toggle soft borders" />
      </FieldLabel>
    </Field>
  )
}
