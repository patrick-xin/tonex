'use client'

import React from 'react'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/shadcn/combobox'
import { Input } from '@/components/shadcn/input'
import { Label } from '@/components/shadcn/label'
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/radio-group'
import { Slider } from '@/components/shadcn/slider'
import { Switch } from '@/components/shadcn/switch'

const frameworks = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

export function ComboboxMultiple({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  const anchor = useComboboxAnchor()

  return (
    <Combobox multiple autoHighlight items={frameworks} defaultValue={[frameworks[0]]}>
      <ComboboxChips ref={anchor} className="w-full max-w-xs">
        <ComboboxValue>
          {(values) => (
            <React.Fragment>
              {values.map((value: string) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent ref={ref} anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function InputsDemo({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="sheet-demo-name">Email</Label>
        <Input type="email" id="sheet-demo-name" placeholder="Email" />
      </div>
      <div>
        <ComboboxMultiple ref={ref} />
      </div>
      <Slider defaultValue={[75]} max={100} step={1} className="mx-auto w-full max-w-xs mt-2" />
      <Checkbox defaultChecked />
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>
      <RadioGroup defaultValue="comfortable" className="w-fit">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="default" id="r1" />
          <Label htmlFor="r1">Default</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="comfortable" id="r2" />
          <Label htmlFor="r2">Comfortable</Label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="compact" id="r3" />
          <Label htmlFor="r3">Compact</Label>
        </div>
      </RadioGroup>
    </div>
  )
}
