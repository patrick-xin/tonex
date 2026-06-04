import type React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const shimmerBorderVariants = tv({
  base: 'pointer-events-none absolute via-[color-mix(in_oklab,var(--color-primary),transparent)] via-50%',
  variants: {
    side: {
      top: 'top-0 inset-x-0 h-px w-full bg-linear-to-r from-transparent to-transparent',
      bottom: 'bottom-0 inset-x-0 h-px w-full bg-linear-to-r from-transparent to-transparent',
      left: 'left-0 inset-y-0 w-px h-full bg-linear-to-b from-transparent to-transparent',
      right: 'right-0 inset-y-0 w-px h-full bg-linear-to-b from-transparent to-transparent',
    },
  },
  defaultVariants: {
    side: 'top',
  },
})

type ShimmerBorderProps = React.ComponentProps<'div'> & VariantProps<typeof shimmerBorderVariants>

export function ShimmerBorder({ className, side, ...props }: ShimmerBorderProps) {
  return <div className={shimmerBorderVariants({ side, className })} aria-hidden {...props} />
}
