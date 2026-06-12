'use client'

import type { TOCItemType } from 'fumadocs-core/toc'
import { useEffect, useState } from 'react'
import { cn } from 'tailwind-variants'
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from '@/components/ui/preview-card'

export type TOCMinimapProps = {
  items: TOCItemType[]
  className?: string
}

export function DocsToc({ items, className }: TOCMinimapProps) {
  const itemIds = items.map((item) => item.url.replace('#', ''))
  const activeHeading = useActiveHeading(itemIds)

  if (!items.length) {
    return null
  }

  return (
    <nav aria-label="Table of contents" className={cn('w-fit', className)}>
      <PreviewCard>
        <PreviewCardTrigger
          delay={100}
          render={
            <div className="flex max-h-[50dvh] flex-col gap-3 overflow-y-scroll py-4 pl-8 opacity-100 data-popup-open:opacity-0 transition-opacity duration-200">
              {items.map((item) => (
                <div
                  key={item.url}
                  data-depth={item.depth}
                  data-active={item.url === `#${activeHeading}` || undefined}
                  className={cn(
                    'h-0.5 w-8 shrink-0 rounded-xs transition-[background-color] duration-200 bg-outline-variant',
                    'data-[depth=3]:ml-2 data-[depth=3]:w-6',
                    'data-[depth=4]:ml-4 data-[depth=4]:w-4',
                    'data-active:bg-primary',
                  )}
                />
              ))}
            </div>
          }
        />
        <PreviewCardContent
          className="w-56 overflow-hidden surface-popup-blur!"
          align="start"
          alignOffset={0}
          side="left"
          sideOffset={-60}
        >
          <div className="flex max-h-[50dvh] overflow-y-auto overscroll-contain">
            <ul className="flex size-full flex-col text-sm">
              {items.map((item) => (
                <li key={item.url} className="flex py-1">
                  <a
                    href={item.url}
                    data-depth={item.depth}
                    data-active={item.url === `#${activeHeading}` || undefined}
                    className={cn(
                      'line-clamp-2 w-full transition-[color] duration-200',
                      'text-on-surface-variant hover:text-on-surface',
                      'data-[depth=3]:pl-4 data-[depth=4]:pl-6',
                      'data-active:text-primary',
                    )}
                    onClick={handleItemClick}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </PreviewCardContent>
      </PreviewCard>
    </nav>
  )
}

export function useActiveHeading(itemIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  // `itemIds` is memoized by React Compiler, so this effect re-runs only when
  // the heading set actually changes (i.e. on navigation), not on every render.
  useEffect(() => {
    // Reset on navigation so the previous page's heading doesn't stay
    // highlighted until the observer first fires on the new page.
    setActiveId(itemIds[0] ?? null)

    const root = document.querySelector<HTMLElement>('[data-scroll-container]') ?? null
    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id)
          } else {
            visible.delete(entry.target.id)
          }
        }

        // Topmost visible heading wins (document order), so the marker tracks
        // the section being read rather than whichever callback fired last.
        const topmost = itemIds.find((id) => visible.has(id))
        if (topmost) {
          setActiveId(topmost)
        }
      },
      { root, rootMargin: '0% 0% -80% 0%', threshold: 0.1 },
    )

    for (const id of itemIds) {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [itemIds])

  return activeId
}

function handleItemClick(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault()
  const url = e.currentTarget.getAttribute('href') ?? ''
  scrollToHeading(url)
}

function scrollToHeading(url: string) {
  history.pushState(null, '', url)
  document.getElementById(url.replace('#', ''))?.scrollIntoView({
    behavior: 'smooth',
  })
}
