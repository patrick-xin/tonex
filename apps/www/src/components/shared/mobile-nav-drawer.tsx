'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDragHandle,
  DrawerHeader,
  DrawerSelectable,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { NAV_LINKS } from '@/lib/site-config'
import { GitHubLink } from './chrome/github-link'
import { XLink } from './chrome/x-link'
import { ThemeModeToggle } from './theme-mode-toggle'

// why: app-level mobile navigation. TopNav mounts this `sm:hidden` drawer as the
// counterpart to the desktop rail (chrome lives in the rail above sm). Each nav
// item is wrapped in DrawerClose so tapping a link both navigates and dismisses
// the drawer in one gesture — no handle plumbing, no onClick close callbacks.
// The footer mirrors rail-footer (theme toggle + social) so the two surfaces
// stay in lockstep.
export function DrawerMobileNavigation() {
  const pathname = usePathname()
  const activeHref = pickActiveHref(pathname)
  return (
    <Drawer>
      <DrawerTrigger
        render={
          <Button size="icon-sm" variant="ghost" aria-label="Open navigation">
            <Menu />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerDragHandle className="mt-1" />
        <nav aria-label="Navigation" className="relative flex flex-col">
          <DrawerSelectable className="w-full">
            <DrawerHeader>
              <DrawerTitle className="text-left px-3">Menu</DrawerTitle>
            </DrawerHeader>
            <ul className="grid list-none gap-1 pb-4">
              {NAV_LINKS.map((item) => {
                const active = item.href === activeHref
                return (
                  <li className="flex" key={item.href}>
                    <DrawerClose
                      nativeButton={false}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-base font-medium text-on-surface-variant transition-colors hover:bg-primary/8 hover:text-on-surface',
                        active && 'bg-primary/12 text-primary',
                      )}
                      render={<Link href={item.href} />}
                    >
                      {item.label}
                    </DrawerClose>
                  </li>
                )
              })}
            </ul>
            <div className="flex items-center justify-between gap-0.5 border-t border-outline-variant/40 pt-3">
              <div className="flex items-center justify-between w-full">
                <ThemeModeToggle />
                <div className="ml-auto">
                  <XLink />
                  <GitHubLink />
                </div>
              </div>
            </div>
          </DrawerSelectable>
        </nav>
      </DrawerContent>
    </Drawer>
  )
}

// why: longest-prefix wins. /theme/shadcn would otherwise also match /theme via
// startsWith, lighting up both rows. Picking the longest matching href once
// makes nested sections (/theme → /theme/shadcn, /theme/dashboard-preview)
// resolve to a single active item. '/' only matches exactly so it doesn't win
// every comparison.
function pickActiveHref(pathname: string): string | null {
  let match: string | null = null
  for (const { href } of NAV_LINKS) {
    const hit =
      href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
    if (hit && (match === null || href.length > match.length)) match = href
  }
  return match
}
