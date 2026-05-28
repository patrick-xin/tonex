import { AppShell } from '@/components/shared/app-shell'
import { TopNav } from '@/components/shared/top-nav'
import { MdRail, MdRailDrawer } from '@/features/md-rail'
import { MobileActionBar } from '@/features/mobile-action-bar'
import { GuideProvider, OnboardingTour } from '@/features/onboarding-guide'
import { SettingsDrawer } from '@/features/settings'
import { LayerProvider } from '@/lib/layer-context'
import { MdNavTabs } from './_md-nav-tabs'

export default function MdThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="md">
      <GuideProvider>
        <AppShell
          rail={<MdRail />}
          topNav={<TopNav layer="md" />}
          navTabs={<MdNavTabs />}
          mobileActionBar={
            <MobileActionBar
              railDrawer={<MdRailDrawer />}
              settingsDrawer={<SettingsDrawer layer="md" />}
            />
          }
        >
          {children}
        </AppShell>
        <OnboardingTour />
      </GuideProvider>
    </LayerProvider>
  )
}
