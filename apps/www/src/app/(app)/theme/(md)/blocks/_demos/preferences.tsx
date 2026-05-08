import { XIcon } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

const CURRENCIES = [
  { label: 'USD — United States Dollar', value: 'usd' },
  { label: 'EUR — Euro', value: 'eur' },
  { label: 'GBP — British Pound', value: 'gbp' },
  { label: 'JPY — Japanese Yen', value: 'jpy' },
]

export function Preferences() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Manage your account settings and notifications.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon-sm" className="bg-surface-container-high">
            <XIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Field name="default-currency">
            <FieldLabel>Default Currency</FieldLabel>
            <Select items={CURRENCIES} defaultValue="usd">
              <SelectTriggerGroup className="w-full" />

              <SelectContent>
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
          <Separator className="h-px" />
          <Field name="public-statistics" className="flex">
            <div className="flex-1 space-y-0.5">
              <FieldLabel>Public Statistics</FieldLabel>
              <FieldDescription>
                Allow others to see your total stream count and listening activity
              </FieldDescription>
            </div>
            <Switch defaultChecked className="self-start mt-1" />
          </Field>
          <Separator className="h-px" />
          <Field name="email-notifications" className="flex">
            <div className="flex-1">
              <FieldLabel>Email Notifications</FieldLabel>
              <FieldDescription>Monthly royalty reports and distribution updates</FieldDescription>
            </div>
            <Switch defaultChecked className="self-start mt-1" />
          </Field>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button variant="outline">Reset</Button>
        <Button className="ml-auto">Save Preferences</Button>
      </CardFooter>
    </Card>
  )
}
