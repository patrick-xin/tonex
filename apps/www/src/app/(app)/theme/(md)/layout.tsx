import { TopNav } from '@/components/shared/top-nav'
import { MdRail, MdRailDrawer } from '@/features/md-rail'
import { LayerProvider } from '@/lib/layer-context'
import { MdNavTabs } from './_md-nav-tabs'

export default function MdThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="md">
      <div className="flex h-dvh overflow-hidden">
        <MdRail />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-2">
          <TopNav>
            <MdRailDrawer />
          </TopNav>
          <MdNavTabs />
          <div className="flex-1 min-h-0 overflow-y-auto p-4 mask-[linear-gradient(to_bottom,transparent,black_1.6rem,black_calc(100%-1.2rem),transparent)]">
            {children}
          </div>
        </div>
      </div>
    </LayerProvider>
  )
}
