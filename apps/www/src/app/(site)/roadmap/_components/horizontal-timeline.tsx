import type * as React from 'react'
import { cn } from 'tailwind-variants'

function HorizontalTimeline({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('relative w-full overflow-hidden py-12 sm:py-24', className)}
      data-slot="horizontal-timeline"
      {...props}
    >
      {/* Edge fading masks */}
      <div className="absolute left-0 top-0 bottom-0 hidden w-24 bg-linear-to-r from-surface via-surface/70 to-transparent pointer-events-none z-30 sm:block" />
      <div className="absolute right-0 top-0 bottom-0 hidden w-24 bg-linear-to-l from-surface via-surface/70 to-transparent pointer-events-none z-30 sm:block" />

      {/* Horizontally scrollable container */}
      <div className="overflow-x-auto no-scrollbar snap-x snap-mandatory py-4">
        {/* Inner container to hold items and standard track line */}
        <div className="relative flex flex-row items-stretch justify-start min-w-max min-h-96 sm:px-24">
          {/* Continuous center horizontal timeline track line */}
          <div className="absolute left-0 right-0 h-px top-1/2 -translate-y-1/2 bg-linear-to-r from-primary/10 via-primary/50 to-primary/10 z-0" />
          {children}
        </div>
      </div>
    </div>
  )
}

function HorizontalTimelineItem({
  children,
  className,
  position = 'top',
  ...props
}: React.ComponentProps<'div'> & {
  position?: 'top' | 'bottom'
}) {
  return (
    <div
      className={cn(
        'relative grid w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] min-h-96 grid-rows-[minmax(max-content,1fr)_minmax(max-content,1fr)] snap-center group/item sm:w-80 sm:min-w-80',
        className,
      )}
      data-slot="horizontal-timeline-item"
      data-position={position}
      {...props}
    >
      {/* Central Axis Node / Dot */}
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
          'h-2.5 w-2.5 rounded-full bg-surface transition-all duration-300',
          'border border-outline-variant group-hover/item:bg-primary group-hover/item:border-primary group-hover/item:shadow-[0_0_12px_var(--color-primary)]',
        )}
      />

      {position === 'top' ? (
        <>
          <div className="row-start-1 flex flex-col justify-end items-center pb-18 z-10">
            <div className="flex flex-col gap-1.5">{children}</div>
          </div>

          {/* Vertical connection line - connects directly to dot center without gaps */}
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-px h-16 bg-linear-to-t from-primary/80 to-transparent z-10 transition-all duration-300 group-hover/item:h-20 group-hover/item:from-primary" />
        </>
      ) : (
        <>
          {/* Vertical connection line - connects directly to dot center without gaps */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-px h-16 bg-linear-to-b from-primary/80 to-transparent z-10 transition-all duration-300 group-hover/item:h-20 group-hover/item:from-primary" />

          <div className="row-start-2 flex flex-col justify-start items-center pt-18 z-10">
            <div className="flex flex-col gap-1.5">{children}</div>
          </div>
        </>
      )}
    </div>
  )
}

function HorizontalTimelineTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn(
        'text-sm sm:text-base md:text-lg font-semibold leading-snug tracking-tight transition-colors duration-200 text-on-surface-variant group-hover/item:text-on-surface',
        className,
      )}
      data-slot="horizontal-timeline-title"
      {...props}
    />
  )
}

function HorizontalTimelineDate({ className, ...props }: React.ComponentProps<'time'>) {
  return (
    <time
      className={cn('text-xs leading-none text-on-surface-variant', className)}
      data-slot="horizontal-timeline-date"
      {...props}
    />
  )
}

export {
  HorizontalTimeline,
  HorizontalTimelineDate,
  HorizontalTimelineItem,
  HorizontalTimelineTitle,
}
