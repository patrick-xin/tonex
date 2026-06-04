'use client'

import { FileJsonIcon } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { useState } from 'react'
import { CssIcon } from '@/components/icons/css'
import { FlutterIcon } from '@/components/icons/flutter'
import { MdIcon } from '@/components/icons/md'
import { ShadcnIcon } from '@/components/icons/shadcn'
import { TailwindCSSIcon } from '@/components/icons/tailwind'
import { ShimmerBorder } from '@/components/shared/shimmer-border'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import type { ExportTab } from '@/features/export'
import { EXPORT_CODE } from './export-code'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

type ExportTabConfig = {
  value: ExportTab
  label: string
  icon: IconComponent
}

const icons: Record<Lowercase<ExportTab>, IconComponent> = {
  tailwind: TailwindCSSIcon,
  json: FileJsonIcon,
  css: CssIcon,
  'design.md': MdIcon,
  shadcn: ShadcnIcon,
  dart: FlutterIcon,
}

const EXPORT_TABS: ExportTabConfig[] = (Object.keys(EXPORT_CODE) as ExportTab[]).map((value) => ({
  value,
  label: value === 'shadcn' ? 'Shadcn' : value,
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
        className="mx-auto mb-6 overflow-x-auto max-w-full no-scrollbar"
        indicatorClassName="bg-secondary-container"
      >
        {EXPORT_TABS.map(({ value, label, icon: TabIcon }) => (
          <TabsTab
            key={value}
            value={value}
            className="text-on-surface-variant hover:text-on-surface data-active:text-on-secondary-container sm:min-w-26 flex-1"
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
          <div className="rounded-md border border-outline-variant/40 border-t-0 relative">
            <div className="bg-surface-container-high rounded-md rounded-b-none flex gap-2 py-2 px-4">
              <div className="bg-red-500 size-3 rounded-full" />
              <div className="bg-yellow-500 size-3 rounded-full" />
              <div className="bg-green-500 size-3 rounded-full" />
            </div>
            <pre className="h-[50vh] bg-surface-container-low p-4 font-mono text-xs text-on-surface-variant whitespace-pre">
              <ShimmerBorder />
              {EXPORT_CODE[value]}
            </pre>
          </div>
        </TabsPanel>
      ))}
    </Tabs>
  )
}
