'use client'

import { useSource } from '@tonex/core'
import { type VariantGroup, type VariantName, variants } from '@tonex/core/variants'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const SCHEME_VARIANT_GROUPS: VariantGroup[] = ['cmf', 'standard', 'expressive', 'subdued']

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
    <div className="flex flex-col gap-4">
      {SCHEME_VARIANT_GROUPS.map((group) => {
        const items = VARIANT_NAMES.filter((v) => variants[v].group === group)
        if (items.length === 0) return null
        return (
          <div key={group} className="space-y-1">
            <div className="text-[11px] uppercase font-semibold px-0.5 text-on-surface/60 tracking-wide leading-snug">
              {GROUP_LABELS[group]}
            </div>
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
                <ToggleGroupItem key={v} value={v} className="px-1.5 gap-0 text-[11px]">
                  {VARIANT_LABELS[v]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )
      })}
    </div>
  )
}
