'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { DemoLoader } from '@/components/shared/demo-loader'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { AppFan } from './app-fan'
import { ProductPoster } from './poster'

const ChartMixedAxes = dynamic(
  () => import('../../../(app)/theme/(md)/dashboard-preview/_components/chart-mixed-axes'),
  {
    loading: () => <DemoLoader />,
  },
)

const KpiSparkCard = dynamic(
  () => import('../../../(app)/theme/(md)/dashboard-preview/_components/kpi-card'),
  {
    loading: () => <DemoLoader />,
  },
)

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
        className="mx-auto mb-8 flex-wrap shadow-crisp"
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
      <TabsPanel value="dashboard" className="flex w-full justify-center max-w-5xl">
        <div className="flex flex-col gap-4 w-full">
          <div className="h-110">
            <ChartMixedAxes />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiSparkCard
              badge="MTD"
              delta="+12.4%"
              description="Net inflow"
              title="Revenue"
              trend="up"
              value="$128,430"
            />
            <KpiSparkCard
              badge="Runway"
              delta="+4.9%"
              description="Operating costs"
              title="Burn"
              trend="down"
              value="$54,210"
            />
          </div>
        </div>
      </TabsPanel>
    </Tabs>
  )
}
