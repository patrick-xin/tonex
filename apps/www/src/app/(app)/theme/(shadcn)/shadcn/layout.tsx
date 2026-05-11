import type React from 'react'
import { ShadcnRail } from '@/features/shadcn-rail'
import { LayerProvider } from '@/lib/layer-context'
import { ShadcnProvider } from './_provider'
import { ShadcnNavTabs } from './_shadcn-nav-tabs'

// why: chrome (ShadcnRail, NavTabs) stays outside ShadcnProvider so it
// dogfoods components/ui/ per ADR-0019 commitment 4. ShadcnProvider scopes
// only the canvas (children).
export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="shadcn">
      <ShadcnRail />
      <div className="flex-1 flex flex-col h-[calc(100dvh-80px)] xl:h-screen overflow-hidden px-2">
        <ShadcnNavTabs />
        <ShadcnProvider>{children}</ShadcnProvider>
      </div>
    </LayerProvider>
  )
}
