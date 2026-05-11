import { MdRail } from '@/features/md-rail'
import { LayerProvider } from '@/lib/layer-context'
import { MdNavTabs } from './_md-nav-tabs'

export default function MdThemeLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayerProvider value="md">
      <MdRail />
      <div className="flex-1 flex flex-col h-[calc(100dvh-80px)] xl:h-screen overflow-hidden px-2">
        <MdNavTabs />
        <div className="p-2 overflow-auto">{children}</div>
      </div>
    </LayerProvider>
  )
}
