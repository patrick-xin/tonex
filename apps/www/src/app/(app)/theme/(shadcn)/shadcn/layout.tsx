import type React from 'react'
import { TopNav } from '@/components/shared/top-nav'
import { MobileActionBar } from '@/features/mobile-action-bar'
import { GuideProvider, OnboardingTour } from '@/features/onboarding-guide'
import { ShadcnRailDrawer } from '@/features/shadcn-rail'
import { LayerProvider } from '@/lib/layer-context'
import { shadcnNavConfig } from './_nav-config'
import { ShadcnProvider } from './_provider'
import { ShadcnRailSwitcher } from './_rail'
import { ShadcnNavTabs } from './_shadcn-nav-tabs'

export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="shadcn">
      <GuideProvider>
        <div className="flex h-dvh overflow-hidden">
          <ShadcnRailSwitcher />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-2">
            <TopNav layer="shadcn" />
            <ShadcnNavTabs />
            <div className="flex-1 min-h-0 overflow-hidden">
              <ShadcnProvider>{children}</ShadcnProvider>
            </div>
            <MobileActionBar
              crossLink={shadcnNavConfig.crossLink}
              railDrawer={<ShadcnRailDrawer />}
            />
          </div>
        </div>
        <OnboardingTour />
      </GuideProvider>
    </LayerProvider>
  )
}
