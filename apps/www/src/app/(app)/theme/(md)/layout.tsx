import { TopNav } from '@/components/shared/top-nav'
import { MdRail, MdRailDrawer } from '@/features/md-rail'
import { MobileActionBar } from '@/features/mobile-action-bar'
import { GuideProvider, OnboardingTour } from '@/features/onboarding-guide'
import { SettingsDrawer } from '@/features/settings'
import { LayerProvider } from '@/lib/layer-context'
import { MdNavTabs } from './_md-nav-tabs'
import { mdNavConfig } from './_nav-config'

export default function MdThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="md">
      <GuideProvider>
        <div className="flex h-dvh overflow-hidden">
          <MdRail />
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-2">
            <TopNav layer="md" />
            <MdNavTabs />
            <div className="flex-1 min-h-0 overflow-y-auto p-4 mask-[linear-gradient(to_bottom,transparent,black_1.6rem,black_calc(100%-1.2rem),transparent)]">
              {children}
            </div>
            <MobileActionBar
              crossLink={mdNavConfig.crossLink}
              railDrawer={<MdRailDrawer />}
              settingsDrawer={<SettingsDrawer layer="md" />}
            />
          </div>
        </div>
        <OnboardingTour />
      </GuideProvider>
    </LayerProvider>
  )
}
