'use client'

import {
  VARIANT_GROUPS_ORDERED,
  type VariantGroup,
  type VariantName,
  variants,
} from '@tonex/core/variants'
import { useSource } from '@tonex/core-react'
import { cn } from 'tailwind-variants'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CmfSecondSourcePicker } from './cmf-second-source-picker'

const GROUP_LABELS: Record<VariantGroup, string> = {
  cmf: 'CMF',
  standard: 'Standard',
  expressive: 'Expressive',
  subdued: 'Subdued',
}

const VARIANT_LABELS: Record<VariantName, string> = {
  cmf: 'CMF',
  tonalSpot: 'Tonal Spot',
  fidelity: 'Fidelity',
  content: 'Content',
  vibrant: 'Vibrant',
  expressive: 'Expressive',
  fruitSalad: 'Fruit Salad',
  rainbow: 'Rainbow',
  neutral: 'Neutral',
  monochrome: 'Monochrome',
}

const VARIANT_NAMES = Object.keys(variants) as VariantName[]

export function SchemeVariantsToggle() {
  const variant = useSource((s) => s.variant)
  const setVariant = useSource((s) => s.actions.setVariant)

  return (
    <div className="flex flex-col gap-3">
      {VARIANT_GROUPS_ORDERED.map((group) => {
        const items = VARIANT_NAMES.filter((v) => variants[v].group === group)
        return (
          <div key={group} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase font-semibold text-on-surface/60 tracking-wide">
                {GROUP_LABELS[group]}
              </div>
            </div>
            <div className="flex items-center">
              <ToggleGroup
                variant="outline"
                size="xs"
                className="justify-start min-w-6"
                value={[variant]}
                onValueChange={(value) => {
                  if (value.length > 0) setVariant(value[0] as VariantName)
                }}
              >
                {items.map((v) => (
                  <ToggleGroupItem
                    key={v}
                    value={v}
                    className={cn('px-1.5', group === 'cmf' && 'rounded-r-none')}
                  >
                    {VARIANT_LABELS[v]}
                  </ToggleGroupItem>
                ))}
                {group === 'cmf' && (
                  <CmfSecondSourcePicker className="border border-l-0 rounded-md rounded-l-none h-7 px-1 bg-secondary-container border-primary/12" />
                )}
              </ToggleGroup>
            </div>
          </div>
        )
      })}
    </div>
  )
}
