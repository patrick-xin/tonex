'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset'
import { Input } from '@/components/ui/input'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { Label } from '../../../../../../components/ui/label'

const METHODS = [
  { id: 'method-bank', value: 'bank', label: 'Bank Transfer', hint: 'SWIFT / IBAN' },
  { id: 'method-paypal', value: 'paypal', label: 'PayPal', hint: 'Instant Payout' },
]

export function ReceivingMethod() {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Payout Preferences</CardDescription>
        <CardTitle>Receiving Method</CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon-sm" className="bg-surface-container-high">
            <X />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <Field>
            <FieldLabel htmlFor="account-holder">Account Holder Name</FieldLabel>
            <Input id="account-holder" defaultValue="Synthetic Horizons Music LLC" />
          </Field>
          <Fieldset>
            <FieldsetLegend>Receiving Method</FieldsetLegend>
            <RadioGroup
              defaultValue="bank"
              className="grid grid-cols-1 items-start gap-3 md:grid-cols-2"
            >
              {METHODS.map((method) => (
                <Label
                  key={method.value}
                  htmlFor={method.id}
                  className="items-start gap-3 rounded-md border border-outline-variant p-3"
                >
                  <Radio id={method.id} value={method.value} className="mt-0.5" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-on-surface">{method.label}</span>
                    <span className="text-xs text-on-surface-variant">{method.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </Fieldset>
          <Field>
            <FieldLabel htmlFor="iban">IBAN / Account Number</FieldLabel>
            <Input id="iban" placeholder="DE89 3704 0044 ...." />
          </Field>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled>
          Save Payout Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
