import { MdRail } from '@/features/md-rail'
import { LayerProvider } from '@/lib/layer-context'
import { MdNavTabs } from './_md-nav-tabs'

export default function MdThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="md">
      <div className="flex min-h-0 size-full gap-2 overflow-hidden relative">
        <MdRail />
        <div className="flex-1 flex flex-col h-[calc(100dvh-80px)] xl:h-[calc(100dvh-16px)] overflow-hidden">
          <MdNavTabs />
          {children}
        </div>
      </div>
    </LayerProvider>
  )
}
