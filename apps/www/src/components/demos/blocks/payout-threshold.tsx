'use client'

import { XIcon } from 'lucide-react'
import * as React from 'react'
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItemContent,
  SelectTriggerGroup,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

const CURRENCIES = [
  { label: 'USD — United States Dollar', value: 'usd' },
  { label: 'EUR — Euro', value: 'eur' },
  { label: 'GBP — British Pound', value: 'gbp' },
  { label: 'JPY — Japanese Yen', value: 'jpy' },
]

export function PayoutThreshold() {
  const [amount, setAmount] = React.useState([2500])

  return (
    <Card className="max-w-lg w-full col-span-full sm:col-span-1">
      <CardHeader>
        <CardTitle>Payout Threshold</CardTitle>
        <CardDescription>
          Set the minimum balance required before a payout is triggered.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" className="bg-surface-container-high">
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Field name="preferred-currency">
            <FieldLabel>Preferred Currency</FieldLabel>
            <Select items={CURRENCIES} defaultValue="usd">
              <SelectTriggerGroup className="w-full" />
              <SelectContent alignItemWithTrigger>
                <SelectGroup>
                  {CURRENCIES.map((item) => (
                    <SelectItemContent key={item.value} value={item.value}>
                      {item.label}
                    </SelectItemContent>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <div className="flex items-baseline justify-between">
              <FieldLabel htmlFor="min-payout">Minimum Payout Amount</FieldLabel>
              <span className="text-2xl font-semibold tabular-nums">${amount[0].toFixed(2)}</span>
            </div>
            <Slider
              id="min-payout"
              value={amount}
              onValueChange={(value) => setAmount(Array.isArray(value) ? [...value] : [value])}
              min={50}
              max={10000}
              step={50}
            />

            <div className="flex items-center justify-between">
              <FieldDescription>$50 (MIN)</FieldDescription>
              <FieldDescription>$10,000 (MAX)</FieldDescription>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="payout-notes">Notes</FieldLabel>
            <Textarea
              id="payout-notes"
              placeholder="Add any notes for this payout configuration..."
              className="min-h-[100px]"
            />
          </Field>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Save Threshold</Button>
      </CardFooter>
    </Card>
  )
}
