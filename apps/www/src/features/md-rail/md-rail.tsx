import { cn } from 'tailwind-variants'
import { RailFooter } from '@/components/shared/rail-footer'
import { SnapDrawer } from '@/components/shared/snap-drawer'
import { MdRailContent } from './rail-content'

export function MdRail() {
  return (
    <aside
      className={cn(
        'w-64 lg:w-80 h-[calc(100dvh-16px)] m-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container px-2 sticky top-2 self-start shrink-0',
      )}
    >
      <MdRailContent />
      <RailFooter layer="md" />
    </aside>
  )
}

export function MdRailDrawer() {
  return (
    <SnapDrawer>
      <MdRailContent />
    </SnapDrawer>
  )
}
