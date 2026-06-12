'use client'

import type { Item } from 'fumadocs-core/page-tree'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from 'tailwind-variants'
import { GitHubLink } from '@/components/shared/chrome/github-link'
import { XLink } from '@/components/shared/chrome/x-link'
import { buttonStyles } from '@/components/ui/button'

interface DocsArticleFooterProps {
  neighbours: {
    previous?: Item
    next?: Item
  }
}

export const DocsArticleFooter = ({ neighbours }: DocsArticleFooterProps) => {
  const hasNext = neighbours.next
  const hasPrevious = neighbours.previous
  return (
    <div className="space-y-10 lg:space-y-16 py-6 lg:py-20">
      <nav
        aria-label="Previous and next pages"
        className={cn(
          'sm:flex hidden items-center gap-4 justify-between',
          hasNext && hasPrevious
            ? 'justify-between'
            : hasPrevious
              ? 'justify-start'
              : 'justify-end',
        )}
      >
        {neighbours.previous && (
          <Link
            className={cn(
              buttonStyles({
                variant: 'outline',
              }),
              'not-prose flex flex-col items-start h-20',
              hasNext ? 'flex-1' : 'w-1/2',
            )}
            href={neighbours.previous.url}
            prefetch={false}
          >
            <span className="text-base">{neighbours.previous.name}</span>
            <span className="text-on-surface-variant inline-flex items-center">
              <ChevronLeft className="mr-2 size-4 mt-0.5" /> <span>Previous</span>
            </span>
          </Link>
        )}

        {neighbours.next && (
          <Link
            className={cn(
              buttonStyles({
                variant: 'outline',
              }),
              'not-prose flex flex-col items-end h-20',
              hasPrevious ? 'flex-1' : 'w-1/2',
            )}
            href={neighbours.next.url}
            prefetch={false}
          >
            <span className="text-base">{neighbours.next.name}</span>
            <span className="text-on-surface-variant inline-flex items-center">
              <span>Next</span> <ChevronRight className="ml-2 size-4 mt-0.5" />
            </span>
          </Link>
        )}
      </nav>
      <footer className="pt-12 border-t border-outline-variant/60 flex items-center gap-1">
        <GitHubLink />
        <XLink />
      </footer>
    </div>
  )
}
