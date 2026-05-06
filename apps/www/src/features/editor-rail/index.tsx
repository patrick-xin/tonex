import { cn } from 'tailwind-variants'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatedCollapsible } from './animated-collapsible'
import { CustomColorList } from './custom-color/custom-color-list'
import { SchemeVariantsToggle } from './scheme-variants-toggle'
import { SourceColorTabs } from './source-color-tabs'
import { SurfaceAdjustment } from './surface-adjustment'

export function EditorRail() {
  return (
    <aside
      className={cn(
        'w-72 h-[calc(100dvh-80px)] xl:h-[calc(100dvh-16px)] my-auto ml-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container',
      )}
    >
      <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
        <div className="py-3">
          <SourceColorTabs />
        </div>
        <AnimatedCollapsible defaultOpen variant="ghost" title="Scheme Variant" height={0}>
          <SchemeVariantsToggle />
        </AnimatedCollapsible>
        <CustomColorList />
        <div className="p-2">
          <SurfaceAdjustment />
        </div>
      </ScrollArea>
    </aside>
  )
}
