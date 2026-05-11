import type React from 'react'
import { TopNav } from '@/components/shared/top-nav'
import { ShadcnRail, ShadcnRailDrawer } from '@/features/shadcn-rail'
import { LayerProvider } from '@/lib/layer-context'
import { ShadcnProvider } from './_provider'
import { ShadcnNavTabs } from './_shadcn-nav-tabs'

// why: chrome (ShadcnRail, NavTabs) stays outside ShadcnProvider so it
// dogfoods components/ui/ per ADR-0019 commitment 4. ShadcnProvider scopes
// only the canvas (children).
export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="shadcn">
      <div className="flex h-dvh overflow-hidden">
        <ShadcnRail />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-2">
          <TopNav>
            <ShadcnRailDrawer />
          </TopNav>
          <ShadcnNavTabs />
          <div className="flex-1 min-h-0 overflow-hidden">
            <ShadcnProvider>{children}</ShadcnProvider>
          </div>
        </div>
      </div>
    </LayerProvider>
  )
}
