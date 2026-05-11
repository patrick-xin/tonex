'use client'

import { HelpCircle } from 'lucide-react'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSoftBorder } from './toggle'

export function SoftBordersToggle() {
  const { enabled, setEnabled } = useSoftBorder()

  return (
    <Field name="soft-borders" className="gap-1 p-2">
      <FieldLabel className="items-center justify-between w-full">
        <div className="flex items-center gap-2">
          Soft borders
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Uses softer colors for borders and inputs. This can reduce accessibility—keep an eye
              on the contrast checker to ensure your UI remains usable.
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          size="sm"
          checked={enabled}
          onCheckedChange={setEnabled}
          aria-label="enable soft border"
        />
      </FieldLabel>
      <FieldDescription className="max-w-5/6">
        Replicates subtle border aesthetic of shadcn/ui.
      </FieldDescription>
    </Field>
  )
}
