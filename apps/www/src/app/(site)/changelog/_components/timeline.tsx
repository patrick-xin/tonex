import type * as React from 'react'
import { cn } from 'tailwind-variants'

function Timeline({
  children,
  className,
  side = 'alternate',
  ...props
}: React.ComponentProps<'ul'> & {
  side?: 'left' | 'right' | 'alternate'
}) {
  return (
    <ul
      className={cn(
        'group/timeline relative flex list-none flex-col gap-6 md:-mt-4 md:gap-8 md:py-8',
        'before:absolute before:top-2 before:bottom-2 before:left-2 before:w-px',
        "before:bg-[linear-gradient(to_bottom,transparent,var(--color-outline-variant)_1rem,var(--color-outline-variant)_calc(100%-1rem),transparent)] before:content-['']",
        'md:before:top-0 md:before:bottom-0 md:before:left-1/2 md:before:-translate-x-1/2',
        'md:before:bg-[linear-gradient(to_bottom,transparent,var(--color-outline-variant)_2.5rem,var(--color-outline-variant)_calc(100%-2.5rem),transparent)]',
        className,
      )}
      data-side={side}
      data-slot="timeline"
      {...props}
    >
      {children}
    </ul>
  )
}

function TimelineItem({
  children,
  className,
  glowOnHover = true,
  ...props
}: React.ComponentProps<'li'> & {
  glowOnHover?: boolean
}) {
  return (
    <li
      className={cn(
        'group/item relative pl-10 [--timeline-anchor:1.625rem] md:grid md:grid-cols-2 md:items-start md:gap-24 md:pl-0',
        'before:absolute before:left-2 before:z-10 before:h-2.5 before:w-2.5 before:-translate-x-1/2',
        "before:rounded-full before:border before:border-outline-variant before:bg-surface before:content-['']",
        'before:top-[calc(var(--timeline-anchor)-0.3125rem)] md:before:left-1/2 md:before:h-3 md:before:w-3 md:before:top-[calc(var(--timeline-anchor)-0.375rem)]',
        "md:after:absolute md:after:top-[var(--timeline-anchor)] md:after:h-px md:after:w-12 md:after:bg-linear-to-r md:after:from-primary/80 md:after:to-transparent md:after:content-['']",
        'group-data-[side=alternate]/timeline:odd:md:after:right-1/2 group-data-[side=alternate]/timeline:odd:md:after:bg-linear-to-l',
        'group-data-[side=alternate]/timeline:even:md:after:left-1/2 group-data-[side=alternate]/timeline:even:md:after:bg-linear-to-r',
        'group-data-[side=right]/timeline:md:after:left-1/2 group-data-[side=right]/timeline:md:after:bg-linear-to-r',
        'group-data-[side=left]/timeline:md:after:right-1/2 group-data-[side=left]/timeline:md:after:bg-linear-to-l',
        'group-data-[side=alternate]/timeline:odd:[&>*]:md:col-start-1',
        'group-data-[side=alternate]/timeline:even:[&>*]:md:col-start-2',
        'group-data-[side=right]/timeline:[&>*]:md:col-start-2',
        'group-data-[side=left]/timeline:[&>*]:md:col-start-1',
        glowOnHover &&
          'before:transition-all before:duration-300 has-[[data-slot=timeline-card]:hover]:before:bg-primary has-[[data-slot=timeline-card]:hover]:before:border-primary has-[[data-slot=timeline-card]:hover]:before:shadow-[0_0_12px_var(--color-primary)]',
        className,
      )}
      data-slot="timeline-item"
      {...props}
    >
      {children}
    </li>
  )
}

function TimelineCard({
  children,
  className,
  showMobileConnector = true,
  ...props
}: React.ComponentProps<'div'> & {
  showMobileConnector?: boolean
}) {
  return (
    <div
      className={cn(
        'relative z-0 flex flex-col items-start gap-3 rounded-xl border border-outline-variant bg-surface-container p-4 shadow-sm',
        showMobileConnector
          ? "before:absolute before:top-[var(--timeline-anchor)] before:right-full before:h-px before:w-7 before:bg-linear-to-l before:from-primary/80 before:to-transparent before:content-[''] md:before:hidden"
          : '',
        className,
      )}
      data-slot="timeline-card"
      {...props}
    >
      {children}
    </div>
  )
}

function TimelineHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-3', className)} {...props} />
}

function TimelineDate({ className, ...props }: React.ComponentProps<'time'>) {
  return (
    <time
      className={cn(
        'text-xs leading-tight tracking-normal text-on-surface-variant text-left',
        className,
      )}
      {...props}
    />
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn('flex items-center gap-2 text-lg leading-tight font-medium', className)}
      {...props}
    />
  )
}

export { Timeline, TimelineCard, TimelineDate, TimelineHeader, TimelineItem, TimelineTitle }
