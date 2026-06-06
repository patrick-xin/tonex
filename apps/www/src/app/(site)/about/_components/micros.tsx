import { cn } from 'tailwind-variants'

export function Bracket({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const isTop = corner[0] === 't'
  const isLeft = corner[1] === 'l'
  const y = isTop ? 'top-0' : 'bottom-0'
  const x = isLeft ? 'left-0' : 'right-0'
  return (
    <div aria-hidden className={`pointer-events-none absolute ${y} ${x} size-7`}>
      <span className={`absolute ${y} ${x} h-px w-full bg-outline-variant/50`} />
      <span className={`absolute ${y} ${x} h-full w-px bg-outline-variant/50`} />
    </div>
  )
}

export function Crosshair({
  className,
  crossClassName,
}: {
  className?: string
  crossClassName?: string
}) {
  return (
    <span aria-hidden className={cn('relative block size-4 shrink-0', className)}>
      <span
        className={cn(
          'absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-outline transition-all',
          crossClassName,
        )}
      />
      <span
        className={cn(
          'absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-outline transition-all',
          crossClassName,
        )}
      />
      <span
        className={cn(
          'absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-outline transition-colors',
          crossClassName,
        )}
      />
      <span
        className={cn(
          'absolute right-0 top-1/2 h-px w-2 -translate-y-1/2 bg-outline transition-colors',
          crossClassName,
        )}
      />
    </span>
  )
}
