import { cn } from 'tailwind-variants'
import { RailFooter } from '@/components/shared/rail-footer'
import { SnapDrawer } from '@/components/shared/snap-drawer'
import { ShadcnRailContent } from './rail-content'

export function ShadcnRail() {
  return (
    <aside
      className={cn(
        'w-64 lg:w-80 m-2 overflow-hidden rounded-2xl hidden sm:flex flex-col shadow-sm bg-surface-container px-2',
      )}
    >
      <ShadcnRailContent />
      <RailFooter />
    </aside>
  )
}

export function ShadcnRailDrawer() {
  return (
    <SnapDrawer>
      <ShadcnRailContent />
    </SnapDrawer>
  )
}
