'use client'

import { CaretDownIcon } from '@phosphor-icons/react'
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInputGroupContent,
  AutocompleteItem,
  AutocompleteList,
} from '@/components/ui/autocomplete'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CheckboxGroup } from '@/components/ui/checkbox-group'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInputGroupContent,
  ComboboxItemContent,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Field,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
} from '@/components/ui/field'
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset'
import { Form } from '@/components/ui/form'
import { NumberField } from '@/components/ui/number-field'
import { Radio, RadioGroup } from '@/components/ui/radio'
import {
  Select,
  SelectContent,
  SelectItemContent,
  SelectTriggerGroup,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider, SliderValue } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

export function ProjectQuoteForm() {
  return (
    <Form
      aria-label="Request project quote"
      className="flex flex-col gap-6 rounded-md p-4 sm:p-6 bg-surface-container shadow-md"
      onFormSubmit={(formValues) => {
        console.log(formValues)
      }}
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight">Project Inquiry</h2>
        <p className="text-sm text-on-surface-variant">
          Tell us about your idea to get an estimated quote.
        </p>
      </div>
      <Field name="projectName">
        <FieldLabel>Project Title</FieldLabel>
        <FieldControl minLength={5} placeholder="e.g. SaaS Dashboard Redesign" required />
        <FieldDescription>A short name for this project</FieldDescription>
        <FieldError />
      </Field>
      <Field name="clientLocation">
        <Combobox items={LOCATIONS} required>
          <FieldLabel>Headquarters Location</FieldLabel>
          <ComboboxInputGroupContent className="w-80" placeholder="Select major city..." />
          <ComboboxContent>
            <ComboboxEmpty>No location found</ComboboxEmpty>
            <ComboboxList>
              {(location: string) => (
                <ComboboxItemContent key={location} value={location}>
                  {location}
                </ComboboxItemContent>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError />
      </Field>
      <Field name="primaryTechStack">
        <Autocomplete
          items={FRAMEWORKS}
          itemToStringValue={(item: Framework) => item.name}
          mode="both"
          required
        >
          <FieldLabel>Preferred Framework</FieldLabel>
          <AutocompleteInputGroupContent className="w-80" placeholder="e.g. Next.js" />
          <FieldDescription>The core technology you want us to use.</FieldDescription>
          <AutocompleteContent>
            <AutocompleteEmpty>No frameworks found.</AutocompleteEmpty>
            <AutocompleteList>
              {(fw: Framework) => (
                <AutocompleteItem
                  className="flex-col justify-start items-start py-2"
                  key={fw.id}
                  value={fw}
                >
                  <span className="font-medium text-sm">{fw.name}</span>
                  <span className="text-xs text-on-surface-variant">{fw.description}</span>
                </AutocompleteItem>
              )}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
        <FieldError />
      </Field>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Field className="col-span-1 md:col-span-2" name="projectType">
          <FieldLabel>Type</FieldLabel>
          <Select items={PROJECT_TYPES} required>
            <SelectTriggerGroup
              className="w-full"
              indicatorIcon={<CaretDownIcon />}
              placeholder="Marketing Website"
            />
            <SelectContent>
              {PROJECT_TYPES.map(({ label, value }) => (
                <SelectItemContent key={value} value={value}>
                  {label}
                </SelectItemContent>
              ))}
            </SelectContent>
          </Select>
          <FieldError />
        </Field>
        <Field className="col-span-1 w-32" name="timelineWeeks">
          <FieldLabel>Timeline (Weeks)</FieldLabel>
          <NumberField defaultValue={undefined} max={20} min={1} required />
          <FieldError />
        </Field>
      </div>
      <Field name="budgetRange">
        <Fieldset>
          <FieldsetLegend>Budget Range</FieldsetLegend>
          <Slider
            className="pt-2 w-full"
            defaultValue={[5, 20]}
            max={100}
            min={1}
            step={1}
            thumbAlignment="edge-client-only"
          >
            <SliderValue className="text-on-surface-variant">
              {(_, values) => {
                const [min, max] = values
                const formatter = new Intl.NumberFormat('en-US', {
                  currency: 'USD',
                  maximumFractionDigits: 0,
                  style: 'currency',
                })
                return `${formatter.format(min * 1000)} – ${formatter.format(max * 1000)}`
              }}
            </SliderValue>
          </Slider>
        </Fieldset>
      </Field>
      <Separator />
      <Field name="priority">
        <Fieldset render={<RadioGroup className="flex flex-col gap-3" defaultValue="quality" />}>
          <FieldsetLegend>Primary Priority</FieldsetLegend>
          <div className="flex gap-3">
            {[
              { id: 'speed', label: 'Speed' },
              { id: 'quality', label: 'Quality' },
              { id: 'budget', label: 'Cost' },
            ].map((item) => (
              <FieldItem key={item.id}>
                <FieldLabel>
                  <Radio value={item.id} />
                  {item.label}
                </FieldLabel>
              </FieldItem>
            ))}
          </div>
        </Fieldset>
      </Field>
      <Field name="additionalServices">
        <Fieldset render={<CheckboxGroup defaultValue={['design']} />}>
          <FieldsetLegend>Included Services</FieldsetLegend>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'design', label: 'UI/UX Design' },
              { id: 'seo', label: 'SEO Setup' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'cms', label: 'CMS Integration' },
            ].map((s) => (
              <FieldItem key={s.id}>
                <FieldLabel>
                  <Checkbox value={s.id} />
                  {s.label}
                </FieldLabel>
              </FieldItem>
            ))}
          </div>
        </Fieldset>
      </Field>
      <Field name="requireNda">
        <FieldLabel className="flex w-full justify-between items-center">
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Require NDA</span>
            <span className="text-xs font-normal text-on-surface-variant">
              Legal agreement before starting
            </span>
          </span>
          <Switch />
        </FieldLabel>
      </Field>
      <Button className="mt-4 w-full" size="lg" type="submit">
        Submit
      </Button>
    </Form>
  )
}

const LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'London, UK',
  'Berlin, DE',
  'Toronto, CA',
  'Shanghai, CN',
  'Singapore, SG',
  'Sydney, AU',
  'Remote (Worldwide)',
]

interface Framework {
  id: string
  name: string
  description: string
}

const FRAMEWORKS: Framework[] = [
  { description: 'Standard UI Library', id: 'react', name: 'React' },
  { description: 'Full-stack React Framework', id: 'nextjs', name: 'Next.js' },
  { description: 'Progressive Framework', id: 'vue', name: 'Vue.js' },
  { description: 'Cybernetically enhanced apps', id: 'svelte', name: 'Svelte' },
  { description: 'Enterprise-ready platform', id: 'angular', name: 'Angular' },
  { description: 'Content-focused websites', id: 'astro', name: 'Astro' },
]

const PROJECT_TYPES = [
  { label: 'Marketing Website', value: 'marketing' },
  { label: 'E-commerce Store', value: 'ecommerce' },
  { label: 'Web Application', value: 'webapp' },
  { label: 'Mobile App (iOS/Android)', value: 'mobile' },
  { label: 'Internal Dashboard', value: 'dashboard' },
]
