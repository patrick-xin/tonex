'use client'

import { XIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/shadcn/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/shadcn/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/select'
import { Slider } from '@/components/shadcn/slider'
import { Textarea } from '@/components/shadcn/textarea'

const CURRENCIES = [
  { label: 'USD — United States Dollar', value: 'usd' },
  { label: 'EUR — Euro', value: 'eur' },
  { label: 'GBP — British Pound', value: 'gbp' },
  { label: 'JPY — Japanese Yen', value: 'jpy' },
]

export function PayoutThreshold({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  const [amount, setAmount] = React.useState([2500])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payout Threshold</CardTitle>
        <CardDescription>
          Set the minimum balance required before a payout is triggered.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" className="bg-muted">
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="preferred-currency">Preferred Currency</FieldLabel>
            <Select items={CURRENCIES} defaultValue="usd">
              <SelectTrigger id="preferred-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent containerRef={ref}>
                <SelectGroup>
                  {CURRENCIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
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
        </FieldGroup>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full">Save Threshold</Button>
      </CardFooter>
    </Card>
  )
}
