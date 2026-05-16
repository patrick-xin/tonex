import type * as React from 'react'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerDragHandle, DrawerTrigger, SnapDrawerContent } from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CustomColorList } from '@/features/custom-colors'
import { FineTuneColors } from '@/features/palette-override'
import { SchemeVariantsToggle } from '@/features/scheme-variant'
import { SourceColorTabs } from '@/features/source-color'
import { SurfaceAdjustment } from '@/features/surface-adjustment'

const DRAWER_TOP_MARGIN_REM = 1
const DRAWER_SNAP_POINTS_REM = [40]
const drawerSnapPoints = [
  ...DRAWER_SNAP_POINTS_REM.map((h) => `${h + DRAWER_TOP_MARGIN_REM}rem`),
  1,
]

// why: shared between the desktop aside (MdRail) and the mobile drawer
// (MdRailDrawer). Each shell owns its own scroll container; this component
// only owns the controls stack so the two shells can't drift.
function MdRailContent() {
  return (
    <>
      <SourceColorTabs />
      <AnimatedCollapsible defaultOpen variant="ghost" title="Scheme variant" height={0}>
        <SchemeVariantsToggle />
      </AnimatedCollapsible>
      <AnimatedCollapsible defaultOpen variant="ghost" title="Palette override" height={0}>
        <FineTuneColors />
      </AnimatedCollapsible>
      <CustomColorList />
      <SurfaceAdjustment />
    </>
  )
}

export function MdRail() {
  return (
    <aside
      className={cn(
        'w-64 lg:w-80 h-[calc(100dvh-16px)] my-auto ml-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container px-2',
      )}
    >
      <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0">
        <MdRailContent />
      </ScrollArea>
    </aside>
  )
}

// why: mobile-only action panel for rail content. FAB triggers a snap drawer.
// CSS-hidden on sm+ so it never competes with the desktop rail.
export function MdRailDrawer() {
  return (
    <Drawer snapPoints={drawerSnapPoints}>
      <DrawerTrigger
        render={
          <Button size="sm" className="sm:hidden" variant="fab">
            Build theme
          </Button>
        }
      />
      <SnapDrawerContent
        className="max-h-[calc(100dvh-var(--top-margin))]"
        style={{ '--top-margin': `${DRAWER_TOP_MARGIN_REM}rem` } as React.CSSProperties}
      >
        <DrawerDragHandle className="my-4" />
        <ScrollArea
          gradientScrollFade
          noScrollBar
          className="min-h-0 flex-1 touch-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
        >
          <MdRailContent />
        </ScrollArea>
      </SnapDrawerContent>
    </Drawer>
  )
}
