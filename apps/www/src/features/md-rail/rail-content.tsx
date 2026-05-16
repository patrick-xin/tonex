import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomColorList } from '@/features/custom-colors'
import { FineTuneColors } from '@/features/palette-override'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SourceColorTabs } from '@/features/source-color'
import { SurfaceAdjustment } from '@/features/surface-adjustment'

export function MdRailContent() {
  return (
    <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
      <SourceColorTabs />
      <AnimatedCollapsible defaultOpen variant="ghost" title="Scheme variant" height={0}>
        <SchemeVariantsToggle />
      </AnimatedCollapsible>
      <AnimatedCollapsible defaultOpen variant="ghost" title="Palette override" height={0}>
        <FineTuneColors />
      </AnimatedCollapsible>
      <CustomColorList />
      <SurfaceAdjustment />
    </ScrollArea>
  )
}
