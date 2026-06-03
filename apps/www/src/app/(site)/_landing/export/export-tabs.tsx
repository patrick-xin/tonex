'use client'

import { BellIcon, FileCssIcon } from '@phosphor-icons/react'
import { FileJsonIcon } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { useState } from 'react'
import { MdIcon } from '@/components/icons/md'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { TailwindCSSIcon } from '@/components/icons/tailwind'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import type { ExportTab } from '@/features/export'
import { EXPORT_CODE } from './export-code'

// Phosphor, lucide and the hand-rolled brand SVGs are all just svg components —
// widen to their common shape so the map can hold any of them.
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type ExportTabConfig = {
  value: ExportTab
  label: string
  icon: IconComponent
}

// Keyed by the lowercased tab value. Typed as an exhaustive map, so adding a new
// ExportTab forces a matching icon here (no silent fallback).
const icons: Record<Lowercase<ExportTab>, IconComponent> = {
  tailwind: TailwindCSSIcon,
  json: FileJsonIcon,
  css: FileCssIcon,
  'design.md': MdIcon,
  shadcn: ShadcnIcon,
  dart: BellIcon,
}

// One entry per export format. `label` is decoupled from the code key; `icon`
// comes from the map above.
const EXPORT_TABS: ExportTabConfig[] = (Object.keys(EXPORT_CODE) as ExportTab[]).map((value) => ({
  value,
  label: value,
  icon: icons[value.toLowerCase() as Lowercase<ExportTab>],
}))

export function ExportTabs() {
  const [tab, setTab] = useState<ExportTab>('Tailwind')
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as ExportTab)}
      className="w-full max-w-6xl mx-auto px-4"
    >
      <TabsListContent
        className="mx-auto mb-6 flex-wrap"
        indicatorClassName="bg-secondary-container"
      >
        {EXPORT_TABS.map(({ value, label, icon: TabIcon }) => (
          <TabsTab
            key={value}
            value={value}
            className="text-on-surface-variant hover:text-on-surface data-active:text-on-secondary-container sm:min-w-24"
          >
            <TabIcon /> {label}
          </TabsTab>
        ))}
      </TabsListContent>
      {EXPORT_TABS.map(({ value }) => (
        <TabsPanel
          key={value}
          value={value}
          className="mx-auto max-h-[50vh] w-full overflow-hidden mask-b-from-20% mask-b-to-90%"
        >
          <pre className="h-[50vh] rounded-md border border-outline-variant/40 border-t-0 relative bg-surface-container-low p-4 font-mono text-xs text-on-surface-variant whitespace-pre">
            <ShimmerBorder />
            {EXPORT_CODE[value]}
          </pre>
        </TabsPanel>
      ))}
    </Tabs>
  )
}
