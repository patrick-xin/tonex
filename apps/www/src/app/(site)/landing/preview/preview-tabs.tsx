'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { MdIcon, ShadcnIcon } from '@/components/icons'
import { DemoLoader } from '@/components/shared/demo-loader'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'

const ShadcnDemos = dynamic(() => import('./shadcn-demos'), {
  loading: () => <DemoLoader />,
})

const MdDemos = dynamic(() => import('./md-demos'), {
  loading: () => <DemoLoader />,
})

const PRODUCT_TABS = [
  { value: 'shadcn', label: 'Shadcn' },
  { value: 'md', label: 'Material Design Tokens' },
] as const

type ProductTab = (typeof PRODUCT_TABS)[number]['value']

export function PreviewTabs() {
  const [tab, setTab] = useState<ProductTab>('shadcn')
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as ProductTab)}
      className="min-h-0 flex-1"
    >
      <TabsListContent
        className="sm:mx-auto sm:w-96 mb-6 mx-4 shadow-crisp"
        indicatorClassName="bg-secondary-container"
      >
        <TabsTab
          value="shadcn"
          className="text-on-surface-variant hover:text-on-surface data-active:text-on-secondary-container"
        >
          <ShadcnIcon /> Shadcn
        </TabsTab>
        <TabsTab
          value="md"
          className="text-on-surface-variant hover:text-on-surface data-active:text-on-secondary-container"
        >
          <MdIcon className="size-4.25" /> Material Design Tokens
        </TabsTab>
      </TabsListContent>
      <div className="overflow-x-auto overflow-y-hidden sm:overscroll-x-contain mask-[linear-gradient(to_bottom,black_80%,transparent)] min-w-0 h-[60vh] px-4 sm:px-0">
        <TabsPanel value="shadcn" className="max-h-full">
          <ShadcnDemos />
        </TabsPanel>
        <TabsPanel value="md" className="max-h-full">
          <MdDemos />
        </TabsPanel>
      </div>
    </Tabs>
  )
}
