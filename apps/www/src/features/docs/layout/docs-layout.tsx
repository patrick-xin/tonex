import type { ReactNode } from 'react'
import { cn } from 'tailwind-variants'

interface DocsLayoutProps {
  header: ReactNode
  sidebar: ReactNode
  children: ReactNode
  className?: string
}

export function DocsLayout({ header, sidebar, children, className }: DocsLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-dvh bg-surface-container-low',
        '[--header-height:56px]',
        'md:[--sidebar-width:240px] xl:[--toc-width:240px]',
        className,
      )}
    >
      <div className="h-(--header-height) shrink-0">{header}</div>
      <div
        className={cn(
          'flex-1 overflow-hidden',
          'grid',
          'grid-cols-1 md:grid-cols-[var(--sidebar-width)_1fr]',
          '[grid-template-areas:"main"] md:[grid-template-areas:"sidebar_main"]',
        )}
      >
        {sidebar}
        <main
          data-scroll-container
          className="[grid-area:main] overflow-y-auto rounded-xl sm:m-4 sm:mt-0 sm:ml-0 bg-surface shadow-lg dark:shadow-sm"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
