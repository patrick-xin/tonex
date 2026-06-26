'use client'

import { FileJsonIcon } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import { useState } from 'react'
import { CssIcon, FlutterIcon, MdIcon, ShadcnIcon, TailwindCSSIcon } from '@/components/icons'
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

export function ExportTabs({ highlighted }: { highlighted: Record<ExportTab, string> }) {
  const [tab, setTab] = useState<ExportTab>('Tailwind')
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as ExportTab)}
      className="w-full mx-auto"
    >
      <TabsListContent
        className="mx-auto mb-6 overflow-x-auto max-w-full no-scrollbar shadow-crisp"
        indicatorClassName="bg-secondary-container data-[orientation=horizontal]:h-[calc(100%-12px)]"
      >
        {EXPORT_TABS.map(({ value, label, icon: TabIcon }) => (
          <TabsTab
            key={value}
            value={value}
            className="text-on-surface-variant data-active:text-on-secondary-container hover:text-on-surface sm:min-w-28 flex-1"
          >
            <TabIcon /> {label}
          </TabsTab>
        ))}
      </TabsListContent>
      {EXPORT_TABS.map(({ value }) => (
        <TabsPanel
          key={value}
          value={value}
          className="mx-auto max-h-[50vh] w-full overflow-hidden mask-b-from-20% mask-b-to-90% max-w-4xl shadow-sm"
        >
          <div className="overflow-hidden rounded-xl border border-t-0 border-outline-variant/40 relative">
            <div className="flex gap-2 py-2 px-4 relative">
              <div className="bg-red-400 size-3 rounded-full" />
              <div className="bg-yellow-400 size-3 rounded-full" />
              <div className="bg-green-400 size-3 rounded-full" />
              <ShimmerBorder className="h-px" />
            </div>
            <div className="h-[50vh] overflow-hidden text-xs leading-relaxed">
              <div className="rounded-t-2xl bg-surface-container-low">
                {/* biome-ignore lint/security/noDangerouslySetInnerHtml: server-highlighted static demo code from a hardcoded constant */}
                <div dangerouslySetInnerHTML={{ __html: highlighted[value] }} />
              </div>
            </div>
          </div>
        </TabsPanel>
      ))}
    </Tabs>
  )
}
