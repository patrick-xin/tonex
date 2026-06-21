'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'tailwind-variants'
import { DrawerClose } from '@/components/ui/drawer'
import { NAV_LINKS } from '@/lib/site-config'

// why: site-level shortcuts appended below the docs tree in the mobile drawer.
// Mirrors mobile-nav-drawer's pattern — each row is a DrawerClose render={Link}
// so tapping both navigates and dismisses. Longest-prefix active match so nested
// routes (/theme → /theme/shadcn) light a single row; '/' only matches exactly.
export function DocsNavLinks({ className }: { className?: string }) {
  const pathname = usePathname()
  const activeHref = pickActiveHref(pathname)
  return (
    <div className={cn(className)}>
      <ul className="grid list-none gap-1">
        {NAV_LINKS.map((item) => {
          const active = item.href === activeHref
          return (
            <li className="flex" key={item.href}>
              <DrawerClose
                nativeButton={false}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'w-full rounded-md px-4 py-2 text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-primary/8 hover:text-on-surface',
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
    </div>
  )
}

function pickActiveHref(pathname: string): string | null {
  let match: string | null = null
  for (const { href } of NAV_LINKS) {
    const hit =
      href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
    if (hit && (match === null || href.length > match.length)) match = href
  }
  return match
}
