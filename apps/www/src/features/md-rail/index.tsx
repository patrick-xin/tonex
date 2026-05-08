import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomColorList } from '@/features/custom-colors'
import { FineTuneColors } from '@/features/palette-override'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SourceColorTabs } from '@/features/source-color'
import { SurfaceAdjustment } from '@/features/surface-adjustment'

export function MdRail() {
  return (
    <aside
      className={cn(
        'w-80 h-[calc(100dvh-80px)] xl:h-[calc(100dvh-16px)] my-auto ml-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container px-2',
      )}
    >
      <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
        <SourceColorTabs />
        <AnimatedCollapsible defaultOpen variant="ghost" title="Scheme Variant" height={0}>
          <SchemeVariantsToggle />
        </AnimatedCollapsible>
        <AnimatedCollapsible defaultOpen variant="ghost" title="Fine Tune Palette" height={0}>
          <FineTuneColors />
        </AnimatedCollapsible>
        <CustomColorList />
        <SurfaceAdjustment />
      </ScrollArea>
    </aside>
  )
}
