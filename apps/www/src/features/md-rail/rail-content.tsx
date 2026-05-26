import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ChartPaletteToggle } from '@/features/chart-palette'
import { ContrastLevelSlider } from '@/features/contrast-level'
import { CustomColorList } from '@/features/custom-colors'
import { FineTuneColors } from '@/features/palette-override'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SourceColorTabs } from '@/features/source-color'
import { SurfaceAdjustment } from '@/features/surface-adjustment'

export function MdRailContent() {
  return (
    <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0 w-full max-w-4xl mx-auto">
      <div className="space-y-1">
        <SourceColorTabs />
        <AnimatedCollapsible variant="ghost" title="Scheme Variant">
          <SchemeVariantsToggle />
        </AnimatedCollapsible>
        <AnimatedCollapsible variant="ghost" title="Palette Override">
          <FineTuneColors />
        </AnimatedCollapsible>
        <SurfaceAdjustment />
        <AnimatedCollapsible variant="ghost" title="Refinements" contentClassName="px-0 space-y-1">
          <div className="p-2">
            <ContrastLevelSlider />
          </div>
          <Separator className="opacity-20 mx-2" />
          <div className="p-2">
            <ChartPaletteToggle />
          </div>
        </AnimatedCollapsible>
        <CustomColorList />
      </div>
    </ScrollArea>
  )
}
