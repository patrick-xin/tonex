'use client'

import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { cn, tv, type VariantProps } from 'tailwind-variants'
import { focusVisibleRing } from './styles'

const toggleVariants = tv({
  base: [
    'group inline-flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap rounded-md transition-all border border-transparent',
    'disabled:pointer-events-none disabled:opacity-38',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    focusVisibleRing,
    'aria-invalid:ring-error aria-invalid:border-error',
    'hover:bg-primary/8 data-pressed:text-on-secondary-container data-pressed:bg-secondary-container data-pressed:hover:bg-secondary-container',
  ],
  variants: {
    size: {
      default: 'h-9 px-2 min-w-9',
      lg: 'h-10 px-2.5 min-w-10',
      sm: 'h-8 px-1.5 min-w-8',
      xs: 'h-7 px-1 min-w-7 text-xs',
    },
    variant: {
      default: 'bg-transparent',
      outline:
        'bg-transparent border border-outline-variant shadow-xs data-pressed:border-primary/12',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
})

function Toggle({
  className,
  variant,
  size,
  ...props
}: Omit<BaseToggle.Props, 'className'> &
  VariantProps<typeof toggleVariants> & {
    className?: string
  }) {
  return (
    <BaseToggle
      className={cn(toggleVariants({ className, variant, size }))}
      data-slot="toggle"
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
