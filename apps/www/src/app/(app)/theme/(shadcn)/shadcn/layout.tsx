import type React from 'react'
import { LayerProvider } from '@/lib/layer-context'
import { ShadcnProvider } from './_provider'
import { ShadcnRailSwitcher } from './_rail'
import { ShadcnNavTabs } from './_shadcn-nav-tabs'

export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="shadcn">
      <ShadcnRailSwitcher />
      <div className="flex-1 flex flex-col h-[calc(100dvh-80px)] xl:h-screen overflow-hidden px-2">
        <ShadcnNavTabs />
        <ShadcnProvider>{children}</ShadcnProvider>
      </div>
    </LayerProvider>
  )
}
