import type React from 'react'
import { AppShell } from '@/components/shared/app-shell'
import { TopNav } from '@/components/shared/top-nav'
import { MobileActionBar } from '@/features/mobile-action-bar'
import { GuideProvider, OnboardingTour } from '@/features/onboarding-guide'
import { SettingsDrawer } from '@/features/settings'
import { MobilePresetDrawer } from '@/features/shadcn-presets'
import { ShadcnRailDrawer } from '@/features/shadcn-rail'
import { LayerProvider } from '@/lib/layer-context'
import { ShadcnProvider } from './_provider'
import { ShadcnRailSwitcher } from './_rail'
import { ShadcnNavTabs } from './_shadcn-nav-tabs'

export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="shadcn">
      <GuideProvider>
        <AppShell
          rail={<ShadcnRailSwitcher />}
          topNav={<TopNav layer="shadcn" />}
          navTabs={<ShadcnNavTabs />}
          mobileActionBar={
            <MobileActionBar
              railDrawer={<ShadcnRailDrawer />}
              settingsDrawer={<SettingsDrawer layer="shadcn" />}
              presetDrawer={<MobilePresetDrawer />}
            />
          }
        >
          <ShadcnProvider>{children}</ShadcnProvider>
        </AppShell>
        <OnboardingTour />
      </GuideProvider>
    </LayerProvider>
  )
}
