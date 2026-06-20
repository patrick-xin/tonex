import type { ComponentProps } from 'react'
import { cn } from 'tailwind-variants'

export function DocsSidebar({ className, children, ...props }: ComponentProps<'aside'>) {
  return (
    <aside
      className={cn(
        '[grid-area:sidebar] h-full',
        'hidden md:flex md:flex-col',
        'overflow-y-auto overflow-x-hidden no-scrollbar',
        'bg-surface-container-low mask-[linear-gradient(to_bottom,transparent,black_1.6rem,black_calc(100%-1rem),transparent)] pb-12',
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  )
}
