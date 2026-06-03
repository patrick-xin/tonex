'use client'

import { useState } from 'react'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { ChartMixedAxes } from '../../../(app)/theme/(md)/dashboard-preview/_components/chart-mixed-axes'
import { KpiSparkGrid } from '../../../(app)/theme/(md)/dashboard-preview/_components/kpi-card'
import { AppFan } from './app-fan'
import { ProductPoster } from './poster'

const PRODUCT_TABS = [
  { value: 'poster', label: 'Marketing' },
  { value: 'apps', label: 'Mobile Apps' },
  { value: 'dashboard', label: 'Dashboard' },
] as const

type ProductTab = (typeof PRODUCT_TABS)[number]['value']

export function ProductTabs() {
  const [tab, setTab] = useState<ProductTab>('poster')
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as ProductTab)}
      className="w-full items-center"
    >
      <TabsListContent
        className="mx-auto mb-8 flex-wrap"
        indicatorClassName="bg-secondary-container"
      >
        {PRODUCT_TABS.map((t) => (
          <TabsTab
            key={t.value}
            value={t.value}
            className="text-on-surface-variant hover:text-on-surface data-active:text-on-secondary-container sm:min-w-24"
          >
            {t.label}
          </TabsTab>
        ))}
      </TabsListContent>
      <TabsPanel value="poster" className="flex w-full justify-center">
        <ProductPoster />
      </TabsPanel>
      <TabsPanel value="apps" className="flex w-full justify-center">
        <AppFan />
      </TabsPanel>
      <TabsPanel value="dashboard" className="flex w-screen justify-center">
        <div className="flex flex-col gap-4 xl:gap-6 w-full">
          <div className="h-120">
            <ChartMixedAxes />
          </div>
          <KpiSparkGrid />
        </div>
      </TabsPanel>
    </Tabs>
  )
}
