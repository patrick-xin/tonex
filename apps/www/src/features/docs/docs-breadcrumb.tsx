'use client'

import { useBreadcrumb } from 'fumadocs-core/breadcrumb'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import { DocsNav } from './layout/docs-nav'
import { source } from './utils/source'

export function DocBreadcrumb() {
  const pathname = usePathname()
  const items = useBreadcrumb(pathname, source.pageTree, {
    includePage: true,
    includeRoot: true,
  })

  return (
    <div className="bg-surface-container-low rounded-none flex items-center gap-2 h-10 px-2 sticky top-0 z-50 md:hidden">
      <DocsNav />
      <div className="flex flex-row items-center gap-1 text-sm font-medium">
        {items.map((item, i) => (
          <Fragment key={String(i)}>
            {i !== 0 && (
              <ChevronRight className="size-4 shrink-0 rtl:rotate-180 mt-0.5 text-on-surface-variant" />
            )}
            {item.url && item.url !== pathname ? (
              <Link
                href={item.url}
                className="truncate hover:text-on-surface text-on-surface-variant"
              >
                {item.name}
              </Link>
            ) : (
              <span className="truncate text-on-surface-variant">{item.name}</span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
