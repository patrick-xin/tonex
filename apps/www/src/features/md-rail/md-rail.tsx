import { cn } from 'tailwind-variants'
import { RailFooter } from '@/components/shared/rail-footer'
import { SnapDrawer } from '@/components/shared/snap-drawer'
import { MdRailContent } from './rail-content'

export function MdRail() {
  return (
    <aside
      className={cn(
        'w-64 lg:w-80 h-[calc(100dvh-16px)] my-auto ml-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container px-2',
      )}
    >
      <MdRailContent />
      <RailFooter />
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
