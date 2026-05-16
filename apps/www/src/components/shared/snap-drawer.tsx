import { Button } from '@/components/ui/button'
import { Drawer, DrawerDragHandle, DrawerTrigger, SnapDrawerContent } from '@/components/ui/drawer'

const DRAWER_TOP_MARGIN_REM = 1
const DRAWER_SNAP_POINTS_REM = [40]
const drawerSnapPoints = [
  ...DRAWER_SNAP_POINTS_REM.map((h) => `${h + DRAWER_TOP_MARGIN_REM}rem`),
  1,
]

export function SnapDrawer({ children }: { children: React.ReactNode }) {
  return (
    <Drawer snapPoints={drawerSnapPoints}>
      <DrawerTrigger
        render={
          <Button className="sm:hidden" variant="fab">
            Build theme
          </Button>
        }
      />
      <SnapDrawerContent
        className="max-h-[calc(100dvh-var(--top-margin))]"
        style={{ '--top-margin': `${DRAWER_TOP_MARGIN_REM}rem` } as React.CSSProperties}
      >
        <DrawerDragHandle className="my-4" />
        <div className="min-h-0 flex-1 flex flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </div>
      </SnapDrawerContent>
    </Drawer>
  )
}
