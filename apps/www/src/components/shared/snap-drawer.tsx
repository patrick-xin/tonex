'use client'

import {
  Drawer,
  DrawerDragHandle,
  DrawerSelectable,
  DrawerTitle,
  SnapDrawerContent,
} from '@/components/ui/drawer'
import { railDrawerHandle } from '@/lib/handles'

const DRAWER_TOP_MARGIN_REM = 1
const DRAWER_SNAP_POINTS_REM = [30]
const drawerSnapPoints = [
  ...DRAWER_SNAP_POINTS_REM.map((h) => `${h + DRAWER_TOP_MARGIN_REM}rem`),
  1,
]

// why: trigger-less by design. The "Build theme" trigger lives in the mobile
// action bar (features/mobile-action-bar) and opens this drawer through
// railDrawerHandle, so the content can be mounted by the layout independently
// of where the button sits (issue #142).
export function SnapDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer handle={railDrawerHandle} snapPoints={drawerSnapPoints}>
      <SnapDrawerContent
        className="h-[calc(100dvh-var(--drawer-snap-top-margin))]"
        style={{ '--drawer-snap-top-margin': `${DRAWER_TOP_MARGIN_REM}rem` } as React.CSSProperties}
      >
        <DrawerDragHandle className="my-4 touch-none shrink-0" />
        <DrawerTitle className="sr-only">Build theme</DrawerTitle>
        <DrawerSelectable className="min-h-0 flex-1 flex flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </DrawerSelectable>
      </SnapDrawerContent>
    </Drawer>
  )
}
