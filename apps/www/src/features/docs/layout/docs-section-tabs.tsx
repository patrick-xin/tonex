'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'tailwind-variants'
import { buttonStyles } from '@/components/ui/button'
import { getDocSections, pickActiveTabKey } from '../utils/doc-sections'
import { source } from '../utils/source'

// why: section switcher in the header — desktop-only (the mobile drawer already
// shows the full tree). Route-derived active state mirrors the sidebar's active
// token treatment so the header tab and the lit sidebar group read as one.
export function DocsSectionTabs({ className }: { className?: string }) {
  const pathname = usePathname()
  const { tabs } = getDocSections(source.pageTree)
  const activeKey = pickActiveTabKey(pathname, tabs)

  return (
    <nav
      aria-label="Documentation sections"
      className={cn('hidden md:flex items-center gap-4 flex-1 ml-48', className)}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          data-active={tab.key === activeKey || undefined}
          className={buttonStyles({
            variant: 'ghost',
            size: 'sm',
            className:
              'text-on-surface-variant hover:bg-transparent active:bg-transparent hover:text-on-surface data-active:text-on-surface',
          })}
        >
          <tab.icon className="size-4" />
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}
