'use client'

import { GithubLogoIcon, XLogoIcon } from '@phosphor-icons/react/ssr'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerDragHandle,
  DrawerHeader,
  DrawerPopup,
  DrawerPortal,
  DrawerSelectable,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
} from '@/components/ui/drawer'
import { ScrollAreaContent, ScrollAreaRoot, ScrollAreaViewport } from '@/components/ui/scroll-area'
import { SiteLogo } from './chrome/site-logo'
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
      <DrawerPortal>
        <DrawerBackdrop />
        <DrawerViewport>
          <ScrollAreaRoot
            className="h-full overscroll-contain transition-[transform,translate] duration-600 ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-[starting-style]:translate-y-[100dvh] group-data-[ending-style]:pointer-events-none"
            style={{ position: undefined }}
          >
            <ScrollAreaViewport className="h-full overscroll-contain touch-auto">
              <ScrollAreaContent className="flex min-h-full items-end justify-center pt-8 md:py-16 md:px-16">
                <DrawerPopup className="w-full max-w-[42rem] outline-none transition-transform duration-800 ease-[cubic-bezier(0.45,1.005,0,1.005)] [transform:translateY(var(--drawer-swipe-movement-y))] data-[swiping]:select-none data-[ending-style]:[transform:translateY(calc(max(100dvh,100%)+2px))] data-[ending-style]:duration-350 data-[ending-style]:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] rounded-t-2xl md:rounded-xl">
                  <nav
                    aria-label="Navigation"
                    className="relative flex flex-col bg-surface px-4 pt-4 pb-6 outline outline-outline-variant transition-shadow duration-350 ease-[cubic-bezier(0.375,0.015,0.545,0.455)] rounded-t-2xl md:rounded-xl"
                  >
                    <DrawerDragHandle className="mb-4" />
                    <DrawerSelectable className="w-full">
                      <DrawerHeader>
                        <DrawerTitle className="sr-only">Menu</DrawerTitle>
                      </DrawerHeader>
                      <ul className="grid list-none gap-1 pb-4">
                        {ITEMS.map((item) => {
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
                        <SiteLogo />
                        <div className="flex items-center">
                          <ThemeModeToggle />
                          <Button variant="ghost" size="icon-sm" aria-label="GitHub">
                            <GithubLogoIcon
                              className="size-5 text-on-surface-variant"
                              weight="fill"
                            />
                          </Button>
                          <Button variant="ghost" size="icon-sm" aria-label="X">
                            <XLogoIcon className="size-5 text-on-surface-variant" weight="fill" />
                          </Button>
                        </div>
                      </div>
                    </DrawerSelectable>
                  </nav>
                </DrawerPopup>
              </ScrollAreaContent>
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        </DrawerViewport>
      </DrawerPortal>
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
  for (const { href } of ITEMS) {
    const hit =
      href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
    if (hit && (match === null || href.length > match.length)) match = href
  }
  return match
}

const ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/theme', label: 'MD3' },
  { href: '/theme/shadcn', label: 'Shadcn' },
  { href: '/about', label: 'About' },
  { href: '/roadmap', label: 'Roadmap' },
] as const
